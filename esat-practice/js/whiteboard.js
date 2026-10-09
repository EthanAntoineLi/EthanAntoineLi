/* A simple drawing board – your "erasable booklet" for working, and the interview whiteboard.
   const wb = Whiteboard.create(containerEl); wb.toDataURL(); wb.isEmpty(); wb.clear(); */
(function () {
  const COLORS = ['#111827', '#2f5bea', '#d64545', '#1f9d55'];

  function create(container, opts = {}) {
    const root = U.html(`<div class="wb">
      <div class="wb-tools">
        <button data-tool="pen" class="on" title="Pen (P)">✎ Pen</button>
        <button data-tool="eraser" title="Eraser (E)">⌫ Eraser</button>
        ${COLORS.map((c, i) => `<button class="swatch ${i === 0 ? 'on' : ''}" data-color="${c}" style="background:${c}" title="Colour"></button>`).join('')}
        <select data-size title="Pen size" style="width:auto;padding:3px 6px;font-size:13px">
          <option value="2">Thin</option><option value="3.5" selected>Medium</option><option value="6">Thick</option>
        </select>
        <span class="spacer"></span>
        <button data-act="undo" title="Undo (Ctrl+Z)">↶ Undo</button>
        <button data-act="clear" title="Clear board">Clear</button>
        ${opts.extraTools || ''}
      </div>
      <div class="wb-canvas-wrap"><canvas></canvas></div>
    </div>`);
    container.appendChild(root);
    const wrap = U.$('.wb-canvas-wrap', root);
    const canvas = U.$('canvas', root);
    const ctx = canvas.getContext('2d');
    let strokes = [];
    let cur = null;
    let tool = 'pen', color = COLORS[0], size = 3.5;
    let dpr = window.devicePixelRatio || 1;
    let changed = opts.onChange || (() => {});

    function resize() {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      redraw();
    }
    function drawStroke(s) {
      if (!s.pts.length) return;
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = s.eraser ? '#ffffff' : s.color;
      ctx.lineWidth = (s.eraser ? s.size * 5 : s.size) * dpr;
      ctx.beginPath();
      const p0 = s.pts[0];
      ctx.moveTo(p0[0] * dpr, p0[1] * dpr);
      if (s.pts.length === 1) ctx.lineTo(p0[0] * dpr + 0.1, p0[1] * dpr + 0.1);
      for (let i = 1; i < s.pts.length; i++) {
        const a = s.pts[i - 1], b = s.pts[i];
        ctx.quadraticCurveTo(a[0] * dpr, a[1] * dpr, ((a[0] + b[0]) / 2) * dpr, ((a[1] + b[1]) / 2) * dpr);
      }
      ctx.stroke();
      ctx.restore();
    }
    function redraw() {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      strokes.forEach(drawStroke);
      if (cur) drawStroke(cur);
    }
    function pos(e) {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      canvas.setPointerCapture(e.pointerId);
      cur = { pts: [pos(e)], color, size: e.pointerType === 'pen' && e.pressure ? size * (0.6 + e.pressure) : size, eraser: tool === 'eraser' };
      redraw();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!cur) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs) cur.pts.push(pos(ev));
      redraw();
    });
    const end = () => { if (cur) { strokes.push(cur); cur = null; redraw(); changed(); } };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || !root.contains(b)) return;
      if (b.dataset.tool) setTool(b.dataset.tool);
      if (b.dataset.color) {
        color = b.dataset.color; setTool('pen');
        U.$$('[data-color]', root).forEach((x) => x.classList.toggle('on', x === b));
      }
      if (b.dataset.act === 'undo') api.undo();
      if (b.dataset.act === 'clear') api.clear();
    });
    U.$('[data-size]', root).addEventListener('change', (e) => { size = parseFloat(e.target.value); });
    function setTool(t) {
      tool = t;
      U.$$('[data-tool]', root).forEach((x) => x.classList.toggle('on', x.dataset.tool === t));
    }
    const onKey = (e) => {
      if (!document.body.contains(root) || root.offsetParent === null) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !/input|textarea|select/i.test(e.target.tagName)) { e.preventDefault(); api.undo(); }
    };
    document.addEventListener('keydown', onKey);

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);
    requestAnimationFrame(resize);

    const api = {
      el: root,
      undo() { strokes.pop(); redraw(); changed(); },
      clear() { strokes = []; redraw(); changed(); },
      isEmpty() { return strokes.length === 0; },
      strokeCount() { return strokes.length; },
      toDataURL() {
        // Crop to the drawn area (plus margin) so the image is legible for the AI.
        if (!strokes.length) return null;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        strokes.forEach((s) => s.pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
        const m = 24;
        x0 = Math.max(0, x0 - m) * dpr; y0 = Math.max(0, y0 - m) * dpr;
        x1 = Math.min(canvas.width, (x1 + m) * dpr); y1 = Math.min(canvas.height, (y1 + m) * dpr);
        const w = Math.max(50, x1 - x0), h = Math.max(50, y1 - y0);
        const out = document.createElement('canvas');
        out.width = w; out.height = h;
        const o = out.getContext('2d');
        o.fillStyle = '#fff'; o.fillRect(0, 0, w, h);
        o.drawImage(canvas, x0, y0, w, h, 0, 0, w, h);
        return out.toDataURL('image/png');
      },
      destroy() { ro.disconnect(); document.removeEventListener('keydown', onKey); root.remove(); },
      onChange(fn) { changed = fn; },
    };
    return api;
  }

  window.Whiteboard = { create };
})();
