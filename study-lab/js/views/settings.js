/* Settings: AI provider/key/model, practice preferences, theme, backup. */
(window.Views = window.Views || {}).settings = {
  render(el, { params } = {}) {
    const s = Store.settings();
    const prof = Store.profile();
    const P = AI.PROVIDERS;
    el.innerHTML = `<div class="page" style="max-width:900px">
      <div class="page-head"><div><h1>Settings</h1><p>Everything is stored in this browser on your computer.</p></div></div>

      <div class="card">
        <div class="row between"><h2 style="margin:0">Your subjects</h2><a class="btn sm" href="#/setup">Edit</a></div>
        ${prof ? `<p style="margin:8px 0 0">${U.esc(prof.name || 'You')}<br>
          <span class="muted">Studying now: ${Store.studyUnits(['current']).map((u) => U.esc(U.moduleShort(u))).join(' · ') || '–'}<br>
          Done: ${Store.studyUnits(['done']).map((u) => U.esc(U.moduleShort(u))).join(' · ') || '–'}${Store.esatOn() && prof.testDate ? '<br>ESAT test ' + U.fmtDate(prof.testDate) : ''}</span></p>` : '<p class="muted">Not set up yet.</p>'}
      </div>

      <div class="card" id="courses">
        <div class="row between"><h2 style="margin:0">Courses &amp; spec lists</h2><button class="btn sm primary" data-addcourse>+ Add a course</button></div>
        <p class="muted" style="margin:6px 0 10px">The A-level spec lists are based on the Pearson Edexcel International A Level (2018) specifications. If your official spec differs, edit the list – your version replaces the built-in one in this browser. Different board? Add your own course from its syllabus.</p>
        <table class="tbl"><tbody>${Courses.all().filter((c) => c.kind !== 'esat').map((c) => `<tr>
          <td><b>${U.esc(c.name)}</b><br><small class="muted">${U.esc(c.board)} · ${c.units.length} units · ${c.units.reduce((a, u) => a + Courses.points(u.id).length, 0)} spec points</small></td>
          <td>${c.custom ? '<span class="chip blue">your course</span>' : c.edited ? '<span class="chip warn">edited</span>' : '<span class="chip">built-in</span>'}</td>
          <td style="text-align:right;white-space:nowrap"><button class="btn sm" data-editcourse="${c.id}">Edit list</button>
            ${c.edited ? `<button class="btn sm ghost" data-resetcourse="${c.id}">Reset</button>` : ''}${c.custom ? `<button class="btn sm danger" data-delcourse="${c.id}">Delete</button>` : ''}</td></tr>`).join('')}</tbody></table>
      </div>

      <div class="card" id="ai">
        <h2>AI model</h2>
        <p class="muted" style="margin-top:-4px">Bring your own key from any provider. Your key is stored only in this browser and sent only to the provider you choose.</p>
        <div class="grid c2">
          <div class="field"><label>Provider</label><select data-f="provider">${Object.entries(P).map(([k, v]) => `<option value="${k}" ${k === s.ai.provider ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
            <span class="hint" data-keylink></span></div>
          <div class="field"><label>Base URL</label><input type="url" data-f="baseUrl" value="${U.esc(s.ai.baseUrl)}"><span class="hint">Leave blank for the provider's default.</span></div>
        </div>
        <div class="field"><label>API key</label><div class="row" style="flex-wrap:nowrap"><input type="password" data-f="apiKey" value="${U.esc(s.ai.apiKey)}" autocomplete="off" spellcheck="false" placeholder="paste your key"><button class="btn sm" data-show>Show</button></div></div>
        <div class="field"><label>Model</label><div class="row" style="flex-wrap:nowrap"><input type="text" data-f="model" list="model-list" value="${U.esc(s.ai.model)}" placeholder="e.g. a model name from your provider" spellcheck="false"><button class="btn sm" data-load>Load models</button></div>
          <datalist id="model-list"></datalist><span class="hint">Pick a strong reasoning model for marking and question-making; a cheaper one is fine for the tutor.</span></div>
        <div class="stack" style="margin-bottom:14px">
          <label class="check"><input type="checkbox" data-f="vision" ${s.ai.vision ? 'checked' : ''}> This model accepts images (photos of working, whiteboard, screenshots)</label>
          <label class="check"><input type="checkbox" data-f="useProxy" ${s.ai.useProxy ? 'checked' : ''}> Route requests through the local server <span class="muted" data-proxy-status style="font-weight:400"></span></label>
        </div>
        <div class="row"><button class="btn primary" data-save-ai>Save</button><button class="btn" data-test>Test connection</button><span data-test-out class="muted"></span></div>
        <details style="margin-top:14px"><summary class="muted">Which provider should I use?</summary><div class="rich" style="font-size:14px;margin-top:8px">${U.md(`- **Anthropic (Claude)**, **OpenAI**, **Google Gemini**: strongest results for maths/physics marking and question writing. Gemini has a free tier.
- **OpenRouter**: one key, hundreds of models from every lab – handy for trying several.
- **Groq / DeepSeek / Mistral / xAI**: cheap and fast; some don't accept images (untick the image box).
- **Ollama / LM Studio**: free and fully offline on your own computer, but small local models make more maths mistakes. Run the app with \`serve.py\` so the browser can reach them.
- **Custom**: anything with an OpenAI-compatible \`/chat/completions\` endpoint.

If a provider blocks requests from a web page (a "Failed to fetch" / CORS error), start the app with \`python serve.py\` and tick *Route requests through the local server*.`)}</div></details>
      </div>

      <div class="card">
        <h2>Practice</h2>
        <div class="grid c2">
          <div class="field"><label>Default practice mode</label><select data-p="mode"><option value="relaxed" ${s.practice.mode === 'relaxed' ? 'selected' : ''}>Relaxed – instant feedback, pausable</option><option value="exam" ${s.practice.mode === 'exam' ? 'selected' : ''}>Exam conditions – countdown at exam pace</option></select></div>
          <div class="field"><label>Review queue: check again after</label><select data-r="confirmAfterDays">${[1, 2, 3, 5, 7].map((d) => `<option value="${d}" ${s.review.confirmAfterDays === d ? 'selected' : ''}>${d} day${d > 1 ? 's' : ''}</option>`).join('')}</select></div>
        </div>
        <label class="check"><input type="checkbox" data-p="autoAdvance" ${s.practice.autoAdvance ? 'checked' : ''}> In relaxed mode, move on automatically after a correct answer</label>
        <label class="check"><input type="checkbox" data-p="autoStatus" ${s.practice.autoStatus ? 'checked' : ''}> Update my progress map from my marks (2+ answers averaging 80%+ turn a spec point green, under 50% flags it shaky)</label>
        <div class="field" style="margin-top:14px"><label>Theme</label><div class="seg" data-theme>${['auto', 'light', 'dark'].map((t) => `<button data-v="${t}" class="${s.theme === t ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
      </div>

      <div class="card">
        <h2>Your data</h2>
        <p class="muted" style="margin-top:-4px">Progress lives in this browser only. Export a backup now and then – and to move between browsers or computers.</p>
        <div class="row"><button class="btn" data-export>⇩ Export backup</button>
          <label class="btn">⇪ Import backup<input type="file" accept=".json,application/json" hidden data-import></label>
          <span class="spacer"></span><button class="btn danger" data-wipe>Delete everything</button></div>
        <p class="muted" style="font-size:13px;margin-top:10px">${Store.attempts().length} answers · ${Store.custom().length} of your own questions · ${Store.mocks().length} mocks · ${Store.interviews().length} interviews</p>
      </div>

      <div class="card"><h3>About</h3><div class="rich muted" style="font-size:13.5px">${U.md(`Study Lab – a personal, local revision app for A-levels and the ESAT. ESAT spec points come from UAT-UK's *ESAT Content Specification* (October 2026 / January 2027), module requirements from the *Course List 2027 Entry*, and the mock score estimate from the *ESAT Technical Report 2024–25*. The A-level spec lists are written from the Pearson Edexcel IAL (2018) specifications and can be edited. Built-in questions are original practice questions in the style of each exam – not official exam questions. Not affiliated with any exam board or university.`)}</div></div>
    </div>`;

    // ---- courses ----
    const courseEditor = (course, isNew) => {
      const body = U.html(`<div>
        ${isNew ? `<div class="field"><label>Paste a syllabus / specification (optional)</label><textarea data-syl rows="6" placeholder="Paste the content section of your exam board's specification, then press Convert with AI"></textarea>
          <div class="row" style="margin-top:6px"><button class="btn sm" data-convert ${AI.isConfigured() ? '' : 'disabled'}>✦ Convert with AI</button><span class="muted" data-cstatus style="font-size:13px">${AI.isConfigured() ? '' : 'Connect an AI model to convert automatically, or type the list below.'}</span></div></div>` : ''}
        <div class="field"><label>Spec list <span class="hint">"# Unit: FP3 | Further Pure 3 | A2 | prereqs: fp1" · "## 1 Topic title" · "1.1 Point title | what is assessed"</span></label>
          <textarea data-ctext rows="18" style="font-family:var(--mono);font-size:12.5px">${U.esc(course ? Courses.toText(course) : '# Course: My course | Exam board\n\n# Unit: Unit 1 | Unit name | AS | prereqs:\n## 1 First topic\n1.1 First point | What is assessed')}</textarea>
          <span class="hint" data-cparse></span></div>
        ${!isNew && !course.custom ? '<p class="muted" style="font-size:13px">Keep the unit codes (e.g. FP3) and point numbers the same where you can – your ticks and scores are attached to them.</p>' : ''}
      </div>`);
      const ta = U.$('[data-ctext]', body);
      const check = () => {
        const c = Courses.fromText(ta.value, course || {});
        const n = c.units.reduce((a, u) => a + u.sections.reduce((b, x) => b + x.points.length, 0), 0);
        U.$('[data-cparse]', body).textContent = `Reads as ${c.units.length} unit${c.units.length === 1 ? '' : 's'}, ${n} spec point${n === 1 ? '' : 's'}.`;
      };
      ta.addEventListener('input', U.debounce(check, 300)); check();
      body.addEventListener('keydown', (e) => e.stopPropagation());
      const conv = U.$('[data-convert]', body);
      if (conv) conv.onclick = async () => {
        const syl = U.$('[data-syl]', body).value.trim();
        if (!syl) return U.toast('Paste the syllabus first');
        conv.disabled = true; U.$('[data-cstatus]', body).textContent = 'Converting…';
        try {
          const out = AI.clean(await AI.chat({ system: AI.prompts.syllabus(), messages: [{ role: 'user', content: syl }], effort: 'high', onToken: (t, all) => { ta.value = all; } }));
          ta.value = out.replace(/```[a-z]*\n?/g, ''); check();
          U.$('[data-cstatus]', body).textContent = 'Done – check it over, then Save.';
        } catch (err) { U.$('[data-cstatus]', body).textContent = 'Error: ' + err.message; }
        conv.disabled = false;
      };
      U.modal({
        title: isNew ? 'Add a course' : `Edit ${course.name}`, body, wide: true, sticky: true,
        buttons: [{ label: 'Cancel' }, { label: 'Save', kind: 'primary', onClick: () => {
          const c = Courses.fromText(ta.value, course || {});
          if (!c.units.length || !c.units.some((u) => u.sections.length)) { U.toast('No units/topics found – check the format', 'bad'); return false; }
          if (isNew) { c.id = 'custom-' + U.uid(); Store.saveCustomCourse(c); }
          else if (course.custom) { c.id = course.id; Store.saveCustomCourse(c); }
          else { c.id = course.id; c.kind = 'alevel'; Store.saveCourseOverride(course.id, c); }
          U.toast('Saved', 'good'); App.route();
        } }],
      });
    };
    U.$('[data-addcourse]', el).onclick = () => courseEditor(null, true);
    U.$$('[data-editcourse]', el).forEach((b) => b.onclick = () => courseEditor(Courses.course(b.dataset.editcourse), false));
    U.$$('[data-resetcourse]', el).forEach((b) => b.onclick = async () => {
      if (await U.confirm('Reset to the built-in list?', 'Your edited version of this course will be removed.', 'Reset', true)) { Store.saveCourseOverride(b.dataset.resetcourse, null); App.route(); }
    });
    U.$$('[data-delcourse]', el).forEach((b) => b.onclick = async () => {
      if (await U.confirm('Delete this course?', 'Its spec list is removed. Questions and scores attached to it stay in your backup but won\'t show.', 'Delete', true)) { Store.deleteCustomCourse(b.dataset.delcourse); App.route(); }
    });
    if (params && params.tab === 'courses') setTimeout(() => U.$('#courses').scrollIntoView({ behavior: 'smooth' }), 50);

    const f = (k) => U.$(`[data-f="${k}"]`, el);
    const keylink = U.$('[data-keylink]', el);
    const showProvider = () => {
      const p = P[f('provider').value];
      f('baseUrl').placeholder = p.base || 'https://your-endpoint/v1';
      keylink.innerHTML = p.keyUrl ? `Get a key: <a href="${p.keyUrl}" target="_blank" rel="noopener">${p.keyUrl.replace(/^https:\/\//, '')}</a>` : p.noKey ? 'Runs on your computer – no key needed.' : '';
      const dl = U.$('#model-list', el);
      dl.innerHTML = (p.models || []).map((m) => `<option value="${m}">`).join('');
    };
    showProvider();
    f('provider').onchange = () => {
      const p = P[f('provider').value];
      f('baseUrl').value = '';
      if (p.models && p.models.length && !p.models.includes(f('model').value)) f('model').value = p.models[0];
      else if (f('provider').value !== Store.settings().ai.provider) f('model').value = '';
      showProvider();
    };
    U.$('[data-show]', el).onclick = (e) => { const i = f('apiKey'); i.type = i.type === 'password' ? 'text' : 'password'; e.target.textContent = i.type === 'password' ? 'Show' : 'Hide'; };

    const saveAI = () => Store.patchSettings((x) => {
      x.ai.provider = f('provider').value;
      x.ai.baseUrl = f('baseUrl').value.trim();
      x.ai.apiKey = f('apiKey').value.trim();
      x.ai.model = f('model').value.trim();
      x.ai.vision = f('vision').checked;
      x.ai.useProxy = f('useProxy').checked;
    });
    U.$('[data-save-ai]', el).onclick = () => { saveAI(); App.refreshChrome(); U.toast('Saved', 'good'); };
    U.$('[data-load]', el).onclick = async (e) => {
      saveAI();
      e.target.disabled = true; e.target.textContent = 'Loading…';
      try {
        const models = await AI.listModels();
        U.$('#model-list', el).innerHTML = models.map((m) => `<option value="${U.esc(m)}">`).join('');
        U.toast(`${models.length} models found – click the Model box to pick one`, 'good');
        f('model').focus();
      } catch (err) { U.toast('Could not list models: ' + err.message, 'bad'); }
      e.target.disabled = false; e.target.textContent = 'Load models';
    };
    U.$('[data-test]', el).onclick = async (e) => {
      saveAI(); App.refreshChrome();
      const out = U.$('[data-test-out]', el);
      if (!AI.isConfigured()) { out.textContent = 'Fill in the model (and key) first.'; return; }
      e.target.disabled = true; out.textContent = 'Testing…';
      try {
        const t0 = performance.now();
        const reply = await AI.test();
        out.innerHTML = `<span style="color:var(--good)">✓ Works</span> – replied “${U.esc(reply.slice(0, 40))}” in ${((performance.now() - t0) / 1000).toFixed(1)} s`;
      } catch (err) {
        out.innerHTML = `<span style="color:var(--bad)">✗ ${U.esc(err.message)}</span>${/Failed to fetch|NetworkError|Load failed/i.test(err.message) ? '<br>The browser blocked the request (wrong URL, offline, or CORS). Try running <code>python serve.py</code> and ticking “Route requests through the local server”.' : ''}`;
      }
      e.target.disabled = false;
    };
    AI.detectProxy().then((ok) => {
      U.$('[data-proxy-status]', el).textContent = ok ? '(local server detected ✓)' : '(needs the app to be opened via serve.py)';
      if (!ok) f('useProxy').disabled = !f('useProxy').checked;
    });

    U.$$('[data-p]', el).forEach((i) => i.onchange = () => Store.patchSettings((x) => { x.practice[i.dataset.p] = i.type === 'checkbox' ? i.checked : i.value; }));
    U.$$('[data-r]', el).forEach((i) => i.onchange = () => Store.patchSettings((x) => { x.review[i.dataset.r] = parseInt(i.value, 10); }));
    U.$$('[data-theme] button', el).forEach((b) => b.onclick = () => {
      Store.patchSettings((x) => { x.theme = b.dataset.v; }); App.applyTheme();
      U.$$('[data-theme] button', el).forEach((y) => y.classList.toggle('on', y === b));
    });

    U.$('[data-export]', el).onclick = async () => {
      const withKey = s.ai.apiKey ? await U.confirm('Include your API key?', 'Only include it if the backup file will stay private on your own devices.', 'Include key') : false;
      U.download(`study-lab-backup-${U.dayKey(Date.now())}.json`, JSON.stringify(Store.exportAll(withKey)));
    };
    U.$('[data-import]', el).onchange = async (e) => {
      try {
        const data = JSON.parse(await U.readFile(e.target.files[0]));
        let mode = 'replace';
        const answered = await new Promise((res) => U.modal({
          title: 'Import backup', body: '<p><b>Merge</b> adds the backup\'s answers and questions to what\'s here. <b>Replace</b> overwrites everything with the backup.</p>',
          buttons: [{ label: 'Cancel', onClick: () => res(false) }, { label: 'Merge', onClick: () => { mode = 'merge'; res(true); } }, { label: 'Replace', kind: 'danger', onClick: () => { mode = 'replace'; res(true); } }],
          onClose: () => res(false),
        }));
        if (!answered) return;
        Store.importAll(data, mode);
        U.toast('Backup imported', 'good');
        App.applyTheme(); App.route();
      } catch (err) { U.toast('Import failed: ' + err.message, 'bad'); }
    };
    U.$('[data-wipe]', el).onclick = async () => {
      if (!(await U.confirm('Delete everything?', 'All progress, your questions, mocks, interviews and settings (including your API key) will be removed from this browser. Export a backup first if you might want it.', 'Delete everything', true))) return;
      Store.wipe();
      location.hash = '#/setup';
      location.reload();
    };
  },
};
