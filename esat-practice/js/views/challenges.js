/* Challenge problems: longer, interview-style problems with hints, answer checking,
   and AI marking of your written solution against a mark scheme. */
(function () {
  const SUBJECTS = { maths: 'Maths', physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology', engineering: 'Engineering' };

  // Safe arithmetic evaluator for answers like "3/4", "2sqrt(3)", "pi/6", "1.5e3", "2^10".
  function evalExpr(src) {
    const s = String(src).toLowerCase().replace(/%\s*$/, '').replace(/,(?=\d{3}\b)/g, '').replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/−/g, '-');
    let i = 0;
    const peek = () => s[i];
    function num() {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(i));
      if (!m) throw new Error('number expected');
      i += m[0].length; return parseFloat(m[0]);
    }
    function atom() {
      if (peek() === '(') { i++; const v = expr(); if (s[i] !== ')') throw new Error(') expected'); i++; return v; }
      if (s.startsWith('pi', i)) { i += 2; return Math.PI; }
      if (s.startsWith('sqrt', i)) { i += 4; return Math.sqrt(atom()); }
      if (s.startsWith('e', i) && !/[0-9]/.test(s[i + 1] || '')) { i += 1; return Math.E; }
      return num();
    }
    function power() { let b = atom(); if (peek() === '^') { i++; b = Math.pow(b, unary()); } return b; }
    function unary() { if (peek() === '-') { i++; return -unary(); } if (peek() === '+') { i++; return unary(); } return power(); }
    function term() {
      let v = unary();
      for (;;) {
        if (peek() === '*') { i++; v *= unary(); }
        else if (peek() === '/') { i++; v /= unary(); }
        else if (peek() && /[(a-z0-9.]/.test(peek())) v *= unary(); // implicit multiplication: 2sqrt(3), 3pi
        else return v;
      }
    }
    function expr() {
      let v = term();
      for (;;) {
        if (peek() === '+') { i++; v += term(); }
        else if (peek() === '-') { i++; v -= term(); }
        else return v;
      }
    }
    const v = expr();
    if (i !== s.length) throw new Error('unexpected "' + s.slice(i) + '"');
    return v;
  }

  function checkAnswer(ch, input) {
    const a = ch.answer;
    if (!a) return null;
    if (a.type === 'numeric' || a.type === 'order') {
      let v;
      try { v = evalExpr(input); } catch (e) {
        // allow a trailing unit, e.g. "5 m/s" or "300 K"
        try { v = evalExpr(input.replace(/\s+[a-zA-Zµ°Ω][\w/^·°Ω-]*$/, '')); } catch (e2) { return { ok: false, msg: 'Could not read that as a number (' + e.message + ').' }; }
      }
      if (a.type === 'order') {
        // estimation: right if within the given factor of the reference value
        const ok = v > 0 && v / a.value <= a.factor && a.value / v <= a.factor;
        return { ok, msg: ok ? 'Good estimate – that\'s the right order of magnitude. Compare your assumptions with the solution.' : 'That\'s not within a factor of ' + a.factor + ' of a careful estimate – check your assumptions and powers of ten.' };
      }
      const tol = a.tol != null ? a.tol : 0.01;
      const ok = Math.abs(v - a.value) <= Math.abs(a.value) * tol + 1e-9;
      return { ok, msg: ok ? 'Correct!' : 'Not quite – have another go or take a hint.' };
    }
    if (a.type === 'text') {
      const norm = (x) => String(x).toLowerCase().replace(/[\s.,;:'"`]+/g, '');
      const ok = a.accept.some((x) => norm(x) === norm(input));
      return { ok, msg: ok ? 'Correct!' : 'Not what we were looking for – check the solution or ask the AI to mark your reasoning.' };
    }
    return null;
  }

  const V = { evalExpr };

  V.render = (el, { parts, params }) => {
    if (parts[1]) return renderOne(el, parts[1]);
    renderList(el, params);
  };

  function all() { return window.ESAT_CHALLENGES || []; }

  function renderList(el, params) {
    const prog = Store.challenges();
    const subj = params.subject || '';
    const list = all().filter((c) => !subj || c.subject === subj);
    const solved = all().filter((c) => prog[c.id] && prog[c.id].solved).length;
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Challenge problems</h1><p>Longer, interview-style problems – graded by difficulty, with hints, answer checking and AI marking against a mark scheme. ${solved}/${all().length} solved.</p></div>
        <a class="btn" href="#/interview">◉ Practise out loud in an AI interview</a></div>
      <div class="row" style="margin-bottom:14px"><a class="btn sm ${!subj ? 'primary' : ''}" href="#/challenges">All</a>
        ${Object.keys(SUBJECTS).filter((k) => all().some((c) => c.subject === k)).map((k) => `<a class="btn sm ${subj === k ? 'primary' : ''}" href="#/challenges?subject=${k}">${SUBJECTS[k]}</a>`).join('')}</div>
      <div class="grid c3">${list.sort((a, b) => a.difficulty - b.difficulty).map((c) => {
        const p = prog[c.id];
        return `<a class="card mod-card" href="#/challenges/${c.id}" style="color:inherit;text-decoration:none">
          <div class="top"><span class="chip blue">${SUBJECTS[c.subject]}</span>${p && p.solved ? '<span class="chip good">✓ solved</span>' : p && p.tries ? '<span class="chip">tried</span>' : ''}</div>
          <h3>${U.esc(c.title)}</h3>
          <div class="row between"><span title="difficulty" style="letter-spacing:2px;color:var(--warn)">${'★'.repeat(c.difficulty)}<span style="color:var(--line-2)">${'★'.repeat(5 - c.difficulty)}</span></span>
            <span class="muted" style="font-size:12.5px">${c.hints.length} hint${c.hints.length === 1 ? '' : 's'}</span></div>
        </a>`;
      }).join('')}</div></div>`;
  }

  function renderOne(el, id) {
    const ch = all().find((c) => c.id === id);
    if (!ch) { el.innerHTML = '<div class="page empty">Problem not found. <a href="#/challenges">Back</a></div>'; return; }
    const prog = Store.challenges()[id] || { tries: 0, hints: 0, solved: false };
    let shown = prog.hints || 0;
    const total = (ch.markScheme || []).reduce((s, m) => s + m.marks, 0);
    el.innerHTML = `<div class="page" style="max-width:900px">
      <div class="crumbs"><a href="#/challenges">Challenge problems</a> / ${SUBJECTS[ch.subject]}</div>
      <div class="page-head"><div><h1>${U.esc(ch.title)}</h1><div class="row"><span class="chip blue">${SUBJECTS[ch.subject]}</span><span class="chip">${'★'.repeat(ch.difficulty)} difficulty ${ch.difficulty}/5</span>${prog.solved ? '<span class="chip good">✓ solved</span>' : ''}${prog.bestMark != null ? `<span class="chip">best AI mark ${prog.bestMark}/${total}</span>` : ''}</div></div>
        <a class="btn" href="#/interview?challenge=${ch.id}">◉ Talk it through in an AI interview</a></div>
      <div class="card"><div class="rich q-stem">${U.md(ch.statement)}</div>${ch.figure ? `<div class="figure">${ch.figure}</div>` : ''}</div>
      <div class="card"><h3>Hints</h3><div data-hints class="stack"></div>
        <div class="row" style="margin-top:10px"><button class="btn sm" data-hint>Show a hint</button><span class="muted" data-hint-left style="font-size:13px"></span></div></div>
      ${ch.answer ? `<div class="card"><h3>Your answer</h3><div class="row"><input type="text" data-ans placeholder="${ch.answer.type === 'numeric' ? 'e.g. 3/4, 2sqrt(3), pi/6, 1.5e3' : ch.answer.type === 'order' ? 'your estimate, e.g. 3e9' : 'type your answer'}" style="max-width:340px">
        ${ch.answer.unit ? `<span class="muted">${U.esc(ch.answer.unit)}</span>` : ''}<button class="btn primary" data-check>Check</button></div><div data-verdict style="margin-top:10px"></div></div>` : ''}
      <div class="card"><h3>Write up your solution${total ? ` <span class="muted" style="font-weight:500">(marked out of ${total})</span>` : ''}</h3>
        <p class="muted" style="font-size:14px;margin-top:-4px">Explain your reasoning as you would to an interviewer. The AI marks it against the mark scheme and tells you where you lost marks.</p>
        <textarea data-work rows="7" placeholder="Your working and reasoning…"></textarea>
        <div class="row" style="margin-top:8px"><label class="btn sm">📷 Add photo of working<input type="file" accept="image/*" multiple hidden data-photo></label><div class="thumbs" data-thumbs></div><span class="spacer"></span>
          <button class="btn sm" data-toggle-board>✎ Scratchpad</button><button class="btn primary" data-mark>Mark with AI</button></div>
        <div data-board style="height:380px;border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-top:10px;display:none"></div>
        <div class="mark-out hidden" style="margin-top:12px"><div class="rich" data-mark-out></div></div>
      </div>
      <div class="card"><div class="row between"><h3 style="margin:0">Solution & mark scheme</h3><button class="btn sm" data-sol>Show solution</button></div><div data-solbox class="hidden" style="margin-top:12px">
        <div class="rich">${U.md(ch.solution)}</div>
        ${ch.markScheme ? `<h3 style="margin-top:16px">Mark scheme</h3><table class="tbl"><tbody>${ch.markScheme.map((m) => `<tr><td class="num" style="width:60px"><b>${m.marks}</b></td><td class="rich">${U.mdInline(m.criterion)}</td></tr>`).join('')}</tbody></table>` : ''}</div></div>
    </div>`;

    const hintsEl = U.$('[data-hints]', el);
    const drawHints = () => {
      hintsEl.innerHTML = ch.hints.slice(0, shown).map((h, i) => `<div class="notice"><b>Hint ${i + 1}.</b> <span class="rich">${U.mdInline(h)}</span></div>`).join('') || '<p class="muted" style="margin:0">Try it first – hints are revealed one at a time.</p>';
      const left = ch.hints.length - shown;
      U.$('[data-hint]', el).disabled = !left;
      U.$('[data-hint-left]', el).textContent = left ? `${left} left` : 'no more hints';
    };
    drawHints();
    U.$('[data-hint]', el).onclick = () => { shown = Math.min(ch.hints.length, shown + 1); Store.patchChallenge(id, (p) => { p.hints = Math.max(p.hints || 0, shown); }); drawHints(); };

    const check = U.$('[data-check]', el);
    if (check) {
      const inp = U.$('[data-ans]', el);
      const go = () => {
        if (!inp.value.trim()) return;
        const r = checkAnswer(ch, inp.value);
        Store.patchChallenge(id, (p) => { p.tries++; if (r && r.ok) p.solved = true; });
        U.$('[data-verdict]', el).innerHTML = r ? `<div class="notice ${r.ok ? 'good' : 'bad'}">${r.ok ? '✓ ' : '✗ '}${U.esc(r.msg)}</div>` : '';
      };
      check.onclick = go;
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    }

    U.$('[data-sol]', el).onclick = async (e) => {
      const box = U.$('[data-solbox]', el);
      if (box.classList.contains('hidden') && !prog.solved && !(await U.confirm('Show the solution?', 'Have you tried all the hints? Seeing the solution is fine – just make sure you attempt it first.', 'Show it'))) return;
      box.classList.toggle('hidden');
      e.target.textContent = box.classList.contains('hidden') ? 'Show solution' : 'Hide solution';
    };

    const imgs = [];
    U.$('[data-photo]', el).onchange = async (e) => {
      for (const f of e.target.files) imgs.push(await U.shrinkImage(await U.readFile(f, 'dataurl')));
      U.$('[data-thumbs]', el).innerHTML = imgs.map((s) => `<div class="t"><img src="${s}"></div>`).join('');
    };
    let board = null;
    U.$('[data-toggle-board]', el).onclick = () => {
      const host = U.$('[data-board]', el);
      host.style.display = host.style.display === 'none' ? 'block' : 'none';
      if (!board && host.style.display === 'block') board = Whiteboard.create(host);
    };
    const markBtn = U.$('[data-mark]', el);
    markBtn.onclick = async () => {
      if (!AI.isConfigured()) return C.needAI();
      const text = U.$('[data-work]', el).value.trim();
      const pics = imgs.slice();
      const b = board && board.toDataURL(); if (b) pics.push(b);
      if (!text && !pics.length) return U.toast('Write or draw your solution first');
      const box = U.$('.mark-out', el), out = U.$('[data-mark-out]', el);
      box.classList.remove('hidden'); out.innerHTML = '<p class="muted typing">Marking</p>';
      markBtn.disabled = true;
      try {
        const full = await AI.chat({
          system: AI.prompts.markChallenge(ch), effort: 'high',
          messages: [{ role: 'user', content: [{ type: 'text', text: 'My solution:\n' + (text || '(see images)') }].concat(pics.map((d) => ({ type: 'image', dataUrl: d }))) }],
          onToken: (t, s) => { out.innerHTML = U.md(AI.clean(s)); },
        });
        out.innerHTML = U.md(AI.clean(full));
        const sc = AI.parseScore(full);
        if (sc) Store.patchChallenge(id, (p) => { p.bestMark = Math.max(p.bestMark || 0, sc.got); if (sc.got >= sc.of) p.solved = true; });
      } catch (e) { out.innerHTML = U.md('**Error:** ' + e.message); }
      markBtn.disabled = false;
    };
    return () => { if (board) board.destroy(); };
  }

  (window.Views = window.Views || {}).challenges = V;
})();
