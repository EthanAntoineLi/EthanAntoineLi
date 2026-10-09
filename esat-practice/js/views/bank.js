/* Question bank: module → spec section → spec point → questions. Also "My questions". */
(function () {
  const V = {};

  V.render = (el, { parts, params }) => {
    if (parts[0] === 'mine' || parts[1] === 'mine') return renderMine(el);
    if (parts[1] && params.spec) return renderSpec(el, parts[1], params.spec);
    if (parts[1]) return renderModule(el, parts[1]);
    renderHome(el);
  };

  function practiceLinks(base, label = 'Practise') {
    const back = encodeURIComponent(location.hash);
    return `<a class="btn sm primary" href="#/practice?${base}&n=10&mode=relaxed&back=${back}" title="Instant feedback after each question">${label}</a>
      <a class="btn sm" href="#/practice?${base}&n=10&mode=exam&back=${back}" title="Countdown at real ESAT pace, solutions at the end">⏱ Exam conditions</a>`;
  }

  function renderHome(el) {
    const prof = Store.profile();
    const st = Bank.stats();
    const order = prof.modules.concat(window.ESAT_MODULE_ORDER.filter((m) => !prof.modules.includes(m)));
    const custom = Store.custom().length, hidden = Store.hidden().length;
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Question bank</h1><p>Organised by the official ESAT specification. Pick a module, then a topic.</p></div>
        <a class="btn" href="#/mine">My questions (${custom})${hidden ? ` · ${hidden} hidden` : ''}</a></div>
      <div class="grid c3">${order.map((m) => {
        const mod = Bank.module(m);
        const n = Bank.forModule(m).length;
        const s = st.module[m] || {};
        const mine = prof.modules.includes(m);
        return `<a class="card mod-card" href="#/bank/${m}" style="color:inherit;text-decoration:none;${mine ? '' : 'opacity:.8'}">
          <div class="top"><h3>${mod.name}</h3>${mine ? '<span class="chip blue">your module</span>' : '<span class="chip">other</span>'}</div>
          <div class="muted" style="font-size:13.5px">${mod.sections.length} topics · ${mod.sections.reduce((a, x) => a + x.points.length, 0)} spec points · ${n} questions</div>
          <div class="row between"><span class="muted">Your accuracy</span><b>${U.pct(s.acc)}</b></div>
          <div class="bar ${s.acc >= 0.7 ? 'good' : s.acc != null && s.acc < 0.45 ? 'bad' : ''}"><i style="width:${s.acc != null ? Math.round(s.acc * 100) : 0}%"></i></div>
        </a>`;
      }).join('')}</div></div>`;
  }

  function renderModule(el, m) {
    const mod = Bank.module(m);
    if (!mod) { el.innerHTML = '<div class="page empty">Unknown module</div>'; return; }
    const st = Bank.stats();
    const all = Bank.forModule(m);
    const hist = Bank.history();
    const counts = {};
    all.forEach((q) => { counts[q.spec] = (counts[q.spec] || 0) + 1; });
    const unseen = all.filter((q) => !hist[q.id]).length;
    const wrong = all.filter((q) => hist[q.id] && !hist[q.id].lastCorrect).length;
    el.innerHTML = `<div class="page">
      <div class="crumbs"><a href="#/bank">Question bank</a> /</div>
      <div class="page-head"><div><h1>${mod.name}</h1><p>${all.length} questions · ${unseen} unseen · ${wrong} last answered wrong</p></div>
        <div class="row">${practiceLinks('module=' + m, 'Practise mixed')}
          ${unseen ? `<a class="btn sm" href="#/practice?module=${m}&only=unseen&n=10&back=${encodeURIComponent(location.hash)}">Unseen only</a>` : ''}
          ${AI.isConfigured() ? `<a class="btn sm" href="#/generate?module=${m}">✚ AI questions</a>` : ''}</div></div>
      ${mod.sections.map((sec) => {
        const ss = st.section[sec.code] || {};
        const secCount = sec.points.reduce((a, p) => a + (counts[p.code] || 0), 0);
        return `<div class="sec-head"><h3>${sec.code}. ${U.esc(sec.title)}</h3><span class="muted" style="font-size:13px">${secCount} Qs · ${U.pct(ss.acc)}</span><span class="spacer"></span>
            ${secCount ? `<a class="btn sm" href="#/practice?section=${sec.code}&module=${m}&n=10&back=${encodeURIComponent(location.hash)}">Practise topic</a>` : ''}</div>
          <div class="card" style="padding:4px 12px"><div class="spec-list">${sec.points.map((p) => {
            const s = st.spec[p.code] || {};
            const c = counts[p.code] || 0;
            return `<div class="spec-row" data-spec="${p.code}" title="${U.esc(p.text)}">
              <span class="code">${p.code}</span><span class="name">${U.esc(p.title)}</span>
              <span class="cnt">${c} Q${c === 1 ? '' : 's'}</span>
              <span class="acc"><div class="bar ${s.acc >= 0.7 ? 'good' : s.acc != null && s.acc < 0.45 ? 'bad' : ''}" title="${s.n ? `${s.right}/${s.n} right` : 'not tried'}"><i style="width:${s.acc != null ? Math.round(s.acc * 100) : 0}%"></i></div></span>
              <span class="time cnt" title="average time">${s.avg != null ? U.fmtSecs(s.avg) : '–'}</span>
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
      <div class="crumbs"><a href="#/bank">Question bank</a> / <a href="#/bank/${m}">${info.moduleName}</a> / ${info.section.code} ${U.esc(info.section.title)}</div>
      <div class="page-head"><div><h1>${code} · ${U.esc(info.point.title)}</h1></div>
        <div class="row">${qs.length ? practiceLinks('spec=' + encodeURIComponent(code)) : ''}
          ${AI.isConfigured() ? `<a class="btn sm" href="#/generate?specs=${encodeURIComponent(code)}">✚ Make more with AI</a>` : ''}</div></div>
      <div class="card"><h3>Specification</h3><p style="margin:0">${U.esc(info.point.text)}</p>
        <div class="row" style="margin-top:12px"><span class="chip">${s.n || 0} attempts</span><span class="chip">${U.pct(s.acc)} right</span><span class="chip">${U.fmtSecs(s.avg)} avg</span></div></div>
      <div class="card"><h3>Questions (${qs.length})</h3>
        ${qs.length ? `<table class="tbl"><tbody>${qs.map((q, i) => {
          const h = hist[q.id];
          const status = !h ? '<span class="chip">new</span>' : h.lastCorrect ? '<span class="chip good">✓ last time</span>' : '<span class="chip bad">✗ last time</span>';
          return `<tr class="click" data-q="${q.id}"><td style="width:30px">${i + 1}</td><td><div class="rich" style="max-height:3.2em;overflow:hidden">${U.mdInline(q.stem.split('\n')[0].slice(0, 220))}</div></td>
            <td style="white-space:nowrap">${['', 'Easier', 'Standard', 'Hard'][q.difficulty]}</td><td style="white-space:nowrap">${status}${q.source !== 'builtin' ? ' <span class="chip warn">' + (q.source === 'ai' ? 'AI' : 'mine') + '</span>' : ''}</td></tr>`;
        }).join('')}</tbody></table>` : `<div class="empty">No questions on this spec point yet.${AI.isConfigured() ? ` <a href="#/generate?specs=${encodeURIComponent(code)}">Make some with AI →</a>` : ' Connect an AI model in Settings to generate some, or write your own in <a href="#/mine">My questions</a>.'}</div>`}
      </div></div>`;
    U.$$('[data-q]', el).forEach((r) => r.onclick = () => U.go(`#/practice?ids=${r.dataset.q}&title=${encodeURIComponent(code + ' · ' + info.point.title)}&mode=relaxed&back=${encodeURIComponent(location.hash)}`));
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
        ${custom.map((q) => `<tr><td style="white-space:nowrap"><b>${U.esc(q.spec)}</b><br><small>${U.esc(U.moduleShort(q.module))}</small></td>
          <td><div class="rich" style="max-height:3.2em;overflow:hidden">${U.mdInline(String(q.stem).split('\n')[0].slice(0, 200))}</div></td>
          <td style="white-space:nowrap">${q.source === 'ai' ? `AI${q.model ? ' · ' + U.esc(q.model) : ''}` : q.source}${q.verified === false ? ' <span class="chip bad">unverified</span>' : q.verified ? ' <span class="chip good">checked</span>' : ''}</td>
          <td style="white-space:nowrap"><button class="btn sm" data-try="${q.id}">Try</button> <button class="btn sm" data-edit="${q.id}">Edit</button> <button class="btn sm danger" data-del="${q.id}">Delete</button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty">Nothing here yet. Use the <a href="#/generate">AI question maker</a>, import a pack, or write your own.</div>'}</div>
      ${hidden.length ? `<div class="card"><h3>Hidden questions (${hidden.length})</h3><ul class="list-plain">${hidden.map((q) => `<li class="row between"><span><b>${U.esc(q.spec)}</b> ${U.mdInline(String(q.stem).slice(0, 120))}</span><button class="btn sm" data-unhide="${q.id}">Unhide</button></li>`).join('')}</ul></div>` : ''}
      <div class="card"><h3>Question pack format</h3><p class="muted" style="font-size:14px">A pack is a JSON array (or <code>{"questions": [...]}</code>). Each question:</p>
<pre>{ "spec": "M2.3", "difficulty": 2,
  "stem": "How many factors does $2^3 \\times 3^2$ have?",
  "options": ["5", "6", "9", "12", "36"],
  "answer": "D",
  "solution": "$(3+1)(2+1) = 12$." }</pre></div></div>`;

    U.$('[data-new]', el).onclick = () => C.editQuestion(null, (v) => { Store.addCustom([Object.assign({ id: U.uid('q-'), source: 'mine', createdAt: Date.now() }, v)]); U.toast('Saved', 'good'); renderMine(el); });
    const ex = U.$('[data-export]', el);
    if (ex) ex.onclick = () => U.download(`esat-my-questions-${U.dayKey(Date.now())}.json`, JSON.stringify(Store.custom().map((q) => Object.assign({}, q, { answer: U.letter(q.answer) })), null, 1));
    U.$('[data-import]', el).onchange = async (e) => {
      try {
        const data = JSON.parse(await U.readFile(e.target.files[0]));
        const arr = Array.isArray(data) ? data : data.questions;
        if (!Array.isArray(arr)) throw new Error('Expected an array of questions');
        const existing = new Set(Store.custom().map((q) => q.id));
        const ok = [];
        arr.forEach((q) => {
          const answer = typeof q.answer === 'string' ? U.letterIndex(q.answer) : q.answer;
          const info = Bank.specInfo(q.spec);
          if (!q.stem || !Array.isArray(q.options) || q.options.length < 2 || !(answer >= 0 && answer < q.options.length) || !info) return;
          ok.push({ id: q.id && !existing.has(q.id) ? q.id : U.uid('q-'), module: info.module, spec: q.spec, difficulty: q.difficulty || 2, stem: q.stem, options: q.options.map(String), answer, solution: q.solution || '', source: q.source || 'import', createdAt: Date.now() });
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
