/* Router + shell. Views live in js/views/*.js and register on window.Views. */
(function () {
  const App = { cleanup: null, guard: null, lastHash: null };

  App.applyTheme = () => {
    const t = Store.settings().theme;
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  };

  App.refreshChrome = () => {
    const due = Store.dueReview().length;
    U.$('#nav-review-count').textContent = due ? String(due) : '';
    const p = Store.profile();
    const mods = p ? p.modules.map(U.moduleShort).join(' · ') : '';
    U.$('#sidebar-foot').innerHTML = `${p ? `<div><b>${U.esc(p.name || 'You')}</b></div><div>${U.esc(mods)}</div>` : ''}
      <div style="margin-top:6px">AI: ${AI.isConfigured() ? U.esc(AI.config().model) : '<a href="#/settings">not set up</a>'}</div>`;
  };

  const ROUTES = {
    '': 'dashboard', setup: 'setup', bank: 'bank', practice: 'session', mock: 'mock', review: 'review', stats: 'stats',
    challenges: 'challenges', interview: 'interview', generate: 'generate', settings: 'settings', mine: 'bank',
  };

  async function route() {
    const { parts, params } = U.parseHash();
    if (App.guard && location.hash !== App.lastHash) {
      const ok = await App.guard();
      if (!ok) { history.replaceState(null, '', App.lastHash || '#/'); return; }
    }
    App.guard = null;
    if (App.cleanup) { try { App.cleanup(); } catch (e) { console.error(e); } App.cleanup = null; }
    document.body.classList.remove('exam-mode');

    let name = ROUTES[parts[0] || ''] || 'dashboard';
    if (!Store.profile() && name !== 'setup' && name !== 'settings') { location.replace('#/setup'); return; }

    U.$$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === (name === 'session' ? 'bank' : name)));
    const view = U.$('#view');
    view.innerHTML = '';
    view.scrollTop = 0; window.scrollTo(0, 0);
    App.lastHash = location.hash;
    try {
      const r = window.Views[name].render(view, { parts, params });
      App.cleanup = typeof r === 'function' ? r : null;
    } catch (e) {
      console.error(e);
      view.innerHTML = `<div class="page"><div class="notice bad"><b>Something went wrong:</b> ${U.esc(e.message)}</div></div>`;
    }
    App.refreshChrome();
  }

  App.route = route;
  window.App = App;

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', () => {
    App.applyTheme();
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', App.applyTheme);
    route();
  });
})();
