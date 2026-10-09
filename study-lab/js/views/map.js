/* Progress map: every spec point of every unit you study. Mark each one as you go –
   learning → learned (green) – and see your weak points from what you've actually scored. */
(function () {
  const STATES = [
    { v: '', label: 'Not started', icon: '–', cls: 'st-none' },
    { v: 'learning', label: 'Learning', icon: '½', cls: 'st-learning' },
    { v: 'learned', label: 'Learned', icon: '✓', cls: 'st-learned' },
    { v: 'shaky', label: 'Shaky – needs work', icon: '!', cls: 'st-shaky' },
  ];
  const UNIT_STATUS = { current: 'Studying now', done: 'Done', later: 'Later' };

  function unitSummary(unitId, status, stats) {
    const pts = Courses.points(unitId);
    const c = { total: pts.length, learned: 0, learning: 0, shaky: 0, none: 0, tried: 0, right: 0, n: 0 };
    for (const p of pts) {
      const s = status[p.key] && status[p.key].s;
      if (s === 'learned') c.learned++; else if (s === 'learning') c.learning++; else if (s === 'shaky') c.shaky++; else c.none++;
      const st = stats[p.key];
      if (st) { c.tried++; c.right += st.right; c.n += st.n; }
    }
    c.acc = c.n ? c.right / c.n : null;
    return c;
  }

  function stackBar(c) {
    const w = (x) => (c.total ? (100 * x / c.total).toFixed(1) : 0);
    return `<div class="stackbar" title="${c.learned} learned · ${c.learning} learning · ${c.shaky} shaky · ${c.none} not started">
      <i class="st-learned" style="width:${w(c.learned)}%"></i><i class="st-learning" style="width:${w(c.learning)}%"></i><i class="st-shaky" style="width:${w(c.shaky)}%"></i></div>`;
  }

  const V = {};
  V.render = (el, { params }) => {
    const courses = Courses.all().filter((c) => c.kind === 'esat' ? Store.esatOn() : c.units.some((u) => Store.unitStatus(u.id)));
    if (!courses.length) {
      el.innerHTML = '<div class="page"><div class="empty"><p>Choose the units you study first.</p><a class="btn primary" href="#/setup">Choose subjects</a></div></div>';
      return;
    }
    const courseId = params.course && courses.find((c) => c.id === params.course) ? params.course : (params.unit && Courses.unit(params.unit) ? Courses.unit(params.unit).course : courses[0].id);
    const course = Courses.course(courseId);
    const order = { current: 0, done: 1, later: 2 };
    const myUnits = course.units.filter((u) => Store.unitStatus(u.id)).sort((a, b) => order[Store.unitStatus(a.id)] - order[Store.unitStatus(b.id)]);
    const unitId = params.unit && myUnits.find((u) => u.id === params.unit) ? params.unit : (myUnits[0] && myUnits[0].id);
    const status = Store.specStatus();
    const stats = Bank.stats().spec;
    const counts = Bank.countBySpec();
    const showWeak = params.weak === '1';

    const all = myUnits.map((u) => unitSummary(u.id, status, stats));
    const tot = all.reduce((a, c) => ({ total: a.total + c.total, learned: a.learned + c.learned, learning: a.learning + c.learning, shaky: a.shaky + c.shaky, none: a.none + c.none }), { total: 0, learned: 0, learning: 0, shaky: 0, none: 0 });

    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Progress map</h1><p>Set each spec point as you learn it – it turns <b style="color:var(--good)">green</b> when learned. Your marks update it too: score well on a point and it goes green, struggle and it's flagged shaky. Colours on the right show how you've actually scored.</p></div>
        ${courses.length > 1 ? `<div class="seg">${courses.map((c) => `<button data-course="${c.id}" class="${c.id === courseId ? 'on' : ''}">${U.esc(c.short)}</button>`).join('')}</div>` : ''}</div>
      <div class="card">
        <div class="row between"><div><h2 style="margin:0">${U.esc(course.name)}</h2><div class="muted" style="font-size:13px">${U.esc(course.board)}</div></div>
          <div class="row" data-coursetot>${courseTotHTML(tot)}</div></div>
        <div style="margin-top:10px" data-coursebar>${stackBar(tot)}</div>
        <div class="legend" style="margin-top:8px">${STATES.map((s) => `<span><i class="${s.cls}"></i>${s.label}</span>`).join('')}</div>
      </div>
      <div class="mapgrid">
        <div class="unitlist">${myUnits.map((u, i) => unitCardHTML(u, all[i], u.id === unitId, courseId)).join('')}
          <a class="btn sm ghost" href="#/setup" style="margin-top:6px">Change units…</a></div>
        <div data-unit-panel></div>
      </div>
    </div>`;
    U.$$('[data-course]', el).forEach((b) => b.onclick = () => U.go('#/map?course=' + b.dataset.course));
    if (unitId) drawUnit(U.$('[data-unit-panel]', el), Courses.unit(unitId), { status, stats, counts, showWeak, courseId });
  };

  function drawUnit(host, unit, ctx) {
    const { stats, counts } = ctx;
    let status = ctx.status;
    const pts = Courses.points(unit.id);
    const weak = pts.filter((p) => {
      const st = stats[p.key], s = status[p.key] && status[p.key].s;
      return s === 'shaky' || (st && st.n >= 1 && (st.recentAcc ?? st.acc) < 0.6);
    });
    const pre = Courses.prereqChain(unit.id).filter((id) => Courses.unit(id));
    const back = encodeURIComponent(location.hash);
    host.innerHTML = `<div class="card">
        <div class="row between"><div><h2 style="margin:0">${U.esc(unit.short)} · ${U.esc(unit.name)}</h2>
          <div class="muted" style="font-size:13px">${unit.code ? U.esc(unit.code) + ' · ' : ''}${unit.level || ''}${pre.length ? ` · builds on ${pre.map((id) => `<a href="#/map?unit=${id}">${U.esc(Courses.unit(id).short)}</a>`).join(', ')}` : ''}</div></div>
          <div class="row">
            <a class="btn sm primary" href="#/practice?module=${unit.id}&n=8&back=${back}">Practise unit</a>
            <a class="btn sm" href="#/review?tab=topics&units=${[unit.id].concat(pre).join(',')}">Review ${pre.length ? 'with earlier units' : 'unit'}</a>
            <button class="btn sm ghost" data-weak>${ctx.showWeak ? 'Show all' : 'Weak points only'}</button>
          </div></div>
        ${weak.length ? `<div class="notice warn" style="margin-top:12px"><b>Weak points (${weak.length}):</b> ${weak.slice(0, 8).map((p) => `<a href="#/bank/${unit.id}?spec=${encodeURIComponent(p.key)}">${U.esc(p.code)} ${U.esc(p.title)}</a>`).join(' · ')}${weak.length > 8 ? ' …' : ''}
          <div style="margin-top:6px"><a class="btn sm" href="#/practice?specs=${encodeURIComponent(weak.map((p) => p.key).join(','))}&n=8&title=${encodeURIComponent(unit.short + ' weak points')}&back=${back}">Practise weak points</a>
          ${AI.isConfigured() ? `<a class="btn sm" href="#/generate?specs=${encodeURIComponent(weak.slice(0, 6).map((p) => p.key).join(','))}">✚ New questions on these</a>` : ''}</div></div>` : ''}
      </div>
      ${unit.sections.map((sec) => {
        const rows = sec.points.filter((p) => !ctx.showWeak || weak.includes(p));
        if (!rows.length) return '';
        return `<div class="sec-head"><h3>${U.esc(sec.code)}. ${U.esc(sec.title)}</h3><span class="spacer"></span>
            <span class="muted" style="font-size:12px">whole topic:</span>${STATES.slice(1, 3).map((s) => `<button class="btn sm ghost" data-all="${sec.key}" data-v="${s.v}" title="Mark the whole topic as ${s.label.toLowerCase()}">${s.icon} ${s.label}</button>`).join('')}
            <a class="btn sm" href="#/practice?section=${encodeURIComponent(sec.key)}&n=8&back=${back}">Practise</a></div>
          <div class="card" style="padding:4px 12px"><div class="spec-list">${rows.map((p) => rowHTML(p, status, stats, counts, unit)).join('')}</div></div>`;
      }).join('')}`;

    U.$('[data-weak]', host).onclick = () => {
      const h = location.hash.replace(/&?weak=1/, '');
      U.go(ctx.showWeak ? h : h + (h.includes('?') ? '&' : '?') + 'weak=1');
    };
    host.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-set], button[data-all]');
      if (!b) return;
      if (b.dataset.set) {
        const key = b.dataset.set;
        Store.setSpecStatus(key, b.dataset.v);
        status = Store.specStatus();
        const row = b.closest('.map-row');
        row.outerHTML = rowHTML(Courses.spec(key).point, status, stats, counts, unit);
      } else {
        const sec = Courses.section(b.dataset.all);
        Store.setSpecStatusMany(sec.points.map((p) => p.key), b.dataset.v);
        App.route();
        return;
      }
      refreshBars(unit);
    });
  }

  function courseTotHTML(tot) {
    return `<span class="score-big" style="font-size:1.6rem">${tot.total ? Math.round(100 * tot.learned / tot.total) : 0}%</span><span class="muted">learned<br>${tot.learned}/${tot.total} spec points</span>`;
  }
  function courseTotals() {
    const status = Store.specStatus(), stats = Bank.stats().spec;
    return U.$$('[data-unitcard]').map((card) => unitSummary(card.dataset.unitcard, status, stats))
      .reduce((a, c) => ({ total: a.total + c.total, learned: a.learned + c.learned, learning: a.learning + c.learning, shaky: a.shaky + c.shaky, none: a.none + c.none }), { total: 0, learned: 0, learning: 0, shaky: 0, none: 0 });
  }

  function unitCardHTML(u, c, active, courseId) {
    return `<a class="unitcard ${active ? 'on' : ''}" data-unitcard="${u.id}" href="#/map?course=${courseId}&unit=${u.id}">
      <div class="row between"><b>${U.esc(u.short)}</b><span class="chip ${Store.unitStatus(u.id) === 'current' ? 'blue' : ''}">${UNIT_STATUS[Store.unitStatus(u.id)] || ''}</span></div>
      <div class="muted" style="font-size:12.5px;margin:2px 0 6px">${U.esc(u.name)}</div>
      ${stackBar(c)}
      <div class="row between" style="font-size:12px;margin-top:4px"><span>${c.learned}/${c.total} learned</span><span class="muted">${c.acc != null ? 'scoring ' + U.pct(c.acc) : 'no questions done'}</span></div>
    </a>`;
  }

  function refreshBars(unit) {
    const card = U.$(`[data-unitcard="${unit.id}"]`);
    if (!card) return;
    card.outerHTML = unitCardHTML(unit, unitSummary(unit.id, Store.specStatus(), Bank.stats().spec), true, unit.course);
    const tot = courseTotals();
    const t = U.$('[data-coursetot]'), bar = U.$('[data-coursebar]');
    if (t) t.innerHTML = courseTotHTML(tot);
    if (bar) bar.innerHTML = stackBar(tot);
  }

  function rowHTML(p, status, stats, counts, unit) {
    const s = (status[p.key] && status[p.key].s) || '';
    const auto = status[p.key] && status[p.key].auto ? ' – set from your marks' : '';
    const st = stats[p.key];
    const acc = st ? (st.recentAcc ?? st.acc) : null;
    const n = counts[p.key] || 0;
    const back = encodeURIComponent(location.hash);
    return `<div class="map-row ${STATES.find((x) => x.v === s).cls}" title="${U.esc(p.text)}">
      <span class="code">${U.esc(p.code)}</span>
      <span class="name">${U.esc(p.title)}<small class="muted desc">${U.esc(p.text)}</small></span>
      <span class="stateseg">${STATES.map((x) => `<button data-set="${U.esc(p.key)}" data-v="${x.v}" class="${x.v === s ? 'on ' + x.cls : ''}" title="${x.label}${x.v === s ? auto : ''}">${x.icon}</button>`).join('')}</span>
      <span class="perf" title="${st ? `${U.pct(st.acc)} over ${st.n} attempt${st.n === 1 ? '' : 's'}${st.recentAcc != null ? ' · recent ' + U.pct(st.recentAcc) : ''}` : 'not practised yet'}">
        ${st ? `<span class="perfdot" style="${C.accStyle(acc)}">${U.pct(acc)}</span>` : '<span class="perfdot" style="' + C.accStyle(null) + '">–</span>'}</span>
      <span class="go">${n ? `<a class="btn sm ghost" href="#/practice?spec=${encodeURIComponent(p.key)}&n=6&back=${back}" title="${n} question${n === 1 ? '' : 's'}">▶ ${n}</a>` : (AI.isConfigured() ? `<a class="btn sm ghost" href="#/generate?specs=${encodeURIComponent(p.key)}" title="No questions yet – make some with AI">✚</a>` : '<span class="muted" style="font-size:12px">no Qs</span>')}</span>
    </div>`;
  }

  (window.Views = window.Views || {}).map = V;
})();
