/* Home: countdown, streak, what to do next. */
(window.Views = window.Views || {}).dashboard = {
  render(el) {
    const prof = Store.profile();
    const mods = prof.modules;
    const att = Store.liveAttempts();
    const st = Bank.stats(att);
    const today = U.dayKey(Date.now());
    const todayCount = Store.attempts().filter((a) => U.dayKey(a.at) === today).length;
    const due = Store.dueReview();
    const active = Store.active();
    const lastMock = Store.mocks().filter((m) => m.done).sort((a, b) => b.at - a.at)[0];
    const weak = Bank.weakest(mods, 5);

    // streak: consecutive days (ending today or yesterday) with at least one answer
    const days = new Set(Store.attempts().map((a) => U.dayKey(a.at)));
    let streak = 0;
    for (let d = new Date(); ; d.setDate(d.getDate() - 1)) {
      const k = U.dayKey(d.getTime());
      if (days.has(k)) streak++;
      else if (k === today) continue;
      else break;
    }
    let countdown = '';
    if (prof.testDate) {
      const daysLeft = Math.ceil((new Date(prof.testDate + 'T09:00:00') - Date.now()) / U.DAY);
      countdown = daysLeft >= 0 ? `<div class="countdown">${daysLeft}</div><div class="muted">day${daysLeft === 1 ? '' : 's'} until your ESAT</div>` : '<div class="muted">Test date passed – update it in your profile.</div>';
    }
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    el.innerHTML = `<div class="page">
      ${active ? `<div class="notice warn row between" style="margin-bottom:14px"><span>Unfinished: <b>${U.esc(active.title)}</b> (${Object.keys(active.answers || {}).length}/${active.qids.length} answered)</span>
        <span class="row"><button class="btn sm ghost" data-discard>Discard</button><a class="btn sm primary" href="#/practice/run">Resume →</a></span></div>` : ''}
      <div class="card hero">
        <div class="row between" style="align-items:flex-start">
          <div><h1 style="margin-bottom:4px">${greet}${prof.name ? ', ' + U.esc(prof.name) : ''}</h1>
            <div class="muted">${U.esc(prof.courseName || '')}${prof.courseName ? ' · ' : ''}${mods.map(U.moduleName).join(' · ')}</div>
            <div class="row" style="margin-top:18px">
              <a class="btn primary" href="#/practice?modules=${mods.join(',')}&n=10&title=${encodeURIComponent('Mixed practice')}&back=${encodeURIComponent('#/')}">Practise 10 questions</a>
              <a class="btn" href="#/mock">Full mock (${mods.length} module${mods.length > 1 ? 's' : ''})</a>
              <a class="btn" href="#/review">Review queue${due.length ? ` (${due.length} due)` : ''}</a>
            </div></div>
          <div style="text-align:right">${countdown}</div>
        </div>
      </div>

      <div class="grid c4" style="margin-top:14px">
        <div class="card stat"><span class="l">Today</span><span class="v">${todayCount}</span><span class="muted">questions</span></div>
        <div class="card stat"><span class="l">Streak</span><span class="v">${streak}🔥</span><span class="muted">day${streak === 1 ? '' : 's'}</span></div>
        <div class="card stat"><span class="l">Review due</span><span class="v">${due.length}</span><span class="muted">${Object.keys(Store.review()).length} in queue</span></div>
        <div class="card stat"><span class="l">Last mock</span><span class="v">${lastMock ? lastMock.modules.map((m) => m.score).join('·') : '–'}</span><span class="muted">${lastMock ? '/ ' + lastMock.modules.map((m) => m.qids.length).join('·') : 'none yet'}</span></div>
      </div>

      <div class="split" style="margin-top:14px">
        <div>
          <h2 style="margin:6px 0 10px">Your modules</h2>
          <div class="grid c${Math.min(3, mods.length)}">${mods.map((m) => {
            const s = st.module[m] || { n: 0 };
            const bankN = Bank.forModule(m).length;
            const seen = new Set(att.filter((a) => a.module === m).map((a) => a.qid)).size;
            return `<a class="card mod-card" href="#/bank/${m}" style="color:inherit;text-decoration:none">
              <div class="top"><h3>${U.moduleName(m)}</h3><span class="chip">${bankN} Qs</span></div>
              <div class="row between"><span class="muted">Accuracy</span><b>${U.pct(s.acc)}</b></div>
              <div class="bar ${s.acc >= 0.7 ? 'good' : s.acc != null && s.acc < 0.45 ? 'bad' : ''}"><i style="width:${s.acc != null ? Math.round(s.acc * 100) : 0}%"></i></div>
              <div class="row between"><span class="muted">Avg time</span><b ${s.avg > 89 ? 'style="color:var(--warn)"' : ''}>${U.fmtSecs(s.avg)}</b></div>
              <div class="row between"><span class="muted">Seen</span><b>${seen}/${bankN}</b></div>
            </a>`;
          }).join('')}</div>
        </div>
        <div class="card">
          <h3>Work on next</h3>
          ${weak.length ? `<ul class="list-plain">${weak.map((w) => `<li class="row between"><span><b>${w.code}</b> ${U.esc(Bank.specTitle(w.code))}<br><small>${U.pct(w.acc)} right · ${U.fmtSecs(w.avg)} avg · ${w.n} tries</small></span>
            <a class="btn sm" href="#/practice?spec=${encodeURIComponent(w.code)}&n=8&back=${encodeURIComponent('#/')}">Practise</a></li>`).join('')}</ul>`
            : `<p class="muted">Answer a few questions in each topic and your weakest spec points (by accuracy and time) will show up here.</p>
               <a class="btn sm" href="#/bank/${mods[0]}">Browse ${U.moduleName(mods[0])}</a>`}
          ${AI.isConfigured() && weak.length ? `<hr><a class="btn sm" href="#/generate?specs=${weak.slice(0, 3).map((w) => w.code).join(',')}">✚ Make fresh questions on these with AI</a>` : ''}
        </div>
      </div>

      ${!AI.isConfigured() ? `<div class="card" style="margin-top:14px"><div class="row between"><div><h3 style="margin:0">Unlock the AI features</h3>
        <p class="muted" style="margin:4px 0 0">Plug in any model's API key to get a tutor on every question, marking of your working against the solution, mock interviews, and unlimited new questions for your weak spots.</p></div>
        <a class="btn primary" href="#/settings">Connect a model</a></div></div>` : ''}
    </div>`;

    const disc = U.$('[data-discard]', el);
    if (disc) disc.onclick = async () => {
      if (await U.confirm('Discard the unfinished session?', 'Answers already checked are kept in your stats.', 'Discard', true)) { Store.clearActive(); U.go('#/'); }
    };
  },
};
