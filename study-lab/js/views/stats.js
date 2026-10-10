/* Progress: accuracy and timing per spec point, activity, mock history. */
(window.Views = window.Views || {}).stats = {
  render(el, { params }) {
    const mods = Store.studyUnits(['current', 'done']);
    const showAll = params.all === '1';
    const myCourses = new Set(mods.map((u) => Courses.unit(u).course));
    const list = showAll ? Courses.all().filter((c) => myCourses.has(c.id)).flatMap((c) => c.units.map((u) => u.id)) : mods;
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
    // marks scored ÷ marks available, like every other score in the app (a 5/8 written answer counts 0.625)
    const total = att.length, right = att.reduce((t, a) => t + Bank.value(a), 0);

    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Statistics</h1><p>Scores and timing per spec point, from everything you've answered. (Your learned/learning ticks live on the <a href="#/map">Progress map</a>.)</p></div>
        <div class="seg"><button class="${showAll ? '' : 'on'}" data-all="0">My units</button><button class="${showAll ? 'on' : ''}" data-all="1">All units in my courses</button></div></div>
      <div class="grid c4">
        <div class="card stat"><span class="l">Answered</span><span class="v">${total}</span></div>
        <div class="card stat"><span class="l">Accuracy</span><span class="v">${U.pct(total ? right / total : null)}</span></div>
        <div class="card stat"><span class="l">Mocks done</span><span class="v">${mocks.length}</span></div>
        <div class="card stat"><span class="l">Spec points tried</span><span class="v">${list.flatMap((m) => Courses.points(m)).filter((p) => st.spec[p.key]).length}</span><span class="muted">of ${list.reduce((a, m) => a + Courses.points(m).length, 0)}</span></div>
      </div>

      <div class="card" style="margin-top:14px">
        <div class="row between"><h2 style="margin:0">Spec map</h2>${C.accLegend()}</div>
        <p class="muted" style="font-size:13px">Each tile is one spec point. Hover for details, click to open it.</p>
        ${list.map((m) => {
          const mod = Bank.module(m);
          const ms = st.module[m] || {};
          return `<h3 style="margin-top:18px">${U.esc(U.moduleName(m))} <span class="muted" style="font-weight:500;font-size:13px">· ${U.pct(ms.acc)}${ms.avg != null ? ' · avg ' + U.fmtSecs(ms.avg) : ''}${ms.perMark != null ? ' · ' + U.fmtSecs(ms.perMark) + ' per mark' : ''} ${ms.avg > 89 ? '<span class="chip warn">slower than exam pace</span>' : ''}${ms.perMark > 80 ? '<span class="chip warn">slower than 1.2 min/mark</span>' : ''}</span></h3>
            ${mod.sections.map((sec) => `<div class="row" style="align-items:flex-start;margin-bottom:6px;flex-wrap:nowrap"><div style="width:170px;flex:none;font-size:13px;padding-top:6px" class="muted">${U.esc(sec.code)} ${U.esc(sec.title)}</div>
              <div class="heat">${sec.points.map((p) => {
                const s = st.spec[p.key];
                return `<a href="#/bank/${m}?spec=${encodeURIComponent(p.key)}" style="${C.accStyle(s ? s.acc : null)}" title="${U.esc(Courses.label(p.key) + ' ' + p.title)}\n${s ? `${U.pct(s.acc)} over ${s.n} attempt${s.n === 1 ? '' : 's'}${s.avg != null ? ' · avg ' + U.fmtSecs(s.avg) : ''}` : 'not tried yet'}">${U.esc(p.code.replace(/^[A-Z]+/, ''))}</a>`;
              }).join('')}</div></div>`).join('')}`;
        }).join('')}
      </div>

      <div class="grid c2" style="margin-top:14px">
        <div class="card"><h2>Weakest spec points</h2>
          ${weak.length ? `<table class="tbl"><thead><tr><th>Spec</th><th class="num">Right</th><th class="num">Avg time</th><th></th></tr></thead><tbody>${weak.map((w) => `<tr>
            <td><b>${U.esc(Bank.specLabel(w.code))}</b> ${U.esc(Bank.specTitle(w.code))}</td><td class="num">${U.pct(w.recentAcc ?? w.acc)} <small>(${w.n})</small></td><td class="num">${w.avg != null ? U.fmtSecs(w.avg) : w.perMark != null ? U.fmtSecs(w.perMark) + '/mk' : '–'}</td>
            <td><a class="btn sm" href="#/practice?spec=${encodeURIComponent(w.code)}&n=8&back=${encodeURIComponent('#/stats')}">Practise</a></td></tr>`).join('')}</tbody></table>` : '<div class="empty">Not enough data yet – try a few questions per topic.</div>'}
        </div>
        <div class="card"><h2>Pace</h2>
          <table class="tbl"><thead><tr><th>Unit</th><th class="num">Your pace</th><th class="num">Target</th></tr></thead><tbody>
          ${list.filter((m) => st.module[m]).map((m) => { const s = st.module[m] || {}; const esat = Courses.unit(m).course === 'esat';
            const v = esat ? s.avg : s.perMark, t = esat ? 89 : 72;
            return `<tr><td>${U.esc(U.moduleShort(m))}</td><td class="num">${v != null ? U.fmtSecs(v) + (esat ? '/question' : '/mark') : '–'}</td><td class="num">${v != null ? (v <= t ? '<span class="chip good">✓ on pace</span>' : `<span class="chip warn">+${Math.round(v - t)}s</span>`) : (esat ? '89s/q' : '72s/mark')}</td></tr>`; }).join('') || '<tr><td colspan="3" class="muted">No timed answers yet.</td></tr>'}
          </tbody></table>
          <p class="muted" style="font-size:13px">ESAT: 40 minutes ÷ 27 questions ≈ 89 s each. A-level papers: about 1.2 minutes (72 s) per mark.</p>
        </div>
      </div>

      <div class="grid c2" style="margin-top:14px">
        <div class="card"><h2>Questions per day</h2><p class="muted" style="font-size:13px;margin-top:-4px">Last 30 days</p>${C.barChart(days, { label: 'Questions answered per day, last 30 days', labelEvery: 5 })}</div>
        <div class="card"><h2>ESAT mock scores</h2><p class="muted" style="font-size:13px;margin-top:-4px">Percentage correct across all modules in each mock</p>${C.lineChart(mockPts, { max: 1, fmt: (v) => Math.round(v * 100) + '%', label: 'Mock score over time' })}</div>
      </div>

      <div class="card" style="margin-top:14px"><h3>Reset a module's stats</h3>
        <p class="muted" style="font-size:14px">Starts that module's stats afresh from now (e.g. after a break). Your history isn't deleted and the review queue stays as it is.</p>
        <div class="row">${mods.map((m) => `<button class="btn sm" data-reset="${m}">${U.esc(U.moduleShort(m))}${Store.cutoffs()[m] ? ` <small>(reset ${U.fmtDate(Store.cutoffs()[m])})</small>` : ''}</button>`).join('')}</div>
      </div>
    </div>`;

    U.$$('[data-all]', el).forEach((b) => b.onclick = () => U.go('#/stats' + (b.dataset.all === '1' ? '?all=1' : '')));
    U.$$('[data-reset]', el).forEach((b) => b.onclick = async () => {
      if (await U.confirm(`Reset ${U.moduleName(b.dataset.reset)} stats?`, 'Stats will only count answers from now on. Nothing is deleted.', 'Reset')) { Store.resetModule(b.dataset.reset); App.route(); }
    });
  },
};
