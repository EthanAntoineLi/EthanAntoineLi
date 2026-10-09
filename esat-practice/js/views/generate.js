/* AI question maker: new ESAT-style questions for any spec point, checked by having the model
   re-solve each one blind. Also converts screenshots / pasted text of questions into your bank. */
(function () {
  const V = {};
  const BATCH = 5;

  V.render = (el, { params }) => {
    const prof = Store.profile();
    const preSpecs = params.specs ? params.specs.split(',').filter((c) => Bank.specInfo(c)) : [];
    let module = params.module || (preSpecs[0] && Bank.specInfo(preSpecs[0]).module) || prof.modules[0];
    let tab = params.tab || 'make';
    const selected = new Set(preSpecs);
    let results = [];
    let running = false, stopFlag = false;

    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>AI question maker</h1><p>Unlimited ESAT-style practice on exactly the spec points you need, made by your own AI model. Each question can be double-checked by having the model solve it again without seeing the answer.</p></div>
        <div class="seg"><button data-tab="make">Make questions</button><button data-tab="import">Import from screenshots / text</button><button data-tab="mock">AI mock paper</button></div></div>
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
      else drawMock();
    }

    /* ---------------- make ---------------- */
    function drawMake() {
      const mod = Bank.module(module);
      const st = Bank.stats().spec;
      const counts = {};
      Bank.forModule(module).forEach((q) => { counts[q.spec] = (counts[q.spec] || 0) + 1; });
      body.innerHTML = `<div class="split">
        <div class="card">
          <div class="row between"><h3 style="margin:0">1. Spec points</h3>
            <select data-module style="width:auto">${window.ESAT_MODULE_ORDER.map((m) => `<option value="${m}" ${m === module ? 'selected' : ''}>${U.moduleName(m)}${prof.modules.includes(m) ? '' : ' (not yours)'}</option>`).join('')}</select></div>
          <div class="row" style="margin:10px 0"><span class="muted" style="font-size:13px">Quick pick:</span>
            <button class="btn sm" data-pick="weak">My weakest</button><button class="btn sm" data-pick="few">Fewest questions</button><button class="btn sm" data-pick="untried">Not tried yet</button><button class="btn sm ghost" data-pick="none">Clear</button></div>
          <div style="max-height:440px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:6px 10px">
          ${mod.sections.map((sec) => `<div style="margin:8px 0 4px"><label class="check" style="font-weight:700"><input type="checkbox" data-sec="${sec.code}"> ${sec.code}. ${U.esc(sec.title)}</label></div>
            ${sec.points.map((p) => `<label class="check" style="margin-left:22px;font-weight:400;font-size:14px" title="${U.esc(p.text)}"><input type="checkbox" data-spec="${p.code}" ${selected.has(p.code) ? 'checked' : ''}>
              <span><b>${p.code}</b> ${U.esc(p.title)} <small>· ${counts[p.code] || 0} Qs${st[p.code] ? ` · ${U.pct(st[p.code].acc)}` : ''}</small></span></label>`).join('')}`).join('')}
          </div>
          <div class="muted" style="font-size:13px;margin-top:6px" data-selcount></div>
        </div>
        <div class="card">
          <h3>2. Settings</h3>
          <div class="field"><label>How many questions</label><input type="number" data-count min="1" max="60" value="10" style="max-width:120px"><span class="hint">Made in batches of ${BATCH}.</span></div>
          <div class="field"><label>Difficulty</label><select data-diff><option value="mixed">Typical ESAT (mixed)</option><option value="easy">Easier (confidence builders)</option><option value="hard">Hard (top third of a paper)</option></select></div>
          <div class="field"><label class="check"><input type="checkbox" data-verify checked> Double-check answers (one extra request per question)</label>
            <span class="hint">Questions where the re-solve disagrees are flagged "unverified" so you can fix or drop them.</span></div>
          <button class="btn primary lg block" data-go ${AI.isConfigured() ? '' : 'disabled'}>✚ Make questions</button>
          <p class="muted" style="font-size:12.5px;margin-top:10px">Uses your API credit: roughly ${BATCH} questions per request${' '}+ 1 short request each to verify. AI-made questions can contain mistakes – they're labelled "AI-made" and you can edit or hide any of them.</p>
        </div></div>`;
      const updateCount = () => { U.$('[data-selcount]', body).textContent = selected.size ? `${selected.size} spec point${selected.size === 1 ? '' : 's'} selected` : 'Nothing selected – questions will be spread across the whole module.'; };
      updateCount();
      U.$('[data-module]', body).onchange = (e) => { module = e.target.value; selected.clear(); drawMake(); };
      U.$$('[data-spec]', body).forEach((cb) => cb.onchange = () => { cb.checked ? selected.add(cb.dataset.spec) : selected.delete(cb.dataset.spec); updateCount(); });
      U.$$('[data-sec]', body).forEach((cb) => cb.onchange = () => {
        Bank.module(module).sections.find((s) => s.code === cb.dataset.sec).points.forEach((p) => { cb.checked ? selected.add(p.code) : selected.delete(p.code); });
        U.$$('[data-spec]', body).forEach((x) => { x.checked = selected.has(x.dataset.spec); }); updateCount();
      });
      U.$$('[data-pick]', body).forEach((b) => b.onclick = () => {
        const pts = Bank.module(module).sections.flatMap((s) => s.points.map((p) => p.code));
        selected.clear();
        if (b.dataset.pick === 'weak') Bank.weakest([module], 6).forEach((w) => selected.add(w.code));
        if (b.dataset.pick === 'few') pts.slice().sort((a, c) => (counts[a] || 0) - (counts[c] || 0)).slice(0, 6).forEach((c) => selected.add(c));
        if (b.dataset.pick === 'untried') pts.filter((c) => !st[c]).slice(0, 8).forEach((c) => selected.add(c));
        if (b.dataset.pick === 'weak' && !selected.size) U.toast('Not enough data yet for weak spots – try "Fewest questions"');
        U.$$('[data-spec]', body).forEach((x) => { x.checked = selected.has(x.dataset.spec); }); updateCount();
      });
      U.$('[data-go]', body).onclick = async () => {
        const count = U.clamp(parseInt(U.$('[data-count]', body).value, 10) || 10, 1, 60);
        const specs = selected.size ? [...selected] : Bank.module(module).sections.flatMap((s) => s.points.map((p) => p.code));
        const qs = await makeQuestions({ module, specs, count, difficulty: U.$('[data-diff]', body).value, verify: U.$('[data-verify]', body).checked });
        showResults(qs, 'ai');
      };
    }

    async function makeQuestions({ module, specs, count, difficulty, verify, quiet }) {
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
          const pool = Bank.forModule(module).filter((q) => q.source === 'builtin');
          const sameSpec = pool.filter((q) => batchSpecs.includes(q.spec));
          const examples = U.shuffle(sameSpec.length ? sameSpec : pool).slice(0, 2);
          if (!examples.length) examples.push(...U.shuffle(Bank.all().filter((q) => q.source === 'builtin')).slice(0, 1));
          const avoid = Bank.all().filter((q) => batchSpecs.includes(q.spec)).map((q) => q.stem.replace(/\s+/g, ' ')).slice(0, 8);
          log(`Request ${b + 1}/${batches}: ${n} question${n === 1 ? '' : 's'} on ${[...new Set(batchSpecs)].join(', ')}…`);
          let text = '';
          for (let attempt = 0; attempt < 2 && !text; attempt++) {
            try {
              text = await AI.chat({ system: AI.prompts.generate({ module, specs: [...new Set(batchSpecs)], difficulty, count: n, examples, avoid }), messages: [{ role: 'user', content: `Write the ${n} question${n === 1 ? '' : 's'} now.` }], effort: 'high' });
            } catch (e) { log('  ✗ ' + e.message); if (attempt === 1 || e.status === 401 || e.status === 403) throw e; }
          }
          const parsed = AI.parseQuestions(text, { module, extra: { source: 'ai', model: AI.config().model, createdAt: Date.now() } })
            .map((q) => (q.module === module && q.spec ? q : Object.assign(q, { module, spec: batchSpecs[0] })));
          log(`  ✓ got ${parsed.length} question${parsed.length === 1 ? '' : 's'}`);
          if (!parsed.length) log('  (the reply could not be parsed – the model may not have followed the format)');
          out.push(...parsed.slice(0, n));
        }
        if (verify && out.length && !stopFlag) await verifyAll(out);
      } catch (e) {
        log('Stopped: ' + e.message);
        if (!quiet) U.toast(e.message, 'bad');
      }
      running = false;
      U.$('[data-ptitle]', el).textContent = `Done – ${out.length} question${out.length === 1 ? '' : 's'}`;
      return out;
    }

    async function verifyAll(qs) {
      log(`Checking ${qs.length} answers…`);
      let i = 0;
      const worker = async () => {
        while (i < qs.length && !stopFlag) {
          const q = qs[i++];
          try {
            const reply = await AI.chat({ system: 'You are a careful solver of admissions-test questions.', messages: [{ role: 'user', content: AI.prompts.verify(q) }], effort: 'medium' });
            const got = AI.parseAnswer(AI.clean(reply));
            q.verified = got === U.letter(q.answer);
            if (!q.verified) q.verifyNote = got ? `Checker got ${got}, key says ${U.letter(q.answer)}` : 'Checker gave no clear answer';
            log(`  ${q.verified ? '✓' : '⚠'} ${q.spec}: ${q.verified ? 'answer confirmed' : q.verifyNote}`);
          } catch (e) { log('  ? could not check: ' + e.message); }
        }
      };
      await Promise.all([worker(), worker(), worker()]);
    }

    function showResults(qs, source) {
      results = qs;
      if (!qs.length) { resEl.innerHTML = '<div class="card empty">No questions this time. Check the log above – a different model may follow the format better.</div>'; return; }
      resEl.innerHTML = `<div class="card"><div class="row between"><h2 style="margin:0">Preview (${qs.length})</h2>
        <div class="row"><button class="btn" data-toggle-all>Toggle all</button><button class="btn primary" data-save>Save ticked to my bank</button></div></div>
        <p class="muted" style="font-size:13px">Untick any you don't want. ${source === 'ai' ? 'Unverified ones are unticked by default – read the solution and fix the key with Edit if it\'s just a slip.' : ''}</p>
        <div data-list></div></div>`;
      const list = U.$('[data-list]', resEl);
      const drawList = () => {
        list.innerHTML = results.map((q, i) => `<div class="qpreview">
          <div class="row between"><label class="check"><input type="checkbox" data-keep="${i}" ${q._keep !== false && q.verified !== false ? 'checked' : ''}> Keep</label>
            <div class="row">${C.metaChips(q)}${q.verified ? '<span class="chip good">✓ checked</span>' : ''}<button class="btn sm" data-edit-r="${i}">Edit</button></div></div>
          ${q.verifyNote ? `<div class="notice warn" style="margin:8px 0;font-size:13px">${U.esc(q.verifyNote)}</div>` : ''}
          ${C.stemHTML(q)}${C.optionsHTML(q, { revealed: true, choice: -1 })}
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
        resEl.innerHTML = `<div class="card"><h3>Saved ${keep.length} question${keep.length === 1 ? '' : 's'} ✓</h3><div class="row">
          <a class="btn primary" href="#/practice?ids=${keep.map((q) => q.id).join(',')}&title=${encodeURIComponent('New questions')}&back=${encodeURIComponent('#/generate')}">Practise them now</a>
          <a class="btn" href="#/mine">See all my questions</a></div></div>`;
      };
    }

    /* ---------------- import ---------------- */
    function drawImport() {
      body.innerHTML = `<div class="card">
        <p class="muted" style="margin-top:0">Got questions elsewhere – e.g. the free official ESAT practice papers, or a textbook? Paste the text or drop in screenshots (the answer key too if you have it) and the AI turns them into practice questions with timing and tracking. Images need a model that accepts images.</p>
        <div class="grid c2">
          <div class="field"><label>Module</label><select data-imod>${window.ESAT_MODULE_ORDER.map((m) => `<option value="${m}" ${m === module ? 'selected' : ''}>${U.moduleName(m)}</option>`).join('')}</select></div>
          <div class="field"><label>Screenshots / photos</label><label class="btn"><span>📷 Choose images</span><input type="file" accept="image/*" multiple hidden data-imgs></label><div class="thumbs" data-thumbs style="margin-top:8px"></div></div>
        </div>
        <div class="field"><label>…and/or paste text</label><textarea data-text rows="8" placeholder="Paste one or more questions (and answers if you have them)"></textarea></div>
        <button class="btn primary" data-extract ${AI.isConfigured() ? '' : 'disabled'}>Convert to questions</button>
        <p class="muted" style="font-size:12.5px;margin-top:10px">Imported questions are only stored in this browser, for your own revision. Respect the copyright of whatever you import.</p>
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
          const reply = await AI.chat({ system: AI.prompts.extract(mod), effort: 'high',
            messages: [{ role: 'user', content: [{ type: 'text', text: text || 'Convert the questions in these images.' }].concat(imgs.map((d) => ({ type: 'image', dataUrl: d }))) }] });
          const fallbackSpec = Bank.module(mod).sections[0].points[0].code;
          qs = AI.parseQuestions(reply, { module: mod, extra: { source: 'import', model: AI.config().model, createdAt: Date.now() } })
            .map((q) => (q.module === mod && q.spec ? q : Object.assign(q, { module: mod, spec: fallbackSpec })));
          log(`✓ found ${qs.length} question(s)`);
        } catch (e) { log('✗ ' + e.message); U.toast(e.message, 'bad'); }
        running = false;
        U.$('[data-ptitle]', el).textContent = `Done – ${qs.length} question(s)`;
        showResults(qs, 'import');
      };
    }

    /* ---------------- full AI mock ---------------- */
    function drawMock() {
      body.innerHTML = `<div class="card" style="max-width:760px">
        <h3>Generate a brand-new mock paper</h3>
        <p class="muted">Makes 27 fresh questions per module, spread across the whole specification, checks the answers, then starts a timed mock with them. It takes a few minutes and uses a fair amount of API credit (about ${Math.ceil(27 / BATCH)} long requests + 27 short checks per module).</p>
        <div class="field"><label>Modules</label><div class="stack">${window.ESAT_MODULE_ORDER.map((m) => `<label class="check"><input type="checkbox" value="${m}" ${prof.modules.includes(m) ? 'checked' : ''}> ${U.moduleName(m)}</label>`).join('')}</div></div>
        <div class="field"><label class="check"><input type="checkbox" data-mverify checked> Double-check answers (recommended)</label></div>
        <button class="btn primary lg" data-mgo ${AI.isConfigured() ? '' : 'disabled'}>Build my AI mock</button></div>`;
      U.$('[data-mgo]', body).onclick = async () => {
        const mods = window.ESAT_MODULE_ORDER.filter((m) => U.$(`input[value="${m}"]`, body).checked);
        if (!mods.length) return U.toast('Pick a module');
        const verify = U.$('[data-mverify]', body).checked;
        const parts = [];
        for (const m of mods) {
          if (stopFlag) break;
          const specs = Bank.module(m).sections.flatMap((s) => s.points.map((p) => p.code));
          const qs = await makeQuestions({ module: m, specs, count: 27, difficulty: 'mixed', verify, quiet: true });
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
