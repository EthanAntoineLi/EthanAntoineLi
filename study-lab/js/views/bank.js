/* Question bank: module → spec section → spec point → questions. Also "My questions". */
(function () {
  const V = {};

  V.render = (el, { parts, params }) => {
    if (parts[0] === 'mine' || parts[1] === 'mine') return renderMine(el);
    if (parts[1] && params.spec) return renderSpec(el, Bank.specInfo(params.spec) ? Bank.specInfo(params.spec).module : parts[1], params.spec);
    if (parts[1]) return renderModule(el, parts[1]);
    renderHome(el);
  };

  function practiceLinks(base, label = 'Practise') {
    const back = encodeURIComponent(location.hash);
    return `<a class="btn sm primary" href="#/practice?${base}&n=10&mode=relaxed&back=${back}" title="Instant feedback after each question">${label}</a>
      <a class="btn sm" href="#/practice?${base}&n=10&mode=exam&back=${back}" title="Countdown at real ESAT pace, solutions at the end">⏱ Exam conditions</a>`;
  }

  function renderHome(el) {
    const st = Bank.stats();
    const counts = {};
    Bank.all().forEach((q) => { counts[q.module] = (counts[q.module] || 0) + 1; });
    const custom = Store.custom().length, hidden = Store.hidden().length;
    const order = { current: 0, done: 1, later: 2 };
    const courses = Courses.all().filter((c) => c.kind !== 'esat' || Store.esatOn() || c.units.some((u) => counts[u.id]));
    const card = (u) => {
      const s = st.module[u.id] || {};
      const status = Store.unitStatus(u.id);
      return `<a class="card mod-card" href="#/bank/${u.id}" style="color:inherit;text-decoration:none;${status ? '' : 'opacity:.75'}">
        <div class="top"><h3>${U.esc(u.short)}</h3>${status === 'current' ? '<span class="chip blue">studying now</span>' : status === 'done' ? '<span class="chip">done</span>' : status === 'later' ? '<span class="chip">later</span>' : ''}</div>
        <div class="muted" style="font-size:13px;margin-top:-4px">${U.esc(u.name)}</div>
        <div class="muted" style="font-size:13px">${u.sections.length} topics · ${u.sections.reduce((a, x) => a + x.points.length, 0)} spec points · <b>${counts[u.id] || 0}</b> questions</div>
        <div class="row between"><span class="muted">Your score</span><b>${U.pct(s.acc)}</b></div>
        <div class="bar ${s.acc >= 0.7 ? 'good' : s.acc != null && s.acc < 0.45 ? 'bad' : ''}"><i style="width:${s.acc != null ? Math.round(s.acc * 100) : 0}%"></i></div>
      </a>`;
    };
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Question bank</h1><p>Organised by course → unit → topic → spec point. Your units come first.</p></div>
        <a class="btn" href="#/mine">My questions (${custom})${hidden ? ` · ${hidden} hidden` : ''}</a></div>
      ${courses.map((c) => {
        const units = c.units.slice().sort((a, b) => (order[Store.unitStatus(a.id)] ?? 3) - (order[Store.unitStatus(b.id)] ?? 3));
        return `<div class="sec-head"><h2 style="margin:0">${U.esc(c.name)}</h2><span class="muted" style="font-size:13px">${U.esc(c.board)}</span></div>
          <div class="grid c3">${units.map(card).join('')}</div>`;
      }).join('')}
    </div>`;
  }

  function renderModule(el, m) {
    const mod = Bank.module(m);
    if (!mod) { el.innerHTML = '<div class="page empty">Unknown module</div>'; return; }
    const st = Bank.stats();
    const all = Bank.forModule(m);
    const hist = Bank.history();
    const counts = Bank.countBySpec();
    const unseen = all.filter((q) => !hist[q.id]).length;
    const wrong = all.filter((q) => hist[q.id] && !hist[q.id].lastCorrect).length;
    el.innerHTML = `<div class="page">
      <div class="crumbs"><a href="#/bank">Question bank</a> / ${U.esc(Courses.course(mod.course).name)} /</div>
      <div class="page-head"><div><h1>${U.esc(mod.short)}${mod.name !== mod.short ? ' · ' + U.esc(mod.name) : ''}</h1><p>${all.length} questions · ${unseen} unseen · ${wrong} last answered wrong${Courses.prereqChain(m).length ? ` · builds on ${Courses.prereqChain(m).map((id) => `<a href="#/bank/${id}">${U.esc(Courses.unit(id).short)}</a>`).join(', ')}` : ''}</p></div>
        <div class="row">${practiceLinks('module=' + m, 'Practise mixed')}
          ${unseen ? `<a class="btn sm" href="#/practice?module=${m}&only=unseen&n=10&back=${encodeURIComponent(location.hash)}">Unseen only</a>` : ''}
          ${AI.isConfigured() ? `<a class="btn sm" href="#/generate?module=${m}">✚ AI questions</a>` : ''}</div></div>
      ${mod.sections.map((sec) => {
        const ss = st.section[sec.key] || {};
        const secCount = sec.points.reduce((a, p) => a + (counts[p.key] || 0), 0);
        return `<div class="sec-head"><h3>${U.esc(sec.code)}. ${U.esc(sec.title)}</h3><span class="muted" style="font-size:13px">${secCount} Qs · ${U.pct(ss.acc)}</span><span class="spacer"></span>
            ${secCount ? `<a class="btn sm" href="#/practice?section=${encodeURIComponent(sec.key)}&module=${m}&n=10&back=${encodeURIComponent(location.hash)}">Practise topic</a>` : ''}</div>
          <div class="card" style="padding:4px 12px"><div class="spec-list">${sec.points.map((p) => {
            const s = st.spec[p.key] || {};
            const c = counts[p.key] || 0;
            return `<div class="spec-row" data-spec="${U.esc(p.key)}" title="${U.esc(p.text)}">
              <span class="code">${U.esc(p.code)}</span><span class="name">${U.esc(p.title)}</span>
              <span class="cnt">${c} Q${c === 1 ? '' : 's'}</span>
              <span class="acc"><div class="bar ${s.acc >= 0.7 ? 'good' : s.acc != null && s.acc < 0.45 ? 'bad' : ''}" title="${s.n ? `${s.right}/${s.n} right` : 'not tried'}"><i style="width:${s.acc != null ? Math.round(s.acc * 100) : 0}%"></i></div></span>
              <span class="time cnt" title="${s.perMark != null ? 'average time per mark' : 'average time'}">${s.perMark != null ? U.fmtSecs(s.perMark) + '/mk' : s.avg != null ? U.fmtSecs(s.avg) : '–'}</span>
            </div>`;
          }).join('')}</div></div>`;
      }).join('')}</div>`;
    U.$$('[data-spec]', el).forEach((r) => r.onclick = () => U.go(`#/bank/${m}?spec=${encodeURIComponent(r.dataset.spec)}`));
  }

  function renderSpec(el, m, code) {
    const info = Bank.specInfo(code);
    if (!info) { el.innerHTML = '<div class="page empty">Unknown spec point</div>'; return; }
    const qs = Bank.forSpec(code);
    const hist = Bank.history();
    const s = Bank.stats().spec[code] || {};
    el.innerHTML = `<div class="page">
      <div class="crumbs"><a href="#/bank">Question bank</a> / <a href="#/bank/${info.module}">${U.esc(info.unit.short)}</a> / ${U.esc(info.section.code)} ${U.esc(info.section.title)}</div>
      <div class="page-head"><div><h1>${U.esc(Bank.specLabel(code))} · ${U.esc(info.point.title)}</h1></div>
        <div class="row">${qs.length ? practiceLinks('spec=' + encodeURIComponent(code)) : ''}
          ${AI.isConfigured() ? `<a class="btn sm" href="#/generate?specs=${encodeURIComponent(code)}">✚ Make more with AI</a>` : ''}</div></div>
      <div class="card"><h3>Specification</h3><p style="margin:0">${U.esc(info.point.text)}</p>
        <div class="row" style="margin-top:12px"><span class="chip">${s.n || 0} attempts</span><span class="chip">${U.pct(s.acc)} score</span>${s.avg != null ? `<span class="chip">${U.fmtSecs(s.avg)} avg</span>` : ''}
          <span class="spacer"></span><span class="muted" style="font-size:13px">Progress map:</span>
          <div class="seg" data-status>${[['', 'Not started'], ['learning', 'Learning'], ['learned', 'Learned'], ['shaky', 'Shaky']].map(([v, l]) => `<button data-v="${v}" class="${((Store.specStatus()[code] || {}).s || '') === v ? 'on' : ''}">${l}</button>`).join('')}</div></div></div>
      <div class="card"><h3>Questions (${qs.length})</h3>
        ${qs.length ? `<table class="tbl"><tbody>${qs.map((q, i) => {
          const h = hist[q.id];
          const status = !h ? '<span class="chip">new</span>' : h.lastCorrect ? '<span class="chip good">✓ last time</span>' : '<span class="chip bad">✗ last time</span>';
          return `<tr class="click" data-q="${q.id}"><td style="width:30px">${i + 1}</td><td><div class="rich" style="max-height:3.2em;overflow:hidden">${U.mdInline(q.stem.split('\n')[0].slice(0, 220))}</div></td>
            <td style="white-space:nowrap">${q.type === 'written' ? q.marks + ' marks' : ['', 'Easier', 'Standard', 'Hard'][q.difficulty]}</td><td style="white-space:nowrap">${status}${q.source !== 'builtin' ? ' <span class="chip warn">' + (q.source === 'ai' ? 'AI' : 'mine') + '</span>' : ''}</td></tr>`;
        }).join('')}</tbody></table>` : `<div class="empty">No questions on this spec point yet.${AI.isConfigured() ? ` <a href="#/generate?specs=${encodeURIComponent(code)}">Make some with AI →</a>` : ' Connect an AI model in Settings to generate some, or write your own in <a href="#/mine">My questions</a>.'}</div>`}
      </div></div>`;
    U.$$('[data-q]', el).forEach((r) => r.onclick = () => U.go(`#/practice?ids=${r.dataset.q}&title=${encodeURIComponent(Bank.specLabel(code) + ' · ' + info.point.title)}&mode=relaxed&back=${encodeURIComponent(location.hash)}`));
    U.$$('[data-status] button', el).forEach((b) => b.onclick = () => {
      Store.setSpecStatus(code, b.dataset.v);
      U.$$('[data-status] button', el).forEach((x) => x.classList.toggle('on', x === b));
      U.toast(b.dataset.v ? 'Marked as ' + b.textContent.toLowerCase() : 'Cleared');
    });
  }

  function renderMine(el) {
    const custom = Store.custom().map((q) => Bank.byId(q.id) || q);
    const hidden = Bank.all({ includeHidden: true }).filter((q) => q.hidden);
    el.innerHTML = `<div class="page">
      <div class="crumbs"><a href="#/bank">Question bank</a> /</div>
      <div class="page-head"><div><h1>My questions</h1><p>Questions made by the AI question maker, imported, or written by you. Saved in this browser.</p></div>
        <div class="row"><button class="btn sm primary" data-new>✎ Write a question</button>
          <label class="btn sm">⇪ Import pack (.json)<input type="file" accept=".json,application/json" hidden data-import></label>
          ${custom.length ? '<button class="btn sm" data-export>⇩ Export my questions</button>' : ''}</div></div>
      <div class="card">${custom.length ? `<table class="tbl"><thead><tr><th>Spec</th><th>Question</th><th>Source</th><th></th></tr></thead><tbody>
        ${custom.map((q) => `<tr><td style="white-space:nowrap"><b>${U.esc(Bank.specLabel(q.spec))}</b><br><small>${U.esc(U.moduleShort(q.module))}${q.type === 'written' ? ' · ' + q.marks + ' marks' : ''}</small></td>
          <td><div class="rich" style="max-height:3.2em;overflow:hidden">${U.mdInline(String(q.stem).split('\n')[0].slice(0, 200))}</div></td>
          <td style="white-space:nowrap">${q.source === 'ai' ? `AI${q.model ? ' · ' + U.esc(q.model) : ''}` : q.source}${q.verified === false ? ' <span class="chip bad">unverified</span>' : q.verified ? ' <span class="chip good">checked</span>' : ''}</td>
          <td style="white-space:nowrap"><button class="btn sm" data-try="${q.id}">Try</button> <button class="btn sm" data-edit="${q.id}">Edit</button> <button class="btn sm danger" data-del="${q.id}">Delete</button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty">Nothing here yet. Use the <a href="#/generate">AI question maker</a>, import a pack, or write your own.</div>'}</div>
      ${hidden.length ? `<div class="card"><h3>Hidden questions (${hidden.length})</h3><ul class="list-plain">${hidden.map((q) => `<li class="row between"><span><b>${U.esc(Bank.specLabel(q.spec))}</b> ${U.mdInline(String(q.stem).slice(0, 120))}</span><button class="btn sm" data-unhide="${q.id}">Unhide</button></li>`).join('')}</ul></div>` : ''}
      <div class="card"><h3>Question pack format</h3><p class="muted" style="font-size:14px">A pack is a JSON array (or <code>{"questions": [...]}</code>). Each question:</p>
<pre>[
 { "spec": "M2.3", "difficulty": 2,
   "stem": "How many factors does $2^3 \\times 3^2$ have?",
   "options": ["5", "6", "9", "12", "36"], "answer": "D",
   "solution": "$(3+1)(2+1) = 12$." },
 { "spec": "m2:1.1", "difficulty": 2,
   "stem": "A particle moves ... (a) Find ... **(3)** (b) ... **(4)**",
   "markScheme": "**(a)**\\n- **M1** ...\\n- **A1** ...\\n- **A1** ...\\n**(b)**\\n- **M1** ...",
   "solution": "..." }
]</pre><p class="muted" style="font-size:13px">Multiple choice needs <code>options</code> + <code>answer</code>; written questions need a <code>markScheme</code> with bold mark codes (the marks are counted from it). The <code>spec</code> must be a spec key from the app (shown on each spec point's page, e.g. <code>fp3:1.2</code>).</p></div></div>`;

    U.$('[data-new]', el).onclick = () => C.editQuestion(null, (v) => { Store.addCustom([Object.assign({ id: U.uid('q-'), source: 'mine', createdAt: Date.now() }, v)]); U.toast('Saved', 'good'); renderMine(el); });
    const ex = U.$('[data-export]', el);
    if (ex) ex.onclick = () => U.download(`my-questions-${U.dayKey(Date.now())}.json`, JSON.stringify(Store.custom().map((q) => (q.type === 'written' ? q : Object.assign({}, q, { answer: U.letter(q.answer) }))), null, 1));
    U.$('[data-import]', el).onchange = async (e) => {
      try {
        const data = JSON.parse(await U.readFile(e.target.files[0]));
        const arr = Array.isArray(data) ? data : data.questions;
        if (!Array.isArray(arr)) throw new Error('Expected an array of questions');
        const existing = new Set(Store.custom().map((q) => q.id));
        const ok = [];
        arr.forEach((q) => {
          const info = Bank.specInfo(q.spec);
          if (!q.stem || !info) return;
          const base = { id: q.id && !existing.has(q.id) ? q.id : U.uid('q-'), module: info.module, spec: q.spec, specs: q.specs, difficulty: q.difficulty || 2, stem: q.stem, solution: q.solution || '', source: q.source || 'import', createdAt: Date.now() };
          if (q.markScheme) {
            const marks = C.parseMarkScheme(q.markScheme).total;
            if (!marks) return;
            ok.push(Object.assign(base, { type: 'written', markScheme: q.markScheme, marks }));
            return;
          }
          const answer = typeof q.answer === 'string' ? U.letterIndex(q.answer) : q.answer;
          if (!Array.isArray(q.options) || q.options.length < 2 || !(answer >= 0 && answer < q.options.length)) return;
          ok.push(Object.assign(base, { type: 'mcq', options: q.options.map(String), answer }));
        });
        Store.addCustom(ok);
        U.toast(`Imported ${ok.length} question${ok.length === 1 ? '' : 's'}${arr.length - ok.length ? ` (${arr.length - ok.length} skipped – check spec codes/answers)` : ''}`, 'good');
        renderMine(el);
      } catch (err) { U.toast('Import failed: ' + err.message, 'bad'); }
    };
    U.$$('[data-try]', el).forEach((b) => b.onclick = () => U.go(`#/practice?ids=${b.dataset.try}&title=${encodeURIComponent('My question')}&back=${encodeURIComponent('#/mine')}`));
    U.$$('[data-edit]', el).forEach((b) => b.onclick = () => {
      const q = Store.custom().find((x) => x.id === b.dataset.edit);
      C.editQuestion(Bank.byId(q.id) || q, (v) => { Store.updateCustom(Object.assign({}, q, v)); U.toast('Saved', 'good'); renderMine(el); });
    });
    U.$$('[data-del]', el).forEach((b) => b.onclick = async () => {
      if (await U.confirm('Delete this question?', 'This cannot be undone.', 'Delete', true)) { Store.deleteCustom(b.dataset.del); Store.removeFromReview(b.dataset.del); renderMine(el); }
    });
    U.$$('[data-unhide]', el).forEach((b) => b.onclick = () => { Store.setHidden(b.dataset.unhide, false); renderMine(el); });
  }

  (window.Views = window.Views || {}).bank = V;
})();
