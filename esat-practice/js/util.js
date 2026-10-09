/* Small helpers shared by every view. Everything hangs off window.U. */
(function () {
  const U = {};

  U.$ = (sel, root = document) => root.querySelector(sel);
  U.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  U.esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // Create an element from an HTML string (first element).
  U.html = (str) => {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  };

  U.uid = (prefix = '') => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  U.letter = (i) => String.fromCharCode(65 + i);
  U.letterIndex = (ch) => ch ? ch.trim().toUpperCase().charCodeAt(0) - 65 : -1;

  U.clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  U.fmtTime = (sec) => {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const mm = h ? String(m).padStart(2, '0') : String(m);
    return (h ? h + ':' : '') + mm + ':' + String(s).padStart(2, '0');
  };
  U.fmtSecs = (sec) => sec == null || isNaN(sec) ? '–' : (sec < 90 ? Math.round(sec) + 's' : (sec / 60).toFixed(1) + 'm');
  U.pct = (x) => x == null || isNaN(x) ? '–' : Math.round(x * 100) + '%';
  U.fmtDate = (ts) => new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  U.fmtDateTime = (ts) => new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  U.dayKey = (ts) => { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  U.DAY = 86400000;

  U.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ---------------- Markdown-lite + KaTeX renderer ----------------
     Maths is lifted out first so markdown never mangles LaTeX, then the rest is
     HTML-escaped (safe for AI output), formatted, and the maths put back. */
  const MATH_RE = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$((?:\\\$|[^$\n])+?)\$/g;

  function renderMath(tex, display) {
    if (!window.katex) return U.esc(display ? '$$' + tex + '$$' : '$' + tex + '$');
    try {
      return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', trust: false, output: 'html' });
    } catch (e) {
      return '<code>' + U.esc(tex) + '</code>';
    }
  }

  function inline(s) {
    return s
      .replace(/`([^`]+)`/g, (m, c) => '<code>' + c + '</code>')
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, '$1<em>$2</em>');
  }

  U.md = (src) => {
    if (src == null) return '';
    src = String(src).replace(/\r\n?/g, '\n');
    const maths = [];
    src = src.replace(MATH_RE, (m, d1, d2, i1, i2) => {
      const display = d1 != null || d2 != null;
      const tex = d1 ?? d2 ?? i1 ?? i2;
      maths.push(renderMath(tex.trim(), display));
      return '\u0000' + (maths.length - 1) + '\u0000';
    });
    src = U.esc(src);

    const lines = src.split('\n');
    const out = [];
    let i = 0;
    const isTableSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
    const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

    while (i < lines.length) {
      const line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }
      if (/^```/.test(line)) {
        const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out.push('<pre><code>' + buf.join('\n') + '</code></pre>');
        continue;
      }
      let m;
      if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
        const lvl = Math.min(4, m[1].length + 1);
        out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`); i++; continue;
      }
      if (/^\s*(---|\*\*\*)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
      if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        const head = cells(line); i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
        out.push('<table><thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
          rows.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
        continue;
      }
      if (/^\s*([-*•])\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*([-*•])\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*•])\s+/, ''));
        out.push('<ul>' + items.map((t) => '<li>' + inline(t) + '</li>').join('') + '</ul>');
        continue;
      }
      if (/^\s*\d+[.)]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ''));
        out.push('<ol>' + items.map((t) => '<li>' + inline(t) + '</li>').join('') + '</ol>');
        continue;
      }
      if (/^&gt;\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^&gt;\s?/.test(lines[i])) buf.push(lines[i++].replace(/^&gt;\s?/, ''));
        out.push('<blockquote>' + inline(buf.join('<br>')) + '</blockquote>');
        continue;
      }
      // Paragraph: gather until blank line or a block starter.
      const buf = [line]; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4}\s|```|\s*[-*•]\s+|\s*\d+[.)]\s+|&gt;)/.test(lines[i]) &&
        !(lines[i].includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1]))) buf.push(lines[i++]);
      out.push('<p>' + inline(buf.join('<br>')) + '</p>');
    }
    let html = out.join('\n');
    html = html.replace(/\u0000(\d+)\u0000/g, (m, n) => maths[+n]);
    return html;
  };

  // Render inline-only (no paragraphs) – for option labels.
  U.mdInline = (src) => {
    const html = U.md(src);
    const m = html.match(/^<p>([\s\S]*)<\/p>$/);
    return m ? m[1] : html;
  };

  /* ---------------- toasts & modals ---------------- */
  U.toast = (msg, kind = '') => {
    const el = U.html(`<div class="toast ${kind}">${U.esc(msg)}</div>`);
    U.$('#toast-root').appendChild(el);
    setTimeout(() => el.remove(), kind === 'bad' ? 5000 : 2600);
  };

  // modal({title, body: HTMLElement|string, buttons:[{label, kind, onClick(close) -> false keeps open}], wide, onClose})
  U.modal = (opts) => {
    const back = U.html(`<div class="modal-back"><div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head"><h2>${U.esc(opts.title || '')}</h2><button class="btn ghost sm" data-x aria-label="Close">✕</button></div>
      <div class="modal-body"></div><div class="modal-foot"></div></div></div>`);
    const body = U.$('.modal-body', back);
    if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.appendChild(opts.body);
    const foot = U.$('.modal-foot', back);
    let closed = false;
    const close = () => {
      if (closed) return; closed = true;
      back.remove(); document.removeEventListener('keydown', onKey, true);
      opts.onClose && opts.onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    (opts.buttons || [{ label: 'Close' }]).forEach((b) => {
      const btn = U.html(`<button class="btn ${b.kind || ''}">${U.esc(b.label)}</button>`);
      btn.onclick = async () => { const r = b.onClick ? await b.onClick(close, btn) : undefined; if (r !== false) close(); };
      foot.appendChild(btn);
    });
    if (!(opts.buttons || [1]).length) foot.remove();
    U.$('[data-x]', back).onclick = close;
    back.addEventListener('mousedown', (e) => { if (e.target === back && !opts.sticky) close(); });
    U.$('#modal-root').appendChild(back);
    return { close, el: back, body };
  };

  U.confirm = (title, text, okLabel = 'OK', danger = false) => new Promise((res) => {
    let answered = false;
    U.modal({
      title, body: `<p>${U.esc(text)}</p>`,
      buttons: [
        { label: 'Cancel', onClick: () => { answered = true; res(false); } },
        { label: okLabel, kind: danger ? 'danger' : 'primary', onClick: () => { answered = true; res(true); } },
      ],
      onClose: () => { if (!answered) res(false); },
    });
  });

  U.download = (filename, text, type = 'application/json') => {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  U.readFile = (file, as = 'text') => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    if (as === 'dataurl') r.readAsDataURL(file); else r.readAsText(file);
  });

  // Downscale an image data URL so vision requests stay small.
  U.shrinkImage = (dataUrl, maxSide = 1400, quality = 0.85) => new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, maxSide / Math.max(img.width, img.height));
      if (s === 1 && dataUrl.startsWith('data:image/jpeg')) return res(dataUrl);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => res(dataUrl);
    img.src = dataUrl;
  });

  U.moduleName = (id) => ({ maths1: 'Mathematics 1', maths2: 'Mathematics 2', physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology' }[id] || id);
  U.moduleShort = (id) => ({ maths1: 'Maths 1', maths2: 'Maths 2', physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology' }[id] || id);

  // Query-string helpers for hash routes like #/bank/maths1?spec=M2.3
  U.parseHash = () => {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    const params = {};
    if (qs) new URLSearchParams(qs).forEach((v, k) => { params[k] = v; });
    return { parts: path.split('/').filter(Boolean), params };
  };
  U.go = (hash) => { if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = hash; };

  window.U = U;
})();
