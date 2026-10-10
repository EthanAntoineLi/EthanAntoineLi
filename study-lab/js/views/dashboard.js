/* Home: how far you've got in each subject, what's due, what to work on next. */
(window.Views = window.Views || {}).dashboard = {
  render(el) {
    const prof = Store.profile();
    const att = Store.liveAttempts();
    const st = Bank.stats(att);
    const today = U.dayKey(Date.now());
    const todayCount = Store.attempts().filter((a) => U.dayKey(a.at) === today).length;
    const dueMistakes = Store.dueReview();
    const active = Store.active();
    const status = Store.specStatus();
    const current = Store.studyUnits(['current']);
    const mine = Store.studyUnits(['current', 'done']);
    const weak = Bank.weakest(mine, 6);

    // topics due across current units + the earlier units they build on (same scope as the Review page)
    const topicsDue = Bank.topicReview(Store.defaultReviewScope()).filter((r) => r.due >= 1).length;

    // streak
    const days = new Set(Store.attempts().map((a) => U.dayKey(a.at)));
    let streak = 0;
    for (let d = new Date(); ; d.setDate(d.getDate() - 1)) {
      const k = U.dayKey(d.getTime());
      if (days.has(k)) streak++;
      else if (k === today) continue;
      else break;
    }
    let countdown = '';
    if (Store.esatOn() && prof.testDate) {
      const daysLeft = Math.ceil((new Date(prof.testDate + 'T09:00:00') - Date.now()) / U.DAY);
      countdown = daysLeft >= 0 ? `<div class="countdown">${daysLeft}</div><div class="muted">day${daysLeft === 1 ? '' : 's'} until your ESAT</div>` : '';
    }
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const courses = Courses.all().filter((c) => c.kind !== 'esat' && c.units.some((u) => Store.unitStatus(u.id)));
    const esatMods = Store.esatModules();

    const courseCard = (c) => {
      const units = c.units.filter((u) => Store.unitStatus(u.id));
      const pts = units.flatMap((u) => Courses.points(u.id));
      const learned = pts.filter((p) => status[p.key] && status[p.key].s === 'learned').length;
      const learning = pts.filter((p) => status[p.key] && status[p.key].s === 'learning').length;
      const shaky = pts.filter((p) => status[p.key] && status[p.key].s === 'shaky').length;
      const w = (x) => (pts.length ? (100 * x / pts.length).toFixed(1) : 0);
      return `<div class="card">
        <div class="row between"><h3 style="margin:0">${U.esc(c.name)}</h3><a class="btn sm" href="#/map?course=${c.id}">Progress map →</a></div>
        <div class="row" style="margin:10px 0 6px;align-items:baseline"><span class="score-big" style="font-size:1.6rem">${pts.length ? Math.round(100 * learned / pts.length) : 0}%</span><span class="muted">learned · ${learned}/${pts.length} spec points${shaky ? ` · <span style="color:var(--bad)">${shaky} shaky</span>` : ''}</span></div>
        <div class="stackbar"><i class="st-learned" style="width:${w(learned)}%"></i><i class="st-learning" style="width:${w(learning)}%"></i><i class="st-shaky" style="width:${w(shaky)}%"></i></div>
        <div class="row" style="margin-top:10px">${units.map((u) => {
          const s = st.module[u.id];
          return `<a class="chip ${Store.unitStatus(u.id) === 'current' ? 'blue' : ''}" href="#/map?course=${c.id}&unit=${u.id}" title="${U.esc(u.name)}">${U.esc(u.short)}${s ? ' · ' + U.pct(s.acc) : ''}</a>`;
        }).join('')}</div>
        <div class="row" style="margin-top:12px">${units.filter((u) => Store.unitStatus(u.id) === 'current').map((u) => `<a class="btn sm primary" href="#/practice?module=${u.id}&n=6&back=${encodeURIComponent('#/')}">Practise ${U.esc(u.short)}</a>`).join('')}</div>
      </div>`;
    };

    el.innerHTML = `<div class="page">
      ${active ? `<div class="notice warn row between" style="margin-bottom:14px"><span>Unfinished: <b>${U.esc(active.title)}</b> (${Object.keys(active.answers || {}).length + Object.keys(active.written || {}).length}/${active.qids.length} answered)</span>
        <span class="row"><button class="btn sm ghost" data-discard>Discard</button><a class="btn sm primary" href="#/practice/run">Resume →</a></span></div>` : ''}
      <div class="card hero">
        <div class="row between" style="align-items:flex-start">
          <div><h1 style="margin-bottom:4px">${greet}${prof.name ? ', ' + U.esc(prof.name) : ''}</h1>
            <div class="muted">Studying now: ${current.map((u) => U.esc(U.moduleShort(u))).join(' · ') || 'nothing yet – <a href="#/setup" style="color:#fff">choose your units</a>'}</div>
            <div class="row" style="margin-top:18px">
              <a class="btn primary" href="#/review?tab=topics">Review topics${topicsDue ? ` (${topicsDue} due)` : ''}</a>
              ${dueMistakes.length ? `<a class="btn" href="#/review?tab=mistakes">Mistakes (${dueMistakes.length})</a>` : ''}
              <a class="btn" href="#/map">Progress map</a>
            </div></div>
          <div style="text-align:right">${countdown}</div>
        </div>
      </div>

      <div class="grid c4" style="margin-top:14px">
        <div class="card stat"><span class="l">Today</span><span class="v">${todayCount}</span><span class="muted">questions</span></div>
        <div class="card stat"><span class="l">Streak</span><span class="v">${streak}🔥</span><span class="muted">day${streak === 1 ? '' : 's'}</span></div>
        <div class="card stat"><span class="l">Topics due</span><span class="v">${topicsDue}</span><span class="muted">incl. earlier units</span></div>
        <div class="card stat"><span class="l">Mistakes due</span><span class="v">${dueMistakes.length}</span><span class="muted">${Object.keys(Store.review()).length} in queue</span></div>
      </div>

      <div class="split" style="margin-top:14px">
        <div class="stack">${courses.map(courseCard).join('')}
          ${esatMods.length ? `<div class="card"><div class="row between"><h3 style="margin:0">ESAT</h3><a class="btn sm" href="#/mock">Full mock (${esatMods.length} modules)</a></div>
            <div class="grid c${Math.min(3, esatMods.length)}" style="margin-top:10px">${esatMods.map((m) => {
              const s = st.module[m] || {};
              return `<a class="mod-card" href="#/bank/${m}" style="color:inherit;text-decoration:none;border:1px solid var(--line);border-radius:10px;padding:10px">
                <div class="row between"><b>${U.esc(Courses.unit(m).name)}</b><span class="muted">${U.pct(s.acc)}</span></div>
                <div class="bar ${s.acc >= 0.7 ? 'good' : s.acc != null && s.acc < 0.45 ? 'bad' : ''}" style="margin-top:6px"><i style="width:${s.acc != null ? Math.round(s.acc * 100) : 0}%"></i></div>
                <div class="muted" style="font-size:12px;margin-top:4px">avg ${U.fmtSecs(s.avg)} / question</div></a>`;
            }).join('')}</div>
            <div class="row" style="margin-top:10px"><a class="btn sm primary" href="#/practice?modules=${esatMods.join(',')}&n=10&title=${encodeURIComponent('ESAT mixed practice')}&back=${encodeURIComponent('#/')}">Practise 10 ESAT questions</a></div></div>` : ''}
          ${!courses.length && !esatMods.length ? '<div class="card empty"><p>No subjects yet.</p><a class="btn primary" href="#/setup">Choose your units</a></div>' : ''}
        </div>
        <div class="card">
          <h3>Weak points</h3>
          ${weak.length ? `<ul class="list-plain">${weak.map((w) => `<li class="row between"><span><b>${U.esc(Bank.specLabel(w.code))}</b> ${U.esc(Bank.specTitle(w.code))}<br><small>${U.pct(w.recentAcc ?? w.acc)} recently · ${w.n} attempt${w.n === 1 ? '' : 's'}</small></span>
            <a class="btn sm" href="#/practice?spec=${encodeURIComponent(w.code)}&n=6&back=${encodeURIComponent('#/')}">Practise</a></li>`).join('')}</ul>`
            : `<p class="muted">As you practise, the spec points where you lose the most marks show up here. You can also flag a topic as "shaky" on the progress map.</p>`}
          ${AI.isConfigured() && weak.length ? `<hr><a class="btn sm" href="#/generate?specs=${encodeURIComponent(weak.slice(0, 3).map((w) => w.code).join(','))}">✚ Make fresh questions on these with AI</a>` : ''}
        </div>
      </div>

      ${!AI.isConfigured() ? `<div class="card" style="margin-top:14px"><div class="row between"><div><h3 style="margin:0">Unlock AI marking</h3>
        <p class="muted" style="margin:4px 0 0">Plug in any model's API key and it will mark your written answers against the mark scheme, explain mistakes, write new questions on your weak spots and run mock interviews. Without a key you can still self-mark with the mark schemes.</p></div>
        <a class="btn primary" href="#/settings">Connect a model</a></div></div>` : ''}
    </div>`;

    const disc = U.$('[data-discard]', el);
    if (disc) disc.onclick = async () => {
      if (await U.confirm('Discard the unfinished session?', 'Answers already checked are kept in your stats.', 'Discard', true)) { Store.clearActive(); U.go('#/'); }
    };
  },
};
