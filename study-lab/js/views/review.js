/* Review: (1) mistakes queue – anything you get wrong comes back until you get it right;
           (2) topic review – spaced review of every spec point you've started, across your current
               units AND the earlier units they build on, so older material keeps coming back. */
(window.Views = window.Views || {}).review = {
  render(el, { params }) {
    const tab = params.tab === 'topics' ? 'topics' : (params.tab === 'mistakes' ? 'mistakes' : (Store.dueReview().length ? 'mistakes' : 'topics'));
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Review</h1><p>Mistakes come back until you get them right, and every topic you've started comes back on a schedule – including earlier units your current ones build on.</p></div>
        <div class="seg"><button data-tab="mistakes" class="${tab === 'mistakes' ? 'on' : ''}">Mistakes (${Store.dueReview().length})</button><button data-tab="topics" class="${tab === 'topics' ? 'on' : ''}">Review all topics</button></div></div>
      <div data-body></div></div>`;
    U.$$('[data-tab]', el).forEach((b) => b.onclick = () => U.go('#/review?tab=' + b.dataset.tab));
    const body = U.$('[data-body]', el);
    if (tab === 'mistakes') this.mistakes(body); else this.topics(body, params);
  },

  mistakes(el) {
    const r = Store.review();
    const now = Date.now();
    const ids = Object.keys(r).filter((id) => Bank.byId(id));
    const due = ids.filter((id) => r[id].due <= now).sort((a, b) => r[a].due - r[b].due);
    const later = ids.filter((id) => r[id].due > now).sort((a, b) => r[a].due - r[b].due);
    const days = Store.settings().review.confirmAfterDays || 3;
    const row = (id) => {
      const q = Bank.byId(id), x = r[id];
      return `<tr><td style="white-space:nowrap"><b>${U.esc(Bank.specLabel(q.spec))}</b><br><small>${U.esc(U.moduleShort(q.module))}</small></td>
        <td><div class="rich" style="max-height:3.2em;overflow:hidden">${U.mdInline(q.stem.split('\n')[0].slice(0, 180))}</div></td>
        <td style="white-space:nowrap">${x.stage ? '<span class="chip blue">confirming</span>' : '<span class="chip bad">missed</span>'}${x.misses > 1 ? ` <small>${x.misses}× wrong</small>` : ''}</td>
        <td style="white-space:nowrap">${x.due <= now ? 'now' : U.fmtDate(x.due)}</td>
        <td><button class="btn sm ghost" data-drop="${U.esc(id)}" title="Remove from queue">✕</button></td></tr>`;
    };
    const byUnit = {};
    ids.forEach((id) => { const m = Bank.byId(id).module; byUnit[m] = (byUnit[m] || 0) + 1; });
    el.innerHTML = `
      <div class="grid c3">
        <div class="card stat"><span class="l">Due now</span><span class="v">${due.length}</span></div>
        <div class="card stat"><span class="l">Scheduled</span><span class="v">${later.length}</span></div>
        <div class="card stat"><span class="l">By unit</span><span style="font-size:14px;margin-top:4px">${Object.entries(byUnit).map(([m, n]) => `${U.esc(U.moduleShort(m))}: <b>${n}</b>`).join(' · ') || '–'}</span></div>
      </div>
      <p class="muted" style="font-size:13.5px">A question joins the queue when you get it wrong (or score under 70% on a written one). Get it right and it comes back once more after ${days} days; right again and it leaves.</p>
      <div class="card"><div class="row between"><h2 style="margin:0">Due now</h2>${due.length ? `<button class="btn primary" data-start>Review ${Math.min(due.length, 20)} now</button>` : ''}</div>
        ${due.length ? `<table class="tbl" style="margin-top:8px"><tbody>${due.map(row).join('')}</tbody></table>` : '<div class="empty">Nothing due – nice. Mistakes from practice and mocks appear here.</div>'}</div>
      ${later.length ? `<div class="card"><h2>Coming back later</h2><table class="tbl"><tbody>${later.map(row).join('')}</tbody></table></div>` : ''}`;
    const start = U.$('[data-start]', el);
    if (start) start.onclick = () => Views.session.start({ kind: 'review', title: 'Mistakes', subtitle: 'Questions you got wrong', qids: due.slice(0, 20), mode: 'relaxed', returnTo: '#/review?tab=mistakes' });
    U.$$('[data-drop]', el).forEach((b) => b.onclick = () => { Store.removeFromReview(b.dataset.drop); App.route(); });
  },

  topics(el, params) {
    const allMine = Store.studyUnits(['current', 'done']);
    // default scope: current units + every earlier unit they build on (if you study / studied it)
    let scope = params.units ? params.units.split(',').filter((u) => Courses.unit(u)) : null;
    if (!scope) scope = Store.defaultReviewScope();
    const order = params.order || 'due';
    const includeUnstarted = params.all === '1';
    const n = parseInt(params.n || '10', 10);
    const rows = Bank.topicReview(scope, { order, includeUnstarted });
    const shown = rows.filter((r) => order !== 'due' || r.due >= 1 || r.due === Infinity);
    const pickKeys = (order === 'due' ? shown : rows).map((r) => r.key);
    const qids = Bank.pickForSpecs(pickKeys, n);
    const noQs = (order === 'due' ? shown : rows).filter((r) => !r.questions).slice(0, 8).map((r) => r.key);
    const byCourse = {};
    allMine.forEach((u) => { const c = Courses.unit(u).course; (byCourse[c] || (byCourse[c] = [])).push(u); });
    const hrefWith = (o) => '#/review?' + new URLSearchParams(Object.assign({ tab: 'topics', units: scope.join(','), order, n: String(n), all: includeUnstarted ? '1' : '0' }, o)).toString();

    el.innerHTML = `<div class="split">
      <div class="card">
        <h2>What to review</h2>
        ${Object.entries(byCourse).map(([cid, us]) => `<div style="margin-bottom:10px"><b>${U.esc(Courses.course(cid).name)}</b>
          <div class="row" style="margin-top:6px">${us.map((u) => `<label class="check" style="font-weight:500"><input type="checkbox" data-u="${u}" ${scope.includes(u) ? 'checked' : ''}> ${U.esc(Courses.unit(u).short)} <small class="muted">${Store.unitStatus(u) === 'current' ? '(now)' : '(done)'}</small></label>`).join('')}</div></div>`).join('') || '<p class="muted">Pick your units in <a href="#/setup">Your subjects</a> first.</p>'}
        <div class="row" style="margin-top:6px"><span class="muted">Order:</span>
          <div class="seg">${[['due', 'Due for review'], ['weak', 'Weakest first'], ['mixed', 'Shuffle']].map(([v, l]) => `<button data-order="${v}" class="${order === v ? 'on' : ''}">${l}</button>`).join('')}</div>
          <label class="check" style="font-weight:500"><input type="checkbox" data-all ${includeUnstarted ? 'checked' : ''}> include topics I haven't started</label></div>
        <div class="row" style="margin-top:14px"><span class="muted">Questions:</span><select data-n style="width:auto">${[5, 10, 15, 20, 30].map((k) => `<option ${k === n ? 'selected' : ''}>${k}</option>`).join('')}</select>
          <button class="btn primary" data-go ${qids.length ? '' : 'disabled'}>Start review (${qids.length})</button>
          <button class="btn" data-go-exam ${qids.length ? '' : 'disabled'} title="Timed, marked at the end">⏱ Timed</button></div>
        ${noQs.length ? `<div class="notice warn" style="margin-top:12px">${noQs.length} due topic${noQs.length === 1 ? ' has' : 's have'} no questions yet: ${noQs.map((k) => U.esc(Bank.specLabel(k))).join(', ')}.
          ${AI.isConfigured() ? `<a class="btn sm" href="#/generate?specs=${encodeURIComponent(noQs.join(','))}">✚ Make questions for them</a>` : 'Connect an AI model to generate some, or add your own in My questions.'}</div>` : ''}
      </div>
      <div class="card"><h3>How topic review works</h3><ul class="list-plain" style="font-size:14px">
        <li>Every spec point you've marked as learning/learned, or answered questions on, gets a review interval: about 2 days if you're scoring under 50%, 6 days under 80%, then ~18 days.</li>
        <li>"Shaky" topics and ones marked learned but never tested come up first.</li>
        <li>By default it includes the earlier units your current units build on (e.g. M1 for M2, S1/S2 for S3), because later papers keep using them.</li>
      </ul></div></div>
      <div class="card" style="margin-top:14px"><h2>${order === 'due' ? `Due now (${shown.length})` : `Topics (${rows.length})`}</h2>
        ${(order === 'due' ? shown : rows).length ? `<table class="tbl"><thead><tr><th>Spec point</th><th>Unit</th><th>Status</th><th class="num">Score</th><th class="num">Last practised</th><th class="num">Qs</th></tr></thead><tbody>
          ${(order === 'due' ? shown : rows).slice(0, 60).map((r) => `<tr><td><a href="#/bank/${r.unit}?spec=${encodeURIComponent(r.key)}"><b>${U.esc(Bank.specLabel(r.key))}</b> ${U.esc(Bank.specTitle(r.key))}</a></td>
            <td>${U.esc(U.moduleShort(r.unit))}</td><td>${r.mark ? `<span class="chip ${r.mark === 'learned' ? 'good' : r.mark === 'shaky' ? 'bad' : 'warn'}">${r.mark}</span>` : ''}</td>
            <td class="num">${r.mastery != null ? U.pct(r.mastery) : '–'}</td><td class="num">${r.since === Infinity ? 'never' : Math.round(r.since) + ' d ago'}</td><td class="num">${r.questions}</td></tr>`).join('')}</tbody></table>`
          : `<div class="empty">${rows.length ? 'Nothing is due – everything you\'ve started is fresh. Try "Weakest first" or include topics you haven\'t started.' : 'No topics to review yet. Mark topics as learning/learned on the <a href="#/map">Progress map</a>, or practise some questions.'}</div>`}
      </div>`;

    U.$$('[data-u]', el).forEach((cb) => cb.onchange = () => {
      const us = U.$$('[data-u]', el).filter((x) => x.checked).map((x) => x.dataset.u);
      U.go(hrefWith({ units: us.join(',') }));
    });
    U.$$('[data-order]', el).forEach((b) => b.onclick = () => U.go(hrefWith({ order: b.dataset.order })));
    U.$('[data-all]', el).onchange = (e) => U.go(hrefWith({ all: e.target.checked ? '1' : '0' }));
    U.$('[data-n]', el).onchange = (e) => U.go(hrefWith({ n: e.target.value }));
    const start = (mode) => Views.session.start({ kind: 'review', title: 'Topic review', subtitle: scope.map((u) => Courses.unit(u).short).join(' · '), qids, mode, returnTo: location.hash });
    U.$('[data-go]', el).onclick = () => start('relaxed');
    U.$('[data-go-exam]', el).onclick = () => start('exam');
  },
};
