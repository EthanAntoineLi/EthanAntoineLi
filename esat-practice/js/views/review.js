/* Review queue: anything you get wrong comes back until you get it right (twice, a few days apart). */
(window.Views = window.Views || {}).review = {
  render(el) {
    const r = Store.review();
    const now = Date.now();
    const ids = Object.keys(r).filter((id) => Bank.byId(id));
    const due = ids.filter((id) => r[id].due <= now).sort((a, b) => r[a].due - r[b].due);
    const later = ids.filter((id) => r[id].due > now).sort((a, b) => r[a].due - r[b].due);
    const days = Store.settings().review.confirmAfterDays || 3;
    const row = (id) => {
      const q = Bank.byId(id), x = r[id];
      return `<tr><td style="white-space:nowrap"><b>${U.esc(q.spec)}</b><br><small>${U.moduleShort(q.module)}</small></td>
        <td><div class="rich" style="max-height:3.2em;overflow:hidden">${U.mdInline(q.stem.split('\n')[0].slice(0, 180))}</div></td>
        <td style="white-space:nowrap">${x.stage ? '<span class="chip blue">confirming</span>' : '<span class="chip bad">missed</span>'}${x.misses > 1 ? ` <small>${x.misses}× wrong</small>` : ''}</td>
        <td style="white-space:nowrap">${x.due <= now ? 'now' : U.fmtDate(x.due)}</td>
        <td><button class="btn sm ghost" data-drop="${id}" title="Remove from queue">✕</button></td></tr>`;
    };
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Review queue</h1><p>Get a question wrong and it joins the queue straight away. Get it right and it comes back once more after ${days} days to check it stuck; right again and it leaves the queue.</p></div>
        <div class="row">${due.length ? `<button class="btn primary lg" data-start>Review ${Math.min(due.length, 20)} now</button>` : ''}</div></div>
      <div class="grid c3">
        <div class="card stat"><span class="l">Due now</span><span class="v">${due.length}</span></div>
        <div class="card stat"><span class="l">Scheduled</span><span class="v">${later.length}</span></div>
        <div class="card stat"><span class="l">By module</span><span style="font-size:14px;margin-top:4px">${window.ESAT_MODULE_ORDER.map((m) => [m, ids.filter((id) => Bank.byId(id).module === m).length]).filter((x) => x[1]).map(([m, n]) => `${U.moduleShort(m)}: <b>${n}</b>`).join(' · ') || '–'}</span></div>
      </div>
      <div class="card" style="margin-top:14px"><h2>Due now</h2>${due.length ? `<table class="tbl"><tbody>${due.map(row).join('')}</tbody></table>` : '<div class="empty">Nothing due – nice. Mistakes from practice and mocks will appear here.</div>'}</div>
      ${later.length ? `<div class="card"><h2>Coming back later</h2><table class="tbl"><tbody>${later.map(row).join('')}</tbody></table></div>` : ''}
    </div>`;
    const start = U.$('[data-start]', el);
    if (start) start.onclick = () => Views.session.start({ kind: 'review', title: 'Review queue', subtitle: 'Mistakes coming back', qids: due.slice(0, 20), mode: 'relaxed', returnTo: '#/review' });
    U.$$('[data-drop]', el).forEach((b) => b.onclick = () => { Store.removeFromReview(b.dataset.drop); App.route(); });
  },
};
