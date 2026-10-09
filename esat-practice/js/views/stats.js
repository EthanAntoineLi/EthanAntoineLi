/* Progress: accuracy and timing per spec point, activity, mock history. */
(window.Views = window.Views || {}).stats = {
  render(el, { params }) {
    const prof = Store.profile();
    const mods = prof.modules;
    const showAll = params.all === '1';
    const list = showAll ? window.ESAT_MODULE_ORDER : mods;
    const att = Store.liveAttempts();
    const st = Bank.stats(att);

    // last 30 days activity
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * U.DAY);
      const k = U.dayKey(d.getTime());
      days.push({ k, label: d.getDate() === 1 || i === 29 || i === 0 ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : String(d.getDate()), value: 0 });
    }
    const byDay = Object.fromEntries(days.map((d) => [d.k, d]));
    Store.attempts().forEach((a) => { const d = byDay[U.dayKey(a.at)]; if (d) d.value++; });
    days.forEach((d) => { d.title = `${d.k}: ${d.value} question${d.value === 1 ? '' : 's'}`; });

    const mocks = Store.mocks().filter((m) => m.done).sort((a, b) => a.at - b.at);
    const mockPts = mocks.map((m) => {
      const got = m.modules.reduce((s, x) => s + (x.score || 0), 0), of = m.modules.reduce((s, x) => s + x.qids.length, 0);
      return { value: of ? got / of : 0, label: new Date(m.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), title: `${U.fmtDate(m.at)}: ${m.modules.map((x) => `${U.moduleShort(x.module)} ${x.score}/${x.qids.length}`).join(', ')}` };
    });
    const weak = Bank.weakest(list, 10);
    const total = att.length, right = att.filter((a) => a.correct).length;

    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Progress</h1><p>Accuracy and timing are tracked per spec point, so you can see exactly what to work on next.</p></div>
        <div class="seg"><button class="${showAll ? '' : 'on'}" data-all="0">My modules</button><button class="${showAll ? 'on' : ''}" data-all="1">All modules</button></div></div>
      <div class="grid c4">
        <div class="card stat"><span class="l">Answered</span><span class="v">${total}</span></div>
        <div class="card stat"><span class="l">Accuracy</span><span class="v">${U.pct(total ? right / total : null)}</span></div>
        <div class="card stat"><span class="l">Mocks done</span><span class="v">${mocks.length}</span></div>
        <div class="card stat"><span class="l">Spec points tried</span><span class="v">${Object.keys(st.spec).length}</span><span class="muted">of ${list.reduce((a, m) => a + Bank.module(m).sections.reduce((b, s) => b + s.points.length, 0), 0)}</span></div>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="row between"><h2 style="margin:0">Spec map</h2>${C.accLegend()}</div>
        <p class="muted" style="font-size:13px">Each tile is one spec point. Hover for details, click to open it.</p>
        ${list.map((m) => {
          const mod = Bank.module(m);
          const ms = st.module[m] || {};
          return `<h3 style="margin-top:18px">${mod.name} <span class="muted" style="font-weight:500;font-size:13px">· ${U.pct(ms.acc)} · avg ${U.fmtSecs(ms.avg)} ${ms.avg > 89 ? '<span class="chip warn">slower than exam pace</span>' : ''}</span></h3>
            ${mod.sections.map((sec) => `<div class="row" style="align-items:flex-start;margin-bottom:6px;flex-wrap:nowrap"><div style="width:170px;flex:none;font-size:13px;padding-top:6px" class="muted">${sec.code} ${U.esc(sec.title)}</div>
              <div class="heat">${sec.points.map((p) => {
                const s = st.spec[p.code];
                return `<a href="#/bank/${m}?spec=${encodeURIComponent(p.code)}" style="${C.accStyle(s ? s.acc : null)}" title="${U.esc(p.code + ' ' + p.title)}\n${s ? `${s.right}/${s.n} right (${U.pct(s.acc)}) · avg ${U.fmtSecs(s.avg)}` : 'not tried yet'}">${p.code.replace(/^[A-Z]+/, '')}</a>`;
              }).join('')}</div></div>`).join('')}`;
        }).join('')}
      </div>

      <div class="grid c2" style="margin-top:14px">
        <div class="card"><h2>Weakest spec points</h2>
          ${weak.length ? `<table class="tbl"><thead><tr><th>Spec</th><th class="num">Right</th><th class="num">Avg time</th><th></th></tr></thead><tbody>${weak.map((w) => `<tr>
            <td><b>${w.code}</b> ${U.esc(Bank.specTitle(w.code))}</td><td class="num">${U.pct(w.acc)} <small>(${w.n})</small></td><td class="num">${U.fmtSecs(w.avg)}</td>
            <td><a class="btn sm" href="#/practice?spec=${encodeURIComponent(w.code)}&n=8&back=${encodeURIComponent('#/stats')}">Practise</a></td></tr>`).join('')}</tbody></table>` : '<div class="empty">Not enough data yet – try a few questions per topic.</div>'}
        </div>
        <div class="card"><h2>Time per question</h2>
          <table class="tbl"><thead><tr><th>Module</th><th class="num">Avg</th><th class="num">vs 89s pace</th></tr></thead><tbody>
          ${list.map((m) => { const s = st.module[m] || {}; return `<tr><td>${U.moduleName(m)}</td><td class="num">${U.fmtSecs(s.avg)}</td><td class="num">${s.avg != null ? (s.avg <= 89 ? '<span class="chip good">✓ on pace</span>' : `<span class="chip warn">+${Math.round(s.avg - 89)}s</span>`) : '–'}</td></tr>`; }).join('')}
          </tbody></table>
          <p class="muted" style="font-size:13px">40 minutes ÷ 27 questions ≈ 89 seconds each. Practice in exam conditions to build speed.</p>
        </div>
      </div>

      <div class="grid c2" style="margin-top:14px">
        <div class="card"><h2>Questions per day</h2><p class="muted" style="font-size:13px;margin-top:-4px">Last 30 days</p>${C.barChart(days, { label: 'Questions answered per day, last 30 days', labelEvery: 5 })}</div>
        <div class="card"><h2>Mock scores</h2><p class="muted" style="font-size:13px;margin-top:-4px">Percentage correct across all modules in each mock</p>${C.lineChart(mockPts, { max: 1, fmt: (v) => Math.round(v * 100) + '%', label: 'Mock score over time' })}</div>
      </div>

      <div class="card" style="margin-top:14px"><h3>Reset a module's stats</h3>
        <p class="muted" style="font-size:14px">Starts that module's stats afresh from now (e.g. after a break). Your history isn't deleted and the review queue stays as it is.</p>
        <div class="row">${window.ESAT_MODULE_ORDER.map((m) => `<button class="btn sm" data-reset="${m}">${U.moduleShort(m)}${Store.cutoffs()[m] ? ` <small>(reset ${U.fmtDate(Store.cutoffs()[m])})</small>` : ''}</button>`).join('')}</div>
      </div>
    </div>`;

    U.$$('[data-all]', el).forEach((b) => b.onclick = () => U.go('#/stats' + (b.dataset.all === '1' ? '?all=1' : '')));
    U.$$('[data-reset]', el).forEach((b) => b.onclick = async () => {
      if (await U.confirm(`Reset ${U.moduleName(b.dataset.reset)} stats?`, 'Stats will only count answers from now on. Nothing is deleted.', 'Reset')) { Store.resetModule(b.dataset.reset); App.route(); }
    });
  },
};
