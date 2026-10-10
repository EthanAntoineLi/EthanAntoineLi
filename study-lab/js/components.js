/* Reusable UI pieces: question rendering, the AI chat panel, AI marking, question editor. */
(function () {
  const C = {};

  C.optionLayout = (q) => {
    const short = q.options.every((o) => String(o).length < 28 && !/\$\$|\n/.test(o));
    return short && q.options.length >= 4 ? 'grid-opts' : '';
  };

  C.stemHTML = (q) => `<div class="q-stem rich">${U.md(q.stem)}</div>${q.figure ? `<div class="figure">${q.figure}</div>` : ''}`;

  C.optionsHTML = (q, state = {}) => `<div class="options ${C.optionLayout(q)}">${q.options.map((o, i) => {
    const cls = ['opt'];
    if (state.choice === i) cls.push('sel');
    if (state.revealed && i === q.answer) cls.push('correct');
    if (state.revealed && state.choice === i && i !== q.answer) cls.push('wrong');
    if (state.struck && state.struck.includes(i)) cls.push('struck');
    return `<button class="${cls.join(' ')}" data-opt="${i}" ${state.revealed ? 'disabled' : ''}>
      <span class="letter">${U.letter(i)}</span><span class="body rich">${U.mdInline(String(o).replace(/\\[dt]?frac/g, '\\dfrac'))}</span></button>`;
  }).join('')}</div>`;

  C.metaChips = (q, extra = '') => {
    const info = Bank.specInfo(q.spec);
    const diff = ['', 'Easier', 'Standard', 'Hard'][q.difficulty] || '';
    const src = q.source === 'ai' ? '<span class="chip warn" title="Made by AI – double-check it">AI-made</span>'
      : q.source === 'import' ? '<span class="chip">Imported</span>' : q.source === 'mine' ? '<span class="chip">Mine</span>' : '';
    const extraSpecs = (q.specs || []).filter((k) => k !== q.spec && Bank.specInfo(k));
    return `<span class="chip blue">${U.esc(U.moduleShort(q.module))}</span>
      ${info ? `<a class="chip" href="#/bank/${q.module}?spec=${encodeURIComponent(q.spec)}" title="${U.esc(info.point.text)}">${U.esc(Bank.specLabel(q.spec))} · ${U.esc(info.point.title)}</a>` : ''}
      ${extraSpecs.map((k) => `<a class="chip" href="#/bank/${Bank.specInfo(k).module}?spec=${encodeURIComponent(k)}" title="also tests: ${U.esc(Bank.specInfo(k).point.text)}">+ ${U.esc(Bank.specLabel(k))}</a>`).join('')}
      ${q.type === 'written' ? `<span class="chip">${q.marks} mark${q.marks === 1 ? '' : 's'}</span>` : ''}
      ${diff ? `<span class="chip">${diff}</span>` : ''}${src}${q.edited ? '<span class="chip">Edited</span>' : ''}${q.verified === false ? '<span class="chip bad" title="The AI checker disagreed with this answer">Unverified</span>' : ''}${extra}`;
  };

  /* ---------------- mark schemes ----------------
     A mark scheme is Markdown. Lines that contain bold mark codes – **M1**, **dM1**, **A1**, **A1ft**,
     **B1**, **B2**, **E1** (several per line allowed, e.g. **M1 A1**) – each become one tickable row.
     Other lines (e.g. "**(a)**" or notes) are shown as labels. */
  const CODE_RE = /(?<![A-Za-z])(?:d|D)?([MABEC])(\d)(?!\d)/g;
  const AWARDS_LINE = /^\**AWARDS.*$/m;
  C.parseMarkScheme = (md) => {
    const items = [];
    let total = 0;
    for (const raw of String(md || '').split('\n')) {
      const line = raw.replace(/^\s*[-*•]\s+/, '').trim();
      if (!line) continue;
      let marks = 0;
      const bolds = [...line.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]);
      const codes = [];
      for (const b of bolds) for (const m of b.matchAll(CODE_RE)) { marks += parseInt(m[2], 10); codes.push(m[0].trim()); }
      if (marks) { items.push({ text: line, marks, codes }); total += marks; }
      else items.push({ text: line, marks: 0, label: true });
    }
    return { items, total };
  };

  /* C.markPanel(container, q, {getAnswer: () => ({text, images}), onSave(score, max, by, feedback, awards), initial})
     Lets you mark a written answer yourself against the scheme, or have the AI mark it.
     initial = a saved mark {score, max, by, feedback, awards}; awards = marks per tickable row (restores the ticks). */
  C.markPanel = (container, q, opts) => {
    const ms = C.parseMarkScheme(q.markScheme);
    const max = q.marks || ms.total;
    const root = U.html(`<div class="markpanel">
      <div class="row between" style="margin-bottom:8px"><h3 style="margin:0">Mark scheme <span class="muted" style="font-weight:500">(${max} marks)</span></h3>
        <div class="row"><button class="btn sm primary" data-ms-ai>✦ Mark with AI</button></div></div>
      <div class="mark-out hidden" data-ai-out style="margin-bottom:12px"><div class="rich"></div></div>
      <div class="ms-list" data-ms></div>
      <div class="row between" style="margin-top:10px">
        <span class="muted" style="font-size:13px">Tick each mark you earned (M = method, A = accuracy, B = independent mark; an A mark normally needs its M mark).</span>
        <span class="row"><b data-total style="font-size:1.15rem">0/${max}</b><button class="btn sm good" data-ms-save>Save mark</button></span>
      </div>
    </div>`);
    container.appendChild(root);
    const list = U.$('[data-ms]', root);
    const awards = ms.items.map(() => 0);
    list.innerHTML = ms.items.map((it, i) => it.label
      ? `<div class="ms-label rich">${U.mdInline(it.text)}</div>`
      : `<label class="ms-row"><span class="ms-ctl">${it.marks > 1
          ? `<select data-i="${i}">${Array.from({ length: it.marks + 1 }, (_, k) => `<option value="${k}">${k}</option>`).join('')}</select>`
          : `<input type="checkbox" data-i="${i}">`}</span><span class="rich">${U.mdInline(it.text)}</span></label>`).join('') ||
      `<div class="rich">${U.md(q.markScheme || '_No mark scheme – use the solution below and enter your mark._')}</div>`;
    const totalEl = U.$('[data-total]', root);
    let manual = null; // when the scheme has no tickable rows, type a score
    if (!ms.items.some((it) => !it.label)) {
      manual = U.html(`<input type="number" min="0" max="${max}" value="0" style="width:80px">`);
      totalEl.replaceWith(manual);
    }
    const tickable = ms.items.filter((it) => !it.label).length;
    // a saved or AI score the ticks can't show (older saves, or an AWARDS line that didn't fit the rows):
    // shown as the total until you change a tick, so pressing Save never silently lowers it
    let held = null;
    let lastFeedback = '', by = 'self';
    const score = () => manual ? U.clamp(parseFloat(manual.value) || 0, 0, max) : held != null ? Math.min(max, held) : Math.min(max, awards.reduce((a, b) => a + b, 0));
    const refresh = () => { if (!manual) totalEl.textContent = `${score()}/${max}`; };
    const tickAwards = () => (manual ? null : ms.items.map((it, i) => (it.label ? null : awards[i])).filter((v) => v != null));
    list.addEventListener('change', (e) => {
      const i = e.target.dataset.i;
      if (i == null) return;
      awards[i] = e.target.type === 'checkbox' ? (e.target.checked ? ms.items[i].marks : 0) : parseInt(e.target.value, 10);
      held = null; by = 'self'; // you changed the mark, so it's yours now
      refresh();
    });
    if (manual) manual.addEventListener('input', () => { by = 'self'; });
    const setAwards = (arr) => {
      let k = 0;
      ms.items.forEach((it, i) => {
        if (it.label) return;
        const v = U.clamp(Math.round(arr[k++] || 0), 0, it.marks);
        awards[i] = v;
        const ctl = U.$(`[data-i="${i}"]`, list);
        if (ctl.type === 'checkbox') ctl.checked = v > 0; else ctl.value = String(v);
      });
      refresh();
    };
    U.$('[data-ms-save]', root).onclick = () => { opts.onSave(score(), max, by, lastFeedback, held != null ? null : tickAwards()); U.toast(`Saved ${score()}/${max}`, 'good'); };
    const aiBtn = U.$('[data-ms-ai]', root);
    aiBtn.onclick = async () => {
      if (!AI.isConfigured()) return C.needAI();
      const ans = opts.getAnswer();
      if (!ans.text.trim() && !ans.images.length) return U.toast('Write your answer (or add a photo of it) first');
      if (!AI.config().vision && !ans.text.trim()) return U.toast('Your AI model is set as text-only, so it can\'t see photos – type your answer, or switch on image input in Settings', 'bad');
      const box = U.$('[data-ai-out]', root), out = U.$('.rich', box);
      box.classList.remove('hidden'); out.innerHTML = '<p class="muted typing">Marking against the mark scheme</p>';
      aiBtn.disabled = true;
      try {
        const full = AI.clean(await AI.chat({
          system: AI.prompts.markWritten(q, ms), effort: 'high',
          messages: [{ role: 'user', content: [{ type: 'text', text: 'My answer:\n' + (ans.text.trim() || '(see the attached photo(s) of my working)') }].concat(ans.images.map((d) => ({ type: 'image', dataUrl: d }))) }],
          onToken: (t, all) => { out.innerHTML = U.md(AI.clean(all).replace(AWARDS_LINE, '')); },
        }));
        out.innerHTML = U.md(full.replace(AWARDS_LINE, ''));
        lastFeedback = full;
        const aw = /\**AWARDS\**\s*:\s*\**\s*([\d,\s]+)/i.exec(full);
        let applied = false;
        if (aw) {
          const arr = aw[1].split(/[,\s]+/).filter(Boolean).map(Number);
          if (arr.length === tickable) { setAwards(arr); applied = true; }
        }
        const sc = AI.parseScore(full);
        if (sc && manual) manual.value = String(sc.got);
        if (sc) {
          by = 'ai';
          const got = Math.min(max, sc.got);
          held = !manual && (!applied || awards.reduce((a, b) => a + b, 0) !== got) ? got : null;
          refresh();
          opts.onSave(got, max, 'ai', full, held != null ? null : tickAwards());
          U.toast(`AI mark saved: ${got}/${max} – change the ticks and Save if you disagree`, 'good');
        }
      } catch (e) { out.innerHTML = U.md('**Error:** ' + e.message); }
      aiBtn.disabled = false;
    };
    if (opts.initial) {
      const ini = opts.initial;
      if (ini.awards && ini.awards.length === tickable) setAwards(ini.awards);
      else if (manual) manual.value = String(ini.score || 0);
      else if (ini.score != null) held = ini.score;
      by = ini.by || 'self';
      lastFeedback = ini.feedback || '';
      if (ini.feedback) { const box = U.$('[data-ai-out]', root); box.classList.remove('hidden'); U.$('.rich', box).innerHTML = U.md(ini.feedback.replace(AWARDS_LINE, '')); }
    }
    refresh();
    return { root };
  };

  // Answer box for written questions: text + photos (+ optional scratchpad image supplier)
  C.answerBox = (container, opts = {}) => {
    const root = U.html(`<div class="answer-box">
      <textarea data-ans rows="8" placeholder="Write your answer and working here. Maths: plain text is fine (x^2, sqrt(3), 1/2), or LaTeX in $…$. You can also add photos of your written working."></textarea>
      <div class="row" style="margin-top:8px"><label class="btn sm">📷 Add photo of working<input type="file" accept="image/*" multiple hidden data-photo></label>
        ${opts.board ? `<label class="check" style="font-size:13px"><input type="checkbox" data-useboard ${opts.useBoard === false ? '' : 'checked'}> include my scratchpad</label>` : ''}
        <div class="thumbs" data-thumbs></div><span class="spacer"></span><span class="muted" style="font-size:12px" data-preview-toggle></span></div>
    </div>`);
    container.appendChild(root);
    const ta = U.$('[data-ans]', root);
    ta.value = opts.text || '';
    const images = (opts.images || []).slice();
    const thumbs = U.$('[data-thumbs]', root);
    const draw = () => {
      thumbs.innerHTML = '';
      images.forEach((src, i) => {
        const t = U.html(`<div class="t"><img src="${src}"><button title="Remove">✕</button></div>`);
        U.$('button', t).onclick = () => { images.splice(i, 1); draw(); opts.onChange && opts.onChange(); };
        thumbs.appendChild(t);
      });
    };
    draw();
    U.$('[data-photo]', root).onchange = async (e) => {
      for (const f of e.target.files) images.push(await U.shrinkImage(await U.readFile(f, 'dataurl'), 1600, 0.85));
      e.target.value = ''; draw(); opts.onChange && opts.onChange();
    };
    ta.addEventListener('keydown', (e) => e.stopPropagation());
    ta.addEventListener('input', () => opts.onChange && opts.onChange());
    const ubox = U.$('[data-useboard]', root);
    if (ubox) ubox.addEventListener('change', () => opts.onChange && opts.onChange());
    return {
      root,
      get: () => {
        const imgs = images.slice();
        const ub = U.$('[data-useboard]', root);
        if (opts.board && (!ub || ub.checked)) { const b = opts.board(); if (b) imgs.push(b); }
        return { text: ta.value, images: imgs };
      },
      text: () => ta.value,
      images: () => images.slice(),
      useBoard: () => !ubox || ubox.checked,
      focus: () => ta.focus(),
    };
  };

  C.needAI = () => {
    U.modal({
      title: 'Connect an AI model first',
      body: `<p>This feature uses your own AI model. Add a provider, model and API key in <b>Settings → AI model</b>.</p>
        <p class="muted">Works with OpenAI, Anthropic (Claude), Google Gemini, OpenRouter, Groq, DeepSeek, Mistral, xAI, or a free local model via Ollama / LM Studio.</p>`,
      buttons: [{ label: 'Not now' }, { label: 'Open settings', kind: 'primary', onClick: () => U.go('#/settings') }],
    });
  };

  /* ---------------- AI chat panel ----------------
     C.chat(container, {title, system: () => string, quick: [{label, text}], intro, onReply(text), extraImages: () => [dataUrl],
                        allowImages, onClose, placeholder, effort}) */
  C.chat = (container, opts) => {
    const root = U.html(`<div style="display:flex;flex-direction:column;height:100%;min-height:0">
      <div class="drawer-head"><h3>${U.esc(opts.title || 'AI')}</h3>
        <span class="chip" title="Change in Settings">${U.esc(AI.config().model || 'no model')}</span>
        ${opts.headExtra || ''}
        ${opts.onClose ? '<button class="btn ghost sm" data-close title="Close">✕</button>' : ''}</div>
      <div class="drawer-body"><div class="chat"></div></div>
      <div class="chat-input">
        <div class="quick"></div>
        <div class="thumbs"></div>
        <textarea placeholder="${U.esc(opts.placeholder || 'Ask anything… (Enter to send, Shift+Enter for a new line)')}"></textarea>
        <div class="row">
          ${opts.allowImages !== false ? '<label class="btn sm" title="Attach a photo of your working">📷 Photo<input type="file" accept="image/*" multiple hidden></label>' : ''}
          ${opts.toolsExtra || ''}
          <span class="spacer"></span>
          <button class="btn sm danger hidden" data-stop>Stop</button>
          <button class="btn sm primary" data-send>Send</button>
        </div>
      </div></div>`);
    container.appendChild(root);
    const chatEl = U.$('.chat', root), body = U.$('.drawer-body', root), ta = U.$('textarea', root);
    const thumbs = U.$('.thumbs', root), sendBtn = U.$('[data-send]', root), stopBtn = U.$('[data-stop]', root);
    const messages = (opts.seed || []).slice();
    let pending = [];
    let busy = false, ctrl = null;

    const quick = U.$('.quick', root);
    (opts.quick || []).forEach((qk) => {
      const b = U.html(`<button>${U.esc(qk.label)}</button>`);
      b.onclick = () => api.send(typeof qk.text === 'function' ? qk.text() : qk.text);
      quick.appendChild(b);
    });

    function addBubble(role, text, images) {
      const el = U.html(`<div class="msg ${role}"><div class="who">${role === 'user' ? 'You' : role === 'assistant' ? (opts.botName || 'AI') : 'Note'}</div><div class="rich"></div></div>`);
      U.$('.rich', el).innerHTML = role === 'user' ? U.md(text) : U.md(text);
      (images || []).forEach((src) => el.appendChild(U.html(`<img src="${src}" alt="attached image">`)));
      chatEl.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return el;
    }
    if (opts.intro) addBubble('system', opts.intro);
    messages.forEach((m) => addBubble(m.role, typeof m.content === 'string' ? m.content : m.content.filter((p) => p.type === 'text').map((p) => p.text).join('\n')));

    function renderThumbs() {
      thumbs.innerHTML = '';
      pending.forEach((src, i) => {
        const t = U.html(`<div class="t"><img src="${src}"><button title="Remove">✕</button></div>`);
        U.$('button', t).onclick = () => { pending.splice(i, 1); renderThumbs(); };
        thumbs.appendChild(t);
      });
    }
    const fileInput = U.$('input[type=file]', root);
    if (fileInput) fileInput.onchange = async () => {
      for (const f of fileInput.files) pending.push(await U.shrinkImage(await U.readFile(f, 'dataurl')));
      fileInput.value = ''; renderThumbs();
    };
    ta.addEventListener('paste', async (e) => {
      const items = [...(e.clipboardData || {}).items || []].filter((it) => it.type.startsWith('image/'));
      if (!items.length) return;
      e.preventDefault();
      for (const it of items) pending.push(await U.shrinkImage(await U.readFile(it.getAsFile(), 'dataurl')));
      renderThumbs();
    });
    ta.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); api.send(); }
    });
    sendBtn.onclick = () => api.send();
    stopBtn.onclick = () => ctrl && ctrl.abort();
    if (opts.onClose) U.$('[data-close]', root).onclick = opts.onClose;

    const api = {
      el: root, messages,
      busy: () => busy,
      addNote: (t) => addBubble('system', t),
      setInput: (t) => { ta.value = t; ta.focus(); },
      async send(text, sendOpts = {}) {
        if (busy) return;
        if (!AI.isConfigured()) return C.needAI();
        text = (text != null ? text : ta.value).trim();
        const extra = opts.extraImages ? (opts.extraImages() || []) : [];
        const imgs = pending.concat(extra);
        if (!text && !imgs.length) return;
        if (!text) text = '(see attached image)';
        ta.value = ''; pending = []; renderThumbs();
        const content = imgs.length ? [{ type: 'text', text }].concat(imgs.map((d) => ({ type: 'image', dataUrl: d }))) : text;
        messages.push({ role: 'user', content });
        if (!sendOpts.hidden) addBubble('user', text, imgs);
        await api.reply();
      },
      async reply() {
        busy = true; sendBtn.disabled = true; stopBtn.classList.remove('hidden');
        const el = addBubble('assistant', '');
        const out = U.$('.rich', el);
        out.classList.add('typing');
        ctrl = new AbortController();
        let raf = 0, latest = '';
        try {
          const full = await AI.chat({
            system: typeof opts.system === 'function' ? opts.system() : opts.system,
            messages, signal: ctrl.signal, effort: opts.effort || 'medium',
            onToken: (t, all) => {
              latest = all;
              if (!raf) raf = requestAnimationFrame(() => { raf = 0; out.innerHTML = U.md(AI.clean(latest)); body.scrollTop = body.scrollHeight; });
            },
          });
          const clean = AI.clean(full);
          cancelAnimationFrame(raf);
          out.innerHTML = U.md(clean || '_(empty reply)_');
          messages.push({ role: 'assistant', content: clean });
          opts.onReply && opts.onReply(clean);
        } catch (e) {
          cancelAnimationFrame(raf);
          if (e.name === 'AbortError') {
            const partial = AI.clean(latest);
            out.innerHTML = U.md((partial || '') + '\n\n_[stopped]_');
            if (partial) messages.push({ role: 'assistant', content: partial });
            else messages.pop();
          } else {
            el.classList.remove('assistant'); el.classList.add('system');
            out.innerHTML = U.md('**Error:** ' + e.message + (/Failed to fetch|NetworkError|Load failed/i.test(e.message) ? '\n\nThe request was blocked before reaching the provider – usually a wrong base URL, no internet, or the provider blocking browser (CORS) requests. Try running `serve.py` and switching on "route through local server" in Settings.' : ''));
            messages.pop();
          }
        } finally {
          out.classList.remove('typing');
          busy = false; sendBtn.disabled = false; stopBtn.classList.add('hidden'); ctrl = null;
          body.scrollTop = body.scrollHeight;
        }
      },
      stop() { ctrl && ctrl.abort(); },
    };
    return api;
  };

  /* ---------------- "Mark my working" (AI vs the worked solution) ---------------- */
  C.markWorking = (q, choice, opts = {}) => {
    if (!AI.isConfigured()) return C.needAI();
    const body = U.html(`<div>
      <p class="muted" style="margin-top:0">Type your working and/or attach a photo of your paper. The AI marks it against the worked solution (M1 approach · M1 key steps · A1 answer · E1 efficiency) and pinpoints the first mistake.</p>
      <div class="field"><label>Your working</label><textarea rows="6" placeholder="e.g. Let the side be x, then …"></textarea></div>
      <div class="row" style="margin-bottom:10px">
        <label class="btn sm">📷 Add photo<input type="file" accept="image/*" multiple hidden></label>
        ${opts.boardImage ? '<label class="check"><input type="checkbox" data-board checked> Include my scratchpad drawing</label>' : ''}
      </div>
      <div class="thumbs"></div>
      <div class="mark-out hidden" style="margin-top:14px"><div class="rich"></div></div>
    </div>`);
    const imgs = [];
    const thumbs = U.$('.thumbs', body);
    const render = () => { thumbs.innerHTML = imgs.map((s) => `<div class="t"><img src="${s}"></div>`).join(''); };
    U.$('input[type=file]', body).onchange = async (e) => { for (const f of e.target.files) imgs.push(await U.shrinkImage(await U.readFile(f, 'dataurl'))); render(); };
    const ta = U.$('textarea', body);
    ta.addEventListener('keydown', (e) => e.stopPropagation());
    const outBox = U.$('.mark-out', body), out = U.$('.rich', outBox);
    let running = false;
    U.modal({
      title: 'Mark my working', body, wide: true, sticky: true,
      buttons: [
        { label: 'Close' },
        { label: 'Mark it', kind: 'primary', onClick: async (close, btn) => {
          if (running) return false;
          const all = imgs.slice();
          const boardBox = U.$('[data-board]', body);
          if (opts.boardImage && boardBox && boardBox.checked) all.push(opts.boardImage);
          if (!ta.value.trim() && !all.length) { U.toast('Add some working first'); return false; }
          running = true; btn.disabled = true; btn.textContent = 'Marking…';
          outBox.classList.remove('hidden'); out.innerHTML = '<p class="muted typing">Marking</p>';
          const content = [{ type: 'text', text: 'My working:\n' + (ta.value.trim() || '(see photo)') }].concat(all.map((d) => ({ type: 'image', dataUrl: d })));
          try {
            const full = await AI.chat({
              system: AI.prompts.markWorking(q, choice), effort: 'high',
              messages: [{ role: 'user', content }],
              onToken: (t, s) => { out.innerHTML = U.md(AI.clean(s)); },
            });
            out.innerHTML = U.md(AI.clean(full));
            const sc = AI.parseScore(full);
            if (sc && opts.onScore) opts.onScore(sc);
          } catch (e) { out.innerHTML = U.md('**Error:** ' + e.message); }
          running = false; btn.disabled = false; btn.textContent = 'Mark again';
          return false;
        } },
      ],
    });
  };

  /* ---------------- question editor (fix a question / write your own) ---------------- */
  C.specOptionsHTML = (selected, onlyUnits) => Courses.all().map((c) => c.units.filter((u) => !onlyUnits || onlyUnits.includes(u.id)).map((u) =>
    `<optgroup label="${U.esc((c.kind === 'esat' ? 'ESAT ' : c.short + ' ') + u.short + ' – ' + u.name)}">${u.sections.map((s) => s.points.map((p) =>
      `<option value="${U.esc(p.key)}" ${p.key === selected ? 'selected' : ''}>${U.esc(Courses.label(p.key))} ${U.esc(p.title)}</option>`).join('')).join('')}</optgroup>`).join('')).join('');

  C.editQuestion = (q, onSave, opts = {}) => {
    const isNew = !q;
    const firstUnit = Store.studyUnits(['current'])[0] || Store.studyUnits(['done'])[0] || 'maths1';
    const defaultSpec = (Courses.points(firstUnit)[0] || {}).key || 'M1.1';
    q = q || { type: opts.type || (Courses.unit(firstUnit) && Courses.unit(firstUnit).course !== 'esat' ? 'written' : 'mcq'), spec: defaultSpec, difficulty: 2, stem: '', options: ['', '', '', '', ''], answer: 0, solution: '', markScheme: '', marks: 0 };
    let type = q.type || 'mcq';
    const body = U.html(`<div>
      ${isNew ? `<div class="field"><label>Type</label><div class="seg" data-type><button data-v="written">Written answer (A-level style)</button><button data-v="mcq">Multiple choice (ESAT style)</button></div></div>` : ''}
      <div class="grid c2">
        <div class="field"><label>Spec point</label><select data-f="spec">${C.specOptionsHTML(q.spec)}</select></div>
        <div class="field"><label>Difficulty</label><select data-f="difficulty">
          <option value="1" ${q.difficulty === 1 ? 'selected' : ''}>Easier</option><option value="2" ${q.difficulty === 2 ? 'selected' : ''}>Standard</option><option value="3" ${q.difficulty === 3 ? 'selected' : ''}>Hard</option></select></div>
      </div>
      <div class="field"><label>Question <span class="hint">Markdown + LaTeX in $…$. For written questions show marks per part like **(3)**.</span></label><textarea data-f="stem" rows="6">${U.esc(q.stem)}</textarea></div>
      <div data-mcq>
        <div class="field"><label>Options <span class="hint">one per line (A, B, C… in order)</span></label><textarea data-f="options" rows="6">${U.esc((q.options || []).join('\n'))}</textarea></div>
        <div class="field"><label>Correct option</label><input type="text" data-f="answer" value="${U.letter(q.answer || 0)}" maxlength="1" style="width:70px"></div>
      </div>
      <div data-written>
        <div class="field"><label>Mark scheme <span class="hint">one mark per line, e.g. "- **M1** resolves vertically", "- **A1** T = 12 N", "- **B2** …"; group with "**(a)**". Total is counted automatically.</span></label><textarea data-f="markScheme" rows="8">${U.esc(q.markScheme || '')}</textarea>
          <span class="hint" data-mstotal></span></div>
      </div>
      <div class="field"><label>Worked solution</label><textarea data-f="solution" rows="6">${U.esc(q.solution || '')}</textarea></div>
      <div class="field"><label>Preview</label><div class="qpreview" data-preview></div></div>
    </div>`);
    const showType = () => {
      U.$('[data-mcq]', body).style.display = type === 'mcq' ? '' : 'none';
      U.$('[data-written]', body).style.display = type === 'written' ? '' : 'none';
      U.$$('[data-type] button', body).forEach((b) => b.classList.toggle('on', b.dataset.v === type));
    };
    U.$$('[data-type] button', body).forEach((b) => b.onclick = () => { type = b.dataset.v; showType(); preview(); });
    const get = () => {
      const v = {
        type,
        spec: U.$('[data-f=spec]', body).value,
        difficulty: parseInt(U.$('[data-f=difficulty]', body).value, 10),
        stem: U.$('[data-f=stem]', body).value.trim(),
        solution: U.$('[data-f=solution]', body).value.trim(),
      };
      if (type === 'mcq') {
        v.options = U.$('[data-f=options]', body).value.split('\n').map((x) => x.trim()).filter(Boolean);
        v.answer = U.letterIndex(U.$('[data-f=answer]', body).value);
      } else {
        v.markScheme = U.$('[data-f=markScheme]', body).value.trim();
        v.marks = C.parseMarkScheme(v.markScheme).total;
      }
      return v;
    };
    const preview = () => {
      const v = get();
      if (type === 'written') U.$('[data-mstotal]', body).textContent = `Counted ${v.marks} mark${v.marks === 1 ? '' : 's'} in the scheme.`;
      U.$('[data-preview]', body).innerHTML = C.stemHTML(v) + (type === 'mcq' ? C.optionsHTML(v, { revealed: true, choice: -1 })
        : `<h4>Mark scheme</h4><div class="rich">${U.md(v.markScheme)}</div>`) + `<div class="solution rich">${U.md(v.solution)}</div>`;
    };
    body.addEventListener('input', U.debounce(preview, 300));
    body.addEventListener('keydown', (e) => e.stopPropagation());
    showType(); preview();
    U.modal({
      title: isNew ? 'Write a question' : 'Edit question', body, wide: true, sticky: true,
      buttons: [{ label: 'Cancel' }, { label: 'Save', kind: 'primary', onClick: () => {
        const v = get();
        if (!v.stem) { U.toast('The question needs some text', 'bad'); return false; }
        if (type === 'mcq' && (v.options.length < 2 || v.answer < 0 || v.answer >= v.options.length)) { U.toast('Needs at least 2 options and a valid answer letter', 'bad'); return false; }
        if (type === 'written' && !v.marks) { U.toast('Add a mark scheme with at least one mark code like **M1** or **B1**', 'bad'); return false; }
        v.module = Bank.specInfo(v.spec).module;
        onSave(v);
      } }],
    });
  };

  // Tiny inline SVG bar/line charts (no libraries). series: [{label, value, color?}]
  C.barChart = (series, o = {}) => {
    const W = o.width || 640, H = o.height || 160, pad = 26, max = o.max || Math.max(1, ...series.map((s) => s.value));
    const bw = (W - pad) / Math.max(1, series.length);
    const bars = series.map((s, i) => {
      const h = (s.value / max) * (H - pad - 6);
      const x = pad + i * bw + bw * 0.15, y = H - pad - h;
      const w = bw * 0.7, r = Math.min(4, w / 2, h);
      const d = h <= 0 ? '' : `M${x.toFixed(1)},${(H - pad).toFixed(1)}V${(y + r).toFixed(1)}Q${x.toFixed(1)},${y.toFixed(1)} ${(x + r).toFixed(1)},${y.toFixed(1)}H${(x + w - r).toFixed(1)}Q${(x + w).toFixed(1)},${y.toFixed(1)} ${(x + w).toFixed(1)},${(y + r).toFixed(1)}V${(H - pad).toFixed(1)}Z`;
      return `<g><rect x="${(pad + i * bw).toFixed(1)}" y="0" width="${bw.toFixed(1)}" height="${H - pad}" fill="transparent"/><path d="${d}" fill="${s.color || 'var(--chart-1)'}"/><title>${U.esc(s.title || s.label + ': ' + s.value)}</title></g>` +
        (o.labelEvery && i % o.labelEvery !== 0 ? '' : `<text x="${(x + bw * 0.35).toFixed(1)}" y="${H - 8}" text-anchor="middle">${U.esc(s.label)}</text>`);
    }).join('');
    const grid = [0.5, 1].map((f) => `<line class="grid-line" x1="${pad}" x2="${W}" y1="${(H - pad - f * (H - pad - 6)).toFixed(1)}" y2="${(H - pad - f * (H - pad - 6)).toFixed(1)}"/><text x="${pad - 4}" y="${(H - pad - f * (H - pad - 6) + 4).toFixed(1)}" text-anchor="end">${o.fmt ? o.fmt(max * f) : Math.round(max * f)}</text>`).join('');
    return `<svg class="svg-chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${U.esc(o.label || 'chart')}">${grid}<line class="grid-line" x1="${pad}" x2="${W}" y1="${H - pad}" y2="${H - pad}"/>${bars}</svg>`;
  };

  C.lineChart = (points, o = {}) => {
    const W = o.width || 640, H = o.height || 180, padL = 34, padB = 26, max = o.max || 1;
    if (!points.length) return '<div class="empty">No data yet</div>';
    const n = points.length;
    const xs = (i) => padL + (n === 1 ? (W - padL) / 2 : (i / (n - 1)) * (W - padL - 12));
    const ys = (v) => H - padB - (v / max) * (H - padB - 10);
    const path = points.map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${ys(p.value).toFixed(1)}`).join(' ');
    const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => `<line class="grid-line" x1="${padL}" x2="${W}" y1="${ys(max * f)}" y2="${ys(max * f)}"/><text x="${padL - 4}" y="${ys(max * f) + 4}" text-anchor="end">${o.fmt ? o.fmt(max * f) : max * f}</text>`).join('');
    const dots = points.map((p, i) => `<circle cx="${xs(i).toFixed(1)}" cy="${ys(p.value).toFixed(1)}" r="4" fill="var(--chart-1)" stroke="var(--panel)" stroke-width="2"><title>${U.esc(p.title || p.label)}</title></circle>` +
      (n <= 12 || i % Math.ceil(n / 12) === 0 ? `<text x="${xs(i).toFixed(1)}" y="${H - 8}" text-anchor="middle">${U.esc(p.label)}</text>` : '')).join('');
    return `<svg class="svg-chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${U.esc(o.label || 'chart')}">${grid}<path d="${path}" fill="none" stroke="var(--chart-1)" stroke-width="2"/>${dots}</svg>`;
  };

  // Accuracy uses a diverging blue <-> red scale around a neutral grey band (55–70%, roughly
  // "typical ESAT"), so strong and weak spec points stand out without relying on status colours.
  C.accBins = [
    { min: 0.85, bg: 'var(--div-blue-strong)', fg: '#fff', label: '85%+' },
    { min: 0.70, bg: 'var(--div-blue-soft)', fg: 'var(--ink)', label: '70–84%' },
    { min: 0.55, bg: 'var(--div-mid)', fg: 'var(--ink)', label: '55–69%' },
    { min: 0.40, bg: 'var(--div-red-soft)', fg: 'var(--ink)', label: '40–54%' },
    { min: -1, bg: 'var(--div-red-strong)', fg: '#fff', label: 'under 40%' },
  ];
  C.accStyle = (acc) => {
    if (acc == null) return 'background:var(--panel-2);color:var(--ink-3);border-style:dashed';
    const b = C.accBins.find((x) => acc >= x.min);
    return `background:${b.bg};color:${b.fg};border-color:transparent`;
  };
  C.accLegend = () => `<div class="legend">${C.accBins.map((b) => `<span><i style="background:${b.bg};border-color:transparent"></i>${b.label}</span>`).join('')}<span><i style="border-style:dashed"></i>not tried</span></div>`;

  window.C = C;
})();
