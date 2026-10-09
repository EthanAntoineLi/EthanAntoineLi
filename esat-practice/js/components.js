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
    return `<span class="chip blue">${U.esc(U.moduleShort(q.module))}</span>
      ${info ? `<a class="chip" href="#/bank/${q.module}?spec=${encodeURIComponent(q.spec)}" title="${U.esc(info.point.text)}">${U.esc(q.spec)} · ${U.esc(info.point.title)}</a>` : ''}
      ${diff ? `<span class="chip">${diff}</span>` : ''}${src}${q.edited ? '<span class="chip">Edited</span>' : ''}${q.verified === false ? '<span class="chip bad" title="The AI checker disagreed with this answer">Unverified</span>' : ''}${extra}`;
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
  C.editQuestion = (q, onSave) => {
    const isNew = !q;
    q = q || { module: Store.profile()?.modules?.[0] || 'maths1', spec: '', difficulty: 2, stem: '', options: ['', '', '', '', ''], answer: 0, solution: '' };
    const specOpts = window.ESAT_SPEC.map((m) => `<optgroup label="${U.esc(m.name)}">${m.sections.map((s) => s.points.map((p) =>
      `<option value="${p.code}" ${p.code === q.spec ? 'selected' : ''}>${p.code} ${U.esc(p.title)}</option>`).join('')).join('')}</optgroup>`).join('');
    const body = U.html(`<div>
      <div class="grid c2">
        <div class="field"><label>Spec point</label><select data-f="spec">${specOpts}</select></div>
        <div class="field"><label>Difficulty</label><select data-f="difficulty">
          <option value="1" ${q.difficulty === 1 ? 'selected' : ''}>Easier</option><option value="2" ${q.difficulty === 2 ? 'selected' : ''}>Standard</option><option value="3" ${q.difficulty === 3 ? 'selected' : ''}>Hard</option></select></div>
      </div>
      <div class="field"><label>Question <span class="hint">Markdown + LaTeX in $…$</span></label><textarea data-f="stem" rows="5">${U.esc(q.stem)}</textarea></div>
      <div class="field"><label>Options <span class="hint">one per line (A, B, C… in order)</span></label><textarea data-f="options" rows="6">${U.esc(q.options.join('\n'))}</textarea></div>
      <div class="field"><label>Correct option</label><input type="text" data-f="answer" value="${U.letter(q.answer)}" maxlength="1" style="width:70px"></div>
      <div class="field"><label>Worked solution</label><textarea data-f="solution" rows="6">${U.esc(q.solution)}</textarea></div>
      <div class="field"><label>Preview</label><div class="qpreview" data-preview></div></div>
    </div>`);
    const get = () => ({
      spec: U.$('[data-f=spec]', body).value,
      difficulty: parseInt(U.$('[data-f=difficulty]', body).value, 10),
      stem: U.$('[data-f=stem]', body).value.trim(),
      options: U.$('[data-f=options]', body).value.split('\n').map((s) => s.trim()).filter(Boolean),
      answer: U.letterIndex(U.$('[data-f=answer]', body).value),
      solution: U.$('[data-f=solution]', body).value.trim(),
    });
    const preview = () => {
      const v = get();
      U.$('[data-preview]', body).innerHTML = C.stemHTML(v) + C.optionsHTML(v, { revealed: true, choice: -1 }) + `<div class="solution rich">${U.md(v.solution)}</div>`;
    };
    body.addEventListener('input', U.debounce(preview, 300));
    body.addEventListener('keydown', (e) => e.stopPropagation());
    preview();
    U.modal({
      title: isNew ? 'Write a question' : 'Edit question', body, wide: true, sticky: true,
      buttons: [{ label: 'Cancel' }, { label: 'Save', kind: 'primary', onClick: () => {
        const v = get();
        if (!v.stem || v.options.length < 2 || v.answer < 0 || v.answer >= v.options.length) { U.toast('Needs a question, at least 2 options and a valid answer letter', 'bad'); return false; }
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
