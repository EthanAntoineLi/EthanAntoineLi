/* Setup / edit profile: what you study. A-level units (done / studying now / later) and, optionally, the ESAT. */
(window.Views = window.Views || {}).setup = {
  render(el) {
    const old = Store.profile();
    const prof = old || { name: '', esat: false, courseId: '', modules: [], testDate: '', units: {} };
    const units = Object.assign({}, prof.units || {});
    let esat = old ? Store.esatOn() : false;
    const STATUSES = [['', 'Not taking'], ['done', 'Done'], ['current', 'Studying now'], ['later', 'Later']];
    const alevels = Courses.all().filter((c) => c.kind !== 'esat');
    const esatCourseOpts = window.ESAT_COURSES.map((g) => `<optgroup label="${U.esc(g.uni)}">${g.courses.map((c) =>
      `<option value="${c.id}" ${c.id === prof.courseId ? 'selected' : ''}>${U.esc(c.name)}</option>`).join('')}</optgroup>`).join('');

    el.innerHTML = `<div class="page" style="max-width:920px">
      <div class="page-head"><div><h1>${old ? 'Your subjects' : 'Welcome 👋'}</h1>
        <p>${old ? 'Change what you study. Your progress is kept.' : 'Tell the app what you study, so the progress map, practice and review match your units.'}</p></div></div>
      <div class="card">
        <div class="field" style="max-width:360px"><label>Your name <span class="hint">(optional – only shown on this computer)</span></label><input type="text" data-name value="${U.esc(prof.name || '')}" placeholder="e.g. Ethan"></div>
      </div>
      ${alevels.map((c) => `<div class="card">
        <div class="row between"><div><h2 style="margin:0">${U.esc(c.name)}</h2><div class="muted" style="font-size:13px">${U.esc(c.board)}${c.edited ? ' · your edited version' : ''}${c.custom ? ' · your own course' : ''}</div></div>
          <div class="row"><button class="btn sm" data-fill="${c.id}" title="Mark AS units as done and A2 units as studying now">AS done, A2 now</button><button class="btn sm ghost" data-clear="${c.id}">Clear</button></div></div>
        <table class="tbl" style="margin-top:10px"><tbody>${c.units.map((u) => `<tr>
          <td style="width:90px"><b>${U.esc(u.short)}</b>${u.code ? `<br><small>${U.esc(u.code)}</small>` : ''}</td>
          <td>${U.esc(u.name)}${u.level ? ` <span class="chip">${u.level}</span>` : ''}${u.practical ? ' <span class="chip">practical</span>' : ''}</td>
          <td style="text-align:right"><div class="seg" data-unit="${u.id}">${STATUSES.map(([v, l]) => `<button data-v="${v}" class="${(units[u.id] || '') === v ? 'on' : ''}">${l}</button>`).join('')}</div></td></tr>`).join('')}</tbody></table>
      </div>`).join('')}
      <div class="card">
        <p class="muted" style="margin:0">Different exam board or subject? <a href="#/settings?tab=courses">Add your own course</a> – paste the syllabus and the AI turns it into spec points, or type them in.</p>
      </div>
      <div class="card">
        <label class="check" style="font-size:16px"><input type="checkbox" data-esat ${esat ? 'checked' : ''}> I'm also taking the <b>ESAT</b> (Engineering and Science Admissions Test)</label>
        <div data-esat-box style="margin-top:14px">
          <div class="field"><label>Course you're applying for</label><select data-course><option value="">Choose…</option>${esatCourseOpts}</select>
            <span class="hint">From UAT-UK's 2027-entry course list. Applying to several? Pick the one with compulsory modules, then adjust below.</span></div>
          <div class="field"><label>Your ESAT modules</label><div data-mods class="stack"></div><div class="hint" data-mod-hint></div></div>
          <div class="field"><label>ESAT test date <span class="hint">(optional – for the countdown)</span></label><input type="date" data-date value="${U.esc(prof.testDate || '')}" style="max-width:220px"></div>
        </div>
      </div>
      <div class="row end"><button class="btn primary lg" data-save>${old ? 'Save' : 'Start →'}</button></div>
      ${old ? '' : `<div class="card" style="margin-top:14px"><h3>Optional: connect an AI model</h3>
        <p class="muted">The question bank, progress map, self-marking, review and stats all work without AI. Plug in any provider's API key to get AI marking of your answers, a tutor, mock interviews and unlimited new questions.</p>
        <a class="btn" href="#/settings">Set up AI later in Settings</a></div>`}
    </div>`;

    // A-level unit statuses
    U.$$('[data-unit]', el).forEach((seg) => seg.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      units[seg.dataset.unit] = b.dataset.v;
      if (!b.dataset.v) delete units[seg.dataset.unit];
      U.$$('button', seg).forEach((x) => x.classList.toggle('on', x === b));
    }));
    const setCourse = (cid, fn) => {
      const c = Courses.course(cid);
      c.units.forEach((u) => {
        const v = fn(u);
        if (v) units[u.id] = v; else delete units[u.id];
        U.$$(`[data-unit="${u.id}"] button`, el).forEach((x) => x.classList.toggle('on', x.dataset.v === (v || '')));
      });
    };
    U.$$('[data-fill]', el).forEach((b) => b.onclick = () => setCourse(b.dataset.fill, (u) => (u.level === 'AS' ? 'done' : u.level === 'A2' ? 'current' : '')));
    U.$$('[data-clear]', el).forEach((b) => b.onclick = () => setCourse(b.dataset.clear, () => ''));

    // ESAT
    const esatBox = U.$('[data-esat-box]', el), esatCb = U.$('[data-esat]', el);
    const showEsat = () => { esatBox.style.display = esatCb.checked ? '' : 'none'; };
    esatCb.onchange = showEsat; showEsat();
    const modsEl = U.$('[data-mods]', el), hint = U.$('[data-mod-hint]', el), courseSel = U.$('[data-course]', el);
    let selected = new Set(prof.modules && prof.modules.length ? prof.modules : ['maths1']);
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
        return `<label class="check"><input type="checkbox" value="${m}" ${selected.has(m) ? 'checked' : ''} ${(locked || isFixed || !allowed) ? 'disabled' : ''}> ${Courses.unit(m).name}
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
      const doEsat = esatCb.checked;
      const out = Object.assign({}, prof, { name: U.$('[data-name]', el).value.trim(), units, esat: doEsat, createdAt: prof.createdAt || Date.now() });
      if (doEsat) {
        const c = course();
        if (!c) return U.toast('Pick your ESAT course (or "Custom")', 'bad');
        const rule = c.modules;
        const mods = window.ESAT_MODULE_ORDER.filter((m) => selected.has(m));
        if (!Array.isArray(rule) && mods.filter((m) => rule.chooseFrom.includes(m)).length !== rule.choose) return U.toast(`Choose exactly ${rule.choose} ESAT modules besides Mathematics 1`, 'bad');
        Object.assign(out, { courseId: c.id, courseName: c.name, modules: mods, testDate: U.$('[data-date]', el).value });
      }
      if (!doEsat && !Object.values(units).some(Boolean)) return U.toast('Pick at least one unit you study (or tick the ESAT)', 'bad');
      Store.setProfile(out);
      U.toast('Saved', 'good');
      U.go('#/');
    };
  },
};
