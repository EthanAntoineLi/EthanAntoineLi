/* AI question maker:
   - ESAT units: multiple-choice questions, checked by having the model re-solve each one blind.
   - A-level units: exam-style written questions with full mark schemes, checked by a second-examiner pass.
   Also imports your own questions (screenshots / pasted text, with mark schemes) and builds AI papers. */
(function () {
  const V = {};
  const BATCH_MCQ = 5, BATCH_W = 3;
  const isEsat = (unitId) => Courses.unit(unitId) && Courses.unit(unitId).course === 'esat';

  function unitOptions(selected) {
    const mine = new Set(Store.studyUnits(['current', 'done', 'later']));
    return Courses.all().map((c) => {
      const units = c.units.filter((u) => mine.has(u.id) || (c.kind === 'esat' && Store.esatOn()));
      const others = c.units.filter((u) => !units.includes(u));
      const opt = (u, tag) => `<option value="${u.id}" ${u.id === selected ? 'selected' : ''}>${U.esc(U.moduleName(u.id))}${tag}</option>`;
      return `<optgroup label="${U.esc(c.name)}">${units.map((u) => opt(u, '')).join('')}${others.map((u) => opt(u, ' (not yours)')).join('')}</optgroup>`;
    }).join('');
  }

  V.render = (el, { params }) => {
    const preSpecs = params.specs ? params.specs.split(',').filter((c) => Bank.specInfo(c)) : [];
    let module = params.module || (preSpecs[0] && Bank.specInfo(preSpecs[0]).module) || Store.studyUnits(['current'])[0] || Store.studyUnits(['done'])[0] || 'maths1';
    let tab = params.tab || 'make';
    const selected = new Set(preSpecs.filter((k) => Bank.specInfo(k).module === module));
    let results = [];
    let running = false, stopFlag = false;

    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>AI question maker</h1><p>Unlimited practice on exactly the spec points you need, made by your own AI model: exam-style written questions with mark schemes for A-level units, multiple choice for the ESAT. Every question can be double-checked by a second pass.</p></div>
        <div class="seg"><button data-tab="make">Make questions</button><button data-tab="import">Import your own</button><button data-tab="paper">AI practice paper</button></div></div>
      ${!AI.isConfigured() ? '<div class="notice warn" style="margin-bottom:14px">Connect an AI model in <a href="#/settings">Settings</a> to use this.</div>' : ''}
      <div data-body></div>
      <div data-progress class="hidden card" style="margin-top:14px"><div class="row between"><h3 style="margin:0" data-ptitle>Working…</h3><button class="btn sm danger" data-stop>Stop</button></div><div class="log" data-log style="margin-top:10px"></div></div>
      <div data-results style="margin-top:14px"></div>
    </div>`;
    const body = U.$('[data-body]', el), logEl = U.$('[data-log]', el), prog = U.$('[data-progress]', el), resEl = U.$('[data-results]', el);
    const log = (t) => { logEl.textContent += t + '\n'; logEl.scrollTop = logEl.scrollHeight; };
    U.$('[data-stop]', el).onclick = () => { stopFlag = true; log('Stopping after the current request…'); };
    U.$$('[data-tab]', el).forEach((b) => b.onclick = () => { if (!running) { tab = b.dataset.tab; draw(); } });

    function draw() {
      U.$$('[data-tab]', el).forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
      if (tab === 'make') drawMake();
      else if (tab === 'import') drawImport();
      else drawPaper();
    }

    /* ---------------- make ---------------- */
    function drawMake() {
      const mod = Courses.unit(module);
      const st = Bank.stats().spec;
      const counts = Bank.countBySpec();
      const esat = isEsat(module);
      body.innerHTML = `<div class="split">
        <div class="card">
          <div class="row between"><h3 style="margin:0">1. Spec points</h3>
            <select data-module style="width:auto;max-width:100%">${unitOptions(module)}</select></div>
          <div class="row" style="margin:10px 0"><span class="muted" style="font-size:13px">Quick pick:</span>
            <button class="btn sm" data-pick="weak">My weakest</button><button class="btn sm" data-pick="few">Fewest questions</button><button class="btn sm" data-pick="untried">Not tried yet</button><button class="btn sm ghost" data-pick="none">Clear</button></div>
          <div style="max-height:440px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:6px 10px">
          ${mod.sections.map((sec) => `<div style="margin:8px 0 4px"><label class="check" style="font-weight:700"><input type="checkbox" data-sec="${U.esc(sec.key)}"> ${U.esc(sec.code)}. ${U.esc(sec.title)}</label></div>
            ${sec.points.map((p) => `<label class="check" style="margin-left:22px;font-weight:400;font-size:14px" title="${U.esc(p.text)}"><input type="checkbox" data-spec="${U.esc(p.key)}" ${selected.has(p.key) ? 'checked' : ''}>
              <span><b>${U.esc(p.code)}</b> ${U.esc(p.title)} <small>· ${counts[p.key] || 0} Qs${st[p.key] ? ` · ${U.pct(st[p.key].acc)}` : ''}</small></span></label>`).join('')}`).join('')}
          </div>
          <div class="muted" style="font-size:13px;margin-top:6px" data-selcount></div>
        </div>
        <div class="card">
          <h3>2. Settings</h3>
          <div class="field"><label>How many questions</label><input type="number" data-count min="1" max="60" value="${esat ? 10 : 4}" style="max-width:120px"><span class="hint">${esat ? 'Multiple choice' : 'Written, exam-style, with mark schemes'} · made in batches of ${esat ? BATCH_MCQ : BATCH_W}.</span></div>
          <div class="field"><label>Difficulty</label><select data-diff><option value="mixed">Typical (mixed)</option><option value="easy">Easier</option><option value="hard">Hard</option></select></div>
          <div class="field"><label class="check"><input type="checkbox" data-verify checked> Double-check each question (one extra request each)</label>
            <span class="hint">${esat ? 'The model re-solves each question blind; disagreements are flagged.' : 'A second examiner pass checks the answers and that the marks add up; problems are flagged.'}</span></div>
          <button class="btn primary lg block" data-go ${AI.isConfigured() ? '' : 'disabled'}>✚ Make questions</button>
          <p class="muted" style="font-size:12.5px;margin-top:10px">Uses your API credit. AI-made questions can contain mistakes – they're labelled "AI-made", and you can edit or hide any of them.</p>
        </div></div>`;
      const updateCount = () => { U.$('[data-selcount]', body).textContent = selected.size ? `${selected.size} spec point${selected.size === 1 ? '' : 's'} selected` : 'Nothing selected – questions will be spread across the whole unit.'; };
      updateCount();
      U.$('[data-module]', body).onchange = (e) => { module = e.target.value; selected.clear(); drawMake(); };
      U.$$('[data-spec]', body).forEach((cb) => cb.onchange = () => { cb.checked ? selected.add(cb.dataset.spec) : selected.delete(cb.dataset.spec); updateCount(); });
      U.$$('[data-sec]', body).forEach((cb) => cb.onchange = () => {
        Courses.section(cb.dataset.sec).points.forEach((p) => { cb.checked ? selected.add(p.key) : selected.delete(p.key); });
        U.$$('[data-spec]', body).forEach((x) => { x.checked = selected.has(x.dataset.spec); }); updateCount();
      });
      U.$$('[data-pick]', body).forEach((b) => b.onclick = () => {
        const pts = Courses.points(module).map((p) => p.key);
        selected.clear();
        if (b.dataset.pick === 'weak') Bank.weakest([module], 6).forEach((w) => selected.add(w.code));
        if (b.dataset.pick === 'few') pts.slice().sort((a, c) => (counts[a] || 0) - (counts[c] || 0)).slice(0, 6).forEach((c) => selected.add(c));
        if (b.dataset.pick === 'untried') pts.filter((c) => !st[c]).slice(0, 8).forEach((c) => selected.add(c));
        if (b.dataset.pick === 'weak' && !selected.size) U.toast('Not enough data yet for weak spots – try "Fewest questions"');
        U.$$('[data-spec]', body).forEach((x) => { x.checked = selected.has(x.dataset.spec); }); updateCount();
      });
      U.$('[data-go]', body).onclick = async () => {
        const count = U.clamp(parseInt(U.$('[data-count]', body).value, 10) || 4, 1, 60);
        const specs = selected.size ? [...selected] : Courses.points(module).map((p) => p.key);
        const qs = await makeQuestions({ module, specs, count, difficulty: U.$('[data-diff]', body).value, verify: U.$('[data-verify]', body).checked });
        showResults(qs, 'ai');
      };
    }

    async function makeQuestions({ module, specs, count, difficulty, verify, quiet }) {
      const esat = isEsat(module);
      const BATCH = esat ? BATCH_MCQ : BATCH_W;
      running = true; stopFlag = false;
      prog.classList.remove('hidden'); logEl.textContent = ''; resEl.innerHTML = '';
      U.$('[data-ptitle]', el).textContent = `Making ${count} ${U.moduleName(module)} question${count === 1 ? '' : 's'}…`;
      const out = [];
      const shuffled = U.shuffle(specs);
      let cursor = 0;
      const batches = Math.ceil(count / BATCH);
      try {
        for (let b = 0; b < batches && !stopFlag; b++) {
          const n = Math.min(BATCH, count - out.length);
          if (n <= 0) break;
          const batchSpecs = [];
          for (let k = 0; k < Math.max(n, 2) && batchSpecs.length < Math.min(shuffled.length, n + 2); k++) batchSpecs.push(shuffled[(cursor++) % shuffled.length]);
          const uniq = [...new Set(batchSpecs)];
          const type = esat ? 'mcq' : 'written';
          const pool = Bank.all().filter((q) => q.type === type && q.module === module && q.source === 'builtin');
          const pool2 = pool.length ? pool : Bank.all().filter((q) => q.type === type && q.source === 'builtin' && q.course === Courses.unit(module).course);
          const sameSpec = pool2.filter((q) => uniq.includes(q.spec));
          const examples = U.shuffle(sameSpec.length ? sameSpec : pool2).slice(0, esat ? 2 : 1);
          if (esat && !examples.length) examples.push(...U.shuffle(Bank.all().filter((q) => q.type === 'mcq' && q.source === 'builtin')).slice(0, 1));
          const avoid = Bank.all().filter((q) => uniq.includes(q.spec)).map((q) => q.stem.replace(/\s+/g, ' ')).slice(0, 8);
          log(`Request ${b + 1}/${batches}: ${n} question${n === 1 ? '' : 's'} on ${uniq.map((k) => Bank.specLabel(k)).join(', ')}…`);
          let text = '';
          for (let attempt = 0; attempt < 2 && !text; attempt++) {
            try {
              const system = esat ? AI.prompts.generate({ module, specs: uniq, difficulty, count: n, examples, avoid })
                : AI.prompts.generateWritten({ module, specs: uniq, difficulty, count: n, examples, avoid });
              text = await AI.chat({ system, messages: [{ role: 'user', content: `Write the ${n} question${n === 1 ? '' : 's'} now.` }], effort: 'high' });
            } catch (e) { log('  ✗ ' + e.message); if (attempt === 1 || e.status === 401 || e.status === 403) throw e; }
          }
          const extra = { source: 'ai', model: AI.config().model, createdAt: Date.now() };
          const parsed = (esat ? AI.parseQuestions(text, { module, extra }) : AI.parseWrittenQuestions(text, { module, extra }))
            .map((q) => (q.module === module && q.spec ? q : Object.assign(q, { module, spec: uniq[0] })));
          parsed.forEach((q) => { if (q.type === 'written' && q.marksStated && q.marksStated !== q.marks) { q.verified = false; q.verifyNote = `The mark scheme adds up to ${q.marks}, but the question says ${q.marksStated} marks.`; } });
          log(`  ✓ got ${parsed.length} question${parsed.length === 1 ? '' : 's'}`);
          if (!parsed.length) log('  (the reply could not be parsed – the model may not have followed the format)');
          out.push(...parsed.slice(0, n));
        }
        if (verify && out.length && !stopFlag) await verifyAll(out);
      } catch (e) {
        log('Stopped: ' + e.message);
        console.warn(e);
        if (!quiet) U.toast(e.message, 'bad');
      }
      running = false;
      U.$('[data-ptitle]', el).textContent = `Done – ${out.length} question${out.length === 1 ? '' : 's'}`;
      return out;
    }

    async function verifyAll(qs) {
      log(`Checking ${qs.length} question${qs.length === 1 ? '' : 's'}…`);
      let i = 0;
      const worker = async () => {
        while (i < qs.length && !stopFlag) {
          const q = qs[i++];
          if (q.verified === false) continue;
          try {
            if (q.type === 'written') {
              const reply = AI.clean(await AI.chat({ system: 'You are a meticulous second examiner.', messages: [{ role: 'user', content: AI.prompts.verifyWritten(q) }], effort: 'high' }));
              const v = AI.parseVerdict(reply);
              q.verified = v ? v.ok : undefined;
              if (v && !v.ok) q.verifyNote = 'Second examiner: ' + (v.note || 'found a problem');
              log(`  ${v ? (v.ok ? '✓' : '⚠') : '?'} ${Bank.specLabel(q.spec)}: ${v ? (v.ok ? 'checked OK' : q.verifyNote) : 'no clear verdict'}`);
            } else {
              const reply = await AI.chat({ system: 'You are a careful solver of admissions-test questions.', messages: [{ role: 'user', content: AI.prompts.verify(q) }], effort: 'medium' });
              const got = AI.parseAnswer(AI.clean(reply));
              q.verified = got === U.letter(q.answer);
              if (!q.verified) q.verifyNote = got ? `Checker got ${got}, key says ${U.letter(q.answer)}` : 'Checker gave no clear answer';
              log(`  ${q.verified ? '✓' : '⚠'} ${Bank.specLabel(q.spec)}: ${q.verified ? 'answer confirmed' : q.verifyNote}`);
            }
          } catch (e) { log('  ? could not check: ' + e.message); }
        }
      };
      await Promise.all([worker(), worker(), worker()]);
    }

    function showResults(qs, source, after) {
      results = qs;
      if (!qs.length) { resEl.innerHTML = '<div class="card empty">No questions this time. Check the log above – a different model may follow the format better.</div>'; return; }
      resEl.innerHTML = `<div class="card"><div class="row between"><h2 style="margin:0">Preview (${qs.length})</h2>
        <div class="row"><button class="btn" data-toggle-all>Toggle all</button><button class="btn primary" data-save>Save ticked to my bank</button></div></div>
        <p class="muted" style="font-size:13px">Untick any you don't want. ${source === 'ai' ? 'Flagged ones are unticked by default – read them and fix with Edit if it\'s just a slip.' : ''}</p>
        <div data-list></div></div>`;
      const list = U.$('[data-list]', resEl);
      const drawList = () => {
        list.innerHTML = results.map((q, i) => `<div class="qpreview">
          <div class="row between"><label class="check"><input type="checkbox" data-keep="${i}" ${q._keep !== false ? 'checked' : ''}> Keep</label>
            <div class="row">${C.metaChips(q)}${q.verified ? '<span class="chip good">✓ checked</span>' : ''}<button class="btn sm" data-edit-r="${i}">Edit</button></div></div>
          ${q.verifyNote ? `<div class="notice warn" style="margin:8px 0;font-size:13px">${U.esc(q.verifyNote)}</div>` : ''}
          ${C.stemHTML(q)}${q.type === 'written' ? '' : C.optionsHTML(q, { revealed: true, choice: -1 })}
          ${q.type === 'written' ? `<details style="margin-top:10px"><summary>Mark scheme (${q.marks} marks)</summary><div class="rich" style="margin-top:8px">${U.md(q.markScheme)}</div></details>` : ''}
          <details style="margin-top:10px"><summary>Worked solution</summary><div class="rich" style="margin-top:8px">${U.md(q.solution)}</div></details>
        </div>`).join('');
        U.$$('[data-keep]', list).forEach((cb) => cb.onchange = () => { results[+cb.dataset.keep]._keep = cb.checked; });
        U.$$('[data-edit-r]', list).forEach((b) => b.onclick = () => {
          const i = +b.dataset.editR;
          C.editQuestion(results[i], (v) => { Object.assign(results[i], v, { verified: undefined, verifyNote: undefined, _keep: true }); drawList(); });
        });
      };
      results.forEach((q) => { if (q.verified === false) q._keep = false; });
      drawList();
      U.$('[data-toggle-all]', resEl).onclick = () => { const on = results.some((q) => q._keep === false); results.forEach((q) => { q._keep = on; }); drawList(); };
      U.$('[data-save]', resEl).onclick = () => {
        const keep = results.filter((q) => q._keep !== false).map((q) => { const c = Object.assign({}, q); delete c._keep; c.source = source; return c; });
        if (!keep.length) return U.toast('Nothing ticked');
        Store.addCustom(keep);
        if (after) return after(keep);
        resEl.innerHTML = `<div class="card"><h3>Saved ${keep.length} question${keep.length === 1 ? '' : 's'} ✓</h3><div class="row">
          <a class="btn primary" href="#/practice?ids=${keep.map((q) => q.id).join(',')}&title=${encodeURIComponent('New questions')}&back=${encodeURIComponent('#/generate')}">Practise them now</a>
          <a class="btn" href="#/mine">See all my questions</a></div></div>`;
      };
    }

    /* ---------------- import ---------------- */
    function drawImport() {
      body.innerHTML = `<div class="card">
        <p class="muted" style="margin-top:0">Have questions elsewhere – past papers, a textbook, your teacher's worksheets, the official ESAT practice papers? Paste the text or add screenshots/photos (include the <b>mark scheme</b> pages too if you have them) and the AI turns them into practice questions you can answer and have marked against that mark scheme. Images need a model that accepts images.</p>
        <div class="grid c2">
          <div class="field"><label>Unit</label><select data-imod>${unitOptions(module)}</select></div>
          <div class="field"><label>Screenshots / photos</label><label class="btn"><span>📷 Choose images</span><input type="file" accept="image/*" multiple hidden data-imgs></label><div class="thumbs" data-thumbs style="margin-top:8px"></div></div>
        </div>
        <div class="field"><label>…and/or paste text</label><textarea data-text rows="8" placeholder="Paste one or more questions, and the mark scheme if you have it"></textarea></div>
        <button class="btn primary" data-extract ${AI.isConfigured() ? '' : 'disabled'}>Convert to questions</button>
        <p class="muted" style="font-size:12.5px;margin-top:10px">No AI? Use <a href="#/mine">My questions → Write a question</a> to type one in with its mark scheme. Imported questions are stored only in this browser for your own revision.</p>
      </div>`;
      const imgs = [];
      U.$('[data-imgs]', body).onchange = async (e) => {
        for (const f of e.target.files) imgs.push(await U.shrinkImage(await U.readFile(f, 'dataurl'), 1800, 0.9));
        U.$('[data-thumbs]', body).innerHTML = imgs.map((s) => `<div class="t"><img src="${s}"></div>`).join('');
      };
      U.$('[data-extract]', body).onclick = async () => {
        const text = U.$('[data-text]', body).value.trim();
        const mod = U.$('[data-imod]', body).value;
        if (!text && !imgs.length) return U.toast('Add some text or images first');
        running = true; stopFlag = false;
        prog.classList.remove('hidden'); logEl.textContent = ''; resEl.innerHTML = '';
        U.$('[data-ptitle]', el).textContent = 'Converting…';
        log(`Sending ${imgs.length} image(s) and ${text.length} characters of text…`);
        let qs = [];
        try {
          const esat = isEsat(mod);
          const reply = await AI.chat({ system: esat ? AI.prompts.extract(mod) : AI.prompts.extractWritten(mod), effort: 'high',
            messages: [{ role: 'user', content: [{ type: 'text', text: text || 'Convert the questions in these images.' }].concat(imgs.map((d) => ({ type: 'image', dataUrl: d }))) }] });
          const fallbackSpec = Courses.points(mod)[0].key;
          const extra = { source: 'import', model: AI.config().model, createdAt: Date.now() };
          qs = (esat ? AI.parseQuestions(reply, { module: mod, extra }) : AI.parseWrittenQuestions(reply, { module: mod, extra }))
            .map((q) => (q.module === mod && q.spec ? q : Object.assign(q, { module: mod, spec: fallbackSpec })));
          log(`✓ found ${qs.length} question(s)`);
        } catch (e) { log('✗ ' + e.message); U.toast(e.message, 'bad'); }
        running = false;
        U.$('[data-ptitle]', el).textContent = `Done – ${qs.length} question(s)`;
        showResults(qs, 'import');
      };
    }

    /* ---------------- AI practice paper ---------------- */
    function drawPaper() {
      const esatMods = Store.esatModules();
      const myUnits = Store.studyUnits(['current', 'done']).filter((u) => !isEsat(u));
      body.innerHTML = `<div class="grid c2">
        <div class="card">
          <h3>A-level practice paper</h3>
          <p class="muted">Writes a fresh set of exam-style questions across a whole unit (optionally mixing in the earlier units it builds on), checks them, then starts a timed paper (1.2 min per mark). You mark it afterwards – yourself or with AI.</p>
          <div class="field"><label>Unit</label><select data-punit>${myUnits.map((u) => `<option value="${u}">${U.esc(U.moduleName(u))}</option>`).join('') || '<option value="">Choose units in Your subjects first</option>'}</select></div>
          <div class="field"><label>Questions</label><select data-pn style="max-width:140px"><option>4</option><option selected>6</option><option>8</option><option>10</option></select></div>
          <div class="field"><label class="check"><input type="checkbox" data-pprev checked> Mix in earlier units it builds on (about 1 in 4 questions)</label></div>
          <button class="btn primary" data-pgo ${AI.isConfigured() && myUnits.length ? '' : 'disabled'}>Build my paper</button>
        </div>
        ${esatMods.length ? `<div class="card">
          <h3>ESAT mock paper</h3>
          <p class="muted">Makes 27 fresh questions per module, spread across the whole specification, checks the answers, then starts a timed mock. Takes a few minutes and a fair amount of API credit.</p>
          <div class="field"><label>Modules</label><div class="stack">${window.ESAT_MODULE_ORDER.map((m) => `<label class="check"><input type="checkbox" value="${m}" ${esatMods.includes(m) ? 'checked' : ''}> ${U.esc(Courses.unit(m).name)}</label>`).join('')}</div></div>
          <button class="btn primary" data-mgo ${AI.isConfigured() ? '' : 'disabled'}>Build my ESAT mock</button></div>` : ''}
      </div>`;
      const pgo = U.$('[data-pgo]', body);
      if (pgo) pgo.onclick = async () => {
        const unit = U.$('[data-punit]', body).value;
        if (!unit) return;
        const n = parseInt(U.$('[data-pn]', body).value, 10);
        const prev = U.$('[data-pprev]', body).checked ? Courses.prereqChain(unit).filter((p) => Store.unitStatus(p) && !isEsat(p)) : [];
        const nPrev = prev.length ? Math.round(n / 4) : 0;
        const qs = await makeQuestions({ module: unit, specs: Courses.points(unit).map((p) => p.key), count: n - nPrev, difficulty: 'mixed', verify: true, quiet: true });
        const keepGoing = !stopFlag;
        for (let i = 0; i < nPrev && keepGoing; i++) {
          const pu = prev[i % prev.length];
          const before = logEl.textContent;
          const more = await makeQuestions({ module: pu, specs: Courses.points(pu).map((p) => p.key), count: 1, difficulty: 'mixed', verify: true, quiet: true });
          logEl.textContent = before + logEl.textContent;
          qs.push(...more);
        }
        showResults(qs, 'ai', (keep) => {
          Views.session.start({ kind: 'practice', title: `${Courses.unit(unit).short} AI practice paper`, subtitle: 'Timed · marked at the end', qids: keep.map((q) => q.id), mode: 'exam', returnTo: '#/generate?tab=paper' });
        });
        const save = U.$('[data-save]', resEl);
        if (save) save.textContent = 'Save ticked & start the paper';
      };
      const mgo = U.$('[data-mgo]', body);
      if (mgo) mgo.onclick = async () => {
        const mods = window.ESAT_MODULE_ORDER.filter((m) => U.$(`input[value="${m}"]`, body).checked);
        if (!mods.length) return U.toast('Pick a module');
        const parts = [];
        for (const m of mods) {
          if (stopFlag) break;
          const qs = await makeQuestions({ module: m, specs: Courses.points(m).map((p) => p.key), count: 27, difficulty: 'mixed', verify: true, quiet: true });
          const keep = qs.filter((q) => q.verified !== false);
          keep.forEach((q) => { q.source = 'ai'; });
          Store.addCustom(keep);
          log(`${U.moduleName(m)}: kept ${keep.length}/${qs.length}`);
          if (keep.length) parts.push({ module: m, qids: keep.sort((a, b) => a.difficulty - b.difficulty).map((q) => q.id) });
        }
        if (!parts.length) return U.toast('No questions were made – see the log', 'bad');
        const mock = { id: U.uid('mock-'), at: Date.now(), modules: parts, current: 0, done: false, strict: true, ai: true };
        Store.saveMock(mock);
        U.toast('Mock ready', 'good');
        U.go('#/mock/' + mock.id);
      };
    }

    draw();
    return () => { stopFlag = true; };
  };

  (window.Views = window.Views || {}).generate = V;
})();
