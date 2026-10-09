/* Full timed mock: your modules back to back in exam order, 27 questions / 40 minutes each,
   no calculator, solutions at the end. */
(function () {
  const PER_MODULE = 27, MINUTES = 40;

  /* Rough ESAT-scale estimate. UAT-UK's 2024-25 technical report gives the scaling
     (scaled = constant + multiplier × θ) and the median-candidate θ for each module.
     Item difficulties aren't published, so we assume a typical spread of 27 Rasch items
     around the median candidate. Treat the result as ±1 – a feel for the scale, not a prediction. */
  const SCALE = {
    maths1: { c: 3.9732, m: 1.4358, t50: 0.3669, pct: [3.4, 4.5, 5.7, 7.0] },
    biology: { c: 3.6151, m: 2.0865, t50: 0.4241, pct: [3.6, 4.5, 5.9, 7.0] },
    chemistry: { c: 4.1340, m: 1.7689, t50: 0.2069, pct: [3.4, 4.5, 5.8, 7.0] },
    physics: { c: 4.4874, m: 1.8034, t50: 0.0070, pct: [3.4, 4.5, 5.6, 7.0] },
    maths2: { c: 5.1806, m: 1.9636, t50: -0.3466, pct: [3.6, 4.5, 5.6, 7.0] },
  };
  function estimateScaled(module, raw, n = PER_MODULE) {
    const k = SCALE[module];
    if (!k || !n) return null;
    const r = (raw / n) * PER_MODULE;
    const bs = Array.from({ length: PER_MODULE }, (_, i) => k.t50 - 1.75 + (4 * i) / (PER_MODULE - 1));
    const expected = (th) => bs.reduce((s, b) => s + 1 / (1 + Math.exp(b - th)), 0);
    let th;
    if (r <= 0.5) th = -6; else if (r >= PER_MODULE - 0.5) th = 6;
    else { let lo = -8, hi = 8; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (expected(mid) < r) lo = mid; else hi = mid; } th = (lo + hi) / 2; }
    const scaled = U.clamp(k.c + k.m * th, 1, 9);
    return Math.round(scaled * 10) / 10;
  }
  // Percentile among October 2024 candidates, interpolated from the published quartiles.
  function percentile(module, scaled) {
    const k = SCALE[module];
    if (!k || scaled == null) return null;
    const pts = [[1, 0], [k.pct[0], 25], [k.pct[1], 50], [k.pct[2], 75], [k.pct[3], 90], [9, 100]];
    for (let i = 1; i < pts.length; i++) {
      if (scaled <= pts[i][0]) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        return Math.round(y0 + ((scaled - x0) / (x1 - x0)) * (y1 - y0));
      }
    }
    return 100;
  }

  const Mock = { estimateScaled, percentile };

  Mock.render = (el, { parts }) => {
    if (parts[1]) return renderMock(el, parts[1]);
    renderSetup(el);
  };

  function renderSetup(el) {
    const mine = Store.esatModules().length ? Store.esatModules() : ['maths1'];
    const counts = Object.fromEntries(window.ESAT_MODULE_ORDER.map((m) => [m, Bank.forModule(m).length]));
    const mocks = Store.mocks().slice().sort((a, b) => b.at - a.at);
    const unfinished = mocks.find((m) => !m.done);
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Mock test</h1><p>Your modules back to back at real exam pace: ${PER_MODULE} questions in ${MINUTES} minutes each, no calculator, separately timed, solutions at the end.</p></div></div>
      ${unfinished ? `<div class="notice warn" style="margin-bottom:14px">You have an unfinished mock from ${U.fmtDateTime(unfinished.at)}. <a href="#/mock/${unfinished.id}">Continue it →</a></div>` : ''}
      <div class="split">
        <div class="card">
          <h2>Set up your paper</h2>
          <div class="field"><label>Modules <span class="hint">taken in the real exam order</span></label>
            <div class="stack">${window.ESAT_MODULE_ORDER.map((m) => `<label class="check"><input type="checkbox" value="${m}" ${mine.includes(m) ? 'checked' : ''}> ${U.moduleName(m)}
              <span class="muted" style="font-size:13px">· ${counts[m]} questions available${counts[m] < PER_MODULE ? ` <span class="chip warn">fewer than ${PER_MODULE}</span>` : ''}</span></label>`).join('')}</div></div>
          <div class="field"><label>Questions from</label><select data-source style="max-width:320px">
            <option value="any">Everything in my bank (unseen first)</option>
            <option value="builtin">Built-in questions only</option>
            <option value="mine">My AI-made / imported questions only</option></select></div>
          <div class="field"><label class="check"><input type="checkbox" data-strict checked> Strict timing (40:00 per module, auto-submit at 0:00)</label></div>
          <div class="row"><button class="btn primary lg" data-start>Start mock →</button>
            <a class="btn" href="#/generate">Make more questions with AI</a></div>
          <p class="muted" style="font-size:13px;margin-top:12px">If a module has fewer than ${PER_MODULE} questions you'll get a shorter module with the time scaled to match (≈ 89 s per question). Questions you've seen least recently are used first.</p>
        </div>
        <div class="card">
          <h3>How the real ESAT works</h3>
          <ul class="list-plain" style="font-size:14px">
            <li>Mathematics 1 is compulsory; most courses add two of Biology, Chemistry, Physics, Mathematics 2.</li>
            <li>Each module: 27 multiple-choice questions, 40 minutes. Time doesn't carry over between modules.</li>
            <li>1 mark per correct answer, <b>no negative marking</b> – never leave a blank.</li>
            <li>No calculator. You get an erasable booklet (use the ✎ Scratchpad).</li>
            <li>Scores are reported per module on a 1.0–9.0 scale.</li>
          </ul>
        </div>
      </div>
      <div class="card" style="margin-top:14px"><h2>Past mocks</h2>
        ${mocks.length ? `<table class="tbl"><thead><tr><th>Date</th><th>Modules</th><th class="num">Score</th><th></th></tr></thead><tbody>
          ${mocks.map((m) => `<tr class="click" data-open="${m.id}"><td>${U.fmtDateTime(m.at)}</td><td>${m.modules.map((x) => U.moduleShort(x.module)).join(', ')}</td>
            <td class="num">${m.done ? m.modules.map((x) => `${x.score ?? '–'}/${x.qids.length}`).join(' · ') : '<span class="chip warn">unfinished</span>'}</td><td><a href="#/mock/${m.id}">Open →</a></td></tr>`).join('')}
          </tbody></table>` : '<div class="empty">No mocks yet.</div>'}
      </div></div>`;

    U.$$('[data-open]', el).forEach((tr) => tr.onclick = () => U.go('#/mock/' + tr.dataset.open));
    U.$('[data-start]', el).onclick = () => {
      const mods = window.ESAT_MODULE_ORDER.filter((m) => U.$(`input[value="${m}"]`, el).checked);
      if (!mods.length) return U.toast('Pick at least one module', 'bad');
      const source = U.$('[data-source]', el).value;
      const used = [];
      const modules = mods.map((m) => {
        const qids = Bank.pickPaper(m, PER_MODULE, { source, exclude: used });
        used.push(...qids);
        return { module: m, qids };
      }).filter((x) => x.qids.length);
      if (!modules.length) return U.toast('No questions available for those modules', 'bad');
      const mock = { id: U.uid('mock-'), at: Date.now(), modules, current: 0, done: false, strict: U.$('[data-strict]', el).checked };
      Store.saveMock(mock);
      startModule(mock);
    };
  }

  function startModule(mock) {
    const part = mock.modules[mock.current];
    const n = part.qids.length;
    Views.session.start({
      kind: 'mock', mode: 'exam',
      title: `${U.moduleName(part.module)} – module ${mock.current + 1} of ${mock.modules.length}`,
      subtitle: `Mock · ${n} questions · ${mock.strict === false ? 'untimed' : U.fmtTime(Math.round(n * (MINUTES * 60 / PER_MODULE)))}`,
      qids: part.qids,
      timeLimit: mock.strict === false ? null : Math.round(n * (MINUTES * 60 / PER_MODULE)),
      returnTo: '#/mock/' + mock.id,
      mock: { id: mock.id, index: mock.current },
    });
  }

  // Called by the session player when a mock module ends.
  Mock.moduleDone = (s) => {
    const mock = Store.mocks().find((m) => m.id === s.mock.id);
    Store.clearActive();
    if (!mock) { U.go('#/mock'); return; }
    const part = mock.modules[s.mock.index];
    part.answers = s.answers; part.times = s.times; part.flags = s.flags; part.elapsed = Math.round(s.elapsed);
    part.score = part.qids.filter((id) => { const q = Bank.byId(id); return q && s.answers[id] === q.answer; }).length;
    mock.current = s.mock.index + 1;
    if (mock.current >= mock.modules.length) { mock.done = true; mock.finishedAt = Date.now(); }
    Store.saveMock(mock);
    App.guard = null;
    U.go('#/mock/' + mock.id);
  };

  function renderMock(el, id) {
    const mock = Store.mocks().find((m) => m.id === id);
    if (!mock) { el.innerHTML = '<div class="page"><div class="empty">Mock not found. <a href="#/mock">Back</a></div></div>'; return; }
    if (!mock.done) {
      const active = Store.active();
      if (active && active.mock && active.mock.id === mock.id) {
        el.innerHTML = `<div class="page" style="max-width:640px"><div class="card" style="text-align:center;padding:40px">
          <h2>Module in progress</h2><p class="muted">${U.esc(active.title)}</p><a class="btn primary lg" href="#/practice/run">Resume →</a></div></div>`;
        return;
      }
      const next = mock.modules[mock.current];
      const n = next.qids.length;
      el.innerHTML = `<div class="page" style="max-width:680px"><div class="card" style="text-align:center;padding:40px 30px">
        ${mock.current > 0 ? `<p class="chip good">Module ${mock.current} complete</p>` : ''}
        <h1 style="margin-top:12px">Module ${mock.current + 1} of ${mock.modules.length}: ${U.moduleName(next.module)}</h1>
        <p class="muted" style="font-size:16px">${n} questions · ${U.fmtTime(Math.round(n * MINUTES * 60 / PER_MODULE))} · no calculator</p>
        <p class="muted">The clock starts when you press start. Results and solutions come at the end of the whole mock.</p>
        <div class="row" style="justify-content:center;margin-top:20px"><a class="btn" href="#/mock">Later</a><button class="btn primary lg" data-go>Start module →</button></div>
      </div></div>`;
      U.$('[data-go]', el).onclick = () => startModule(mock);
      return;
    }

    const rows = mock.modules.map((p) => {
      const n = p.qids.length;
      const est = n >= 20 ? estimateScaled(p.module, p.score, n) : null;
      return { p, n, est, pct: percentile(p.module, est) };
    });
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><div class="crumbs"><a href="#/mock">← Mocks</a></div><h1>Mock results</h1><p>${U.fmtDateTime(mock.at)}</p></div>
        <div class="row"><button class="btn danger sm" data-del>Delete</button>${Store.dueReview().length ? `<a class="btn primary" href="#/review">Review mistakes (${Store.dueReview().length})</a>` : ''}</div></div>
      <div class="grid c${Math.min(3, rows.length)}">${rows.map(({ p, n, est, pct }) => `<div class="card">
        <div class="row between"><h3 style="margin:0">${U.moduleName(p.module)}</h3><span class="chip">${U.fmtTime(p.elapsed || 0)} used</span></div>
        <div class="row" style="align-items:baseline;margin-top:10px"><span class="score-big">${p.score}/${n}</span><span class="muted">${U.pct(p.score / n)}</span></div>
        <div class="bar ${p.score / n >= 0.6 ? 'good' : p.score / n >= 0.4 ? '' : 'bad'}" style="margin:8px 0"><i style="width:${(100 * p.score / n).toFixed(0)}%"></i></div>
        ${est != null ? `<div class="muted" style="font-size:13.5px" title="Rough estimate using UAT-UK's published scaling for this module, assuming a typical spread of question difficulty. Real papers vary – treat this as ±1.">≈ <b style="color:var(--ink)">${est.toFixed(1)}</b> on the 1–9 ESAT scale (rough) · around the ${ordinal(pct)} percentile of Oct 2024 candidates</div>` : '<div class="muted" style="font-size:13px">Too few questions for a scale estimate.</div>'}
      </div>`).join('')}</div>
      ${rows.map(({ p }) => {
        const qsList = p.qids.map((id) => Bank.byId(id)).filter(Boolean);
        return `<div class="card" style="margin-top:14px"><h2>${U.moduleName(p.module)}</h2>${Views.session.resultsTable(qsList, p)}</div>`;
      }).join('')}
      <p class="muted" style="font-size:12.5px;margin-top:14px">Scale estimates use the scaling constants and percentiles in UAT-UK's ESAT Technical Report 2024–25. Item difficulties aren't published, so these are approximations.</p>
    </div>`;
    const tables = U.$$('table.tbl', el);
    rows.forEach(({ p }, i) => Views.session.bindResultRows(tables[i], p.qids.map((id) => Bank.byId(id)).filter(Boolean), p));
    U.$('[data-del]', el).onclick = async () => {
      if (await U.confirm('Delete this mock?', 'Your answers stay in your stats; only the mock record is removed.', 'Delete', true)) { Store.deleteMock(mock.id); U.go('#/mock'); }
    };
  }

  function ordinal(n) {
    if (n == null) return '–';
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  (window.Views = window.Views || {}).mock = Mock;
})();
