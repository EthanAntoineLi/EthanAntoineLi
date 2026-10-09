/* First-run setup / edit profile: pick your course so the app knows your ESAT modules. */
(window.Views = window.Views || {}).setup = {
  render(el) {
    const prof = Store.profile() || { name: '', courseId: '', modules: ['maths1'], testDate: '' };
    const courseOpts = window.ESAT_COURSES.map((g) => `<optgroup label="${U.esc(g.uni)}">${g.courses.map((c) =>
      `<option value="${c.id}" ${c.id === prof.courseId ? 'selected' : ''}>${U.esc(c.name)}</option>`).join('')}</optgroup>`).join('');
    el.innerHTML = `<div class="page" style="max-width:760px">
      <div class="page-head"><div><h1>${Store.profile() ? 'Your profile' : 'Welcome 👋'}</h1>
        <p>${Store.profile() ? 'Change your course, modules or test date.' : 'Tell the app what you are sitting so practice, mocks and stats match your ESAT modules.'}</p></div></div>
      <div class="card">
        <div class="field"><label>Your name <span class="hint">(optional – only shown on this computer)</span></label><input type="text" data-name value="${U.esc(prof.name || '')}" placeholder="e.g. Ethan"></div>
        <div class="field"><label>Course you're applying for</label><select data-course><option value="">Choose…</option>${courseOpts}</select>
          <span class="hint">From UAT-UK's 2027-entry course list. Applying to several? Pick the one with compulsory modules, then adjust below.</span></div>
        <div class="field"><label>Your ESAT modules</label><div data-mods class="stack"></div><div class="hint" data-mod-hint></div></div>
        <div class="field"><label>Test date <span class="hint">(optional – for the countdown)</span></label><input type="date" data-date value="${U.esc(prof.testDate || '')}" style="max-width:220px"></div>
        <div class="row end"><button class="btn primary lg" data-save>${Store.profile() ? 'Save' : 'Start practising →'}</button></div>
      </div>
      ${Store.profile() ? '' : `<div class="card"><h3>Optional: connect an AI model</h3>
        <p class="muted">The question bank, mocks, review queue and stats all work without AI. Plug in any provider's API key to unlock the AI tutor, marking of your working, mock interviews and unlimited new questions.</p>
        <a class="btn" href="#/settings">Set up AI later in Settings</a></div>`}
    </div>`;

    const modsEl = U.$('[data-mods]', el), hint = U.$('[data-mod-hint]', el), courseSel = U.$('[data-course]', el);
    let selected = new Set(prof.modules || ['maths1']);

    function course() {
      for (const g of window.ESAT_COURSES) for (const c of g.courses) if (c.id === courseSel.value) return c;
      return null;
    }
    function drawMods(reset) {
      const c = course();
      const rule = c ? c.modules : null;
      if (reset && rule) selected = new Set(Array.isArray(rule) ? rule : rule.fixed.concat(rule.chooseFrom.filter((m) => selected.has(m)).slice(0, rule.choose)));
      const fixed = rule ? (Array.isArray(rule) ? rule : rule.fixed) : ['maths1'];
      modsEl.innerHTML = window.ESAT_MODULE_ORDER.map((m) => {
        const locked = rule && Array.isArray(rule);
        const isFixed = fixed.includes(m);
        const allowed = !rule || Array.isArray(rule) ? true : (isFixed || rule.chooseFrom.includes(m));
        return `<label class="check"><input type="checkbox" value="${m}" ${selected.has(m) ? 'checked' : ''} ${(locked || isFixed || !allowed) ? 'disabled' : ''}> ${U.moduleName(m)}
          ${isFixed ? '<span class="chip blue">required</span>' : ''}</label>`;
      }).join('');
      if (!rule) hint.textContent = 'Most courses: Mathematics 1 plus two more.';
      else if (Array.isArray(rule)) hint.textContent = `This course requires exactly these ${rule.length} modules.`;
      else hint.textContent = `Mathematics 1 plus any ${rule.choose} of the others – tick ${rule.choose}.`;
      U.$$('input', modsEl).forEach((cb) => cb.onchange = () => {
        cb.checked ? selected.add(cb.value) : selected.delete(cb.value);
        if (rule && !Array.isArray(rule)) {
          const chosen = rule.chooseFrom.filter((m) => selected.has(m));
          if (chosen.length > rule.choose) { selected.delete(chosen.find((m) => m !== cb.value)); drawMods(false); }
        }
      });
    }
    courseSel.onchange = () => drawMods(true);
    drawMods(false);

    U.$('[data-save]', el).onclick = () => {
      const c = course();
      if (!c) return U.toast('Pick your course (or "Custom")', 'bad');
      const rule = c.modules;
      const mods = window.ESAT_MODULE_ORDER.filter((m) => selected.has(m));
      if (!Array.isArray(rule) && mods.filter((m) => rule.chooseFrom.includes(m)).length !== rule.choose) return U.toast(`Choose exactly ${rule.choose} modules besides Mathematics 1`, 'bad');
      Store.setProfile({ name: U.$('[data-name]', el).value.trim(), courseId: c.id, courseName: c.name, modules: mods, testDate: U.$('[data-date]', el).value, createdAt: prof.createdAt || Date.now() });
      U.toast('Saved', 'good');
      U.go('#/');
    };
  },
};
