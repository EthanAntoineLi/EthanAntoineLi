/* The question player. Used for topic practice, the review queue and mock modules.
   Relaxed mode: timer counts up and can be paused, instant feedback with the worked solution.
   Exam conditions: countdown at real ESAT pace (40 min per 27 questions), no pausing,
   free navigation + flags, review screen, solutions at the end. */
(function () {
  const PACE = 2400 / 27; // ≈ 88.9 s per question

  const Session = {};

  // Build and start a session. cfg: {kind, title, subtitle, qids, mode, timeLimit, returnTo, mock}
  Session.start = (cfg) => {
    if (!cfg.qids || !cfg.qids.length) { U.toast('No questions match that – try another topic or make some with the AI question maker.', 'bad'); return; }
    const mode = cfg.mode || 'relaxed';
    const s = Object.assign({
      id: U.uid('s-'), kind: 'practice', mode,
      timeLimit: mode === 'exam' ? Math.round(cfg.qids.length * PACE) : null,
      i: 0, answers: {}, checked: {}, flags: {}, struck: {}, times: {}, elapsed: 0,
      startedAt: Date.now(), paused: false, finished: false, recorded: {}, returnTo: '#/bank',
    }, cfg);
    Store.setActive(s);
    // When started from a #/practice?… link, replace that history entry so Back doesn't start a new set.
    if (cfg.replaceHistory) { delete s.replaceHistory; Store.setActive(s); location.replace('#/practice/run'); }
    else U.go('#/practice/run');
  };

  // Turn #/practice?module=…&spec=…&n=…&mode=… into a session.
  function fromParams(p) {
    const filter = {};
    ['module', 'section', 'spec', 'only', 'source'].forEach((k) => { if (p[k]) filter[k] = p[k]; });
    if (p.specs) filter.specs = p.specs.split(',');
    if (p.modules) filter.modules = p.modules.split(',');
    const n = parseInt(p.n || '10', 10);
    const qids = p.ids ? p.ids.split(',').filter((id) => Bank.byId(id)) : Bank.pickPractice(filter, n);
    let title = 'Practice';
    if (p.spec) title = `${p.spec} · ${Bank.specTitle(p.spec)}`;
    else if (p.section) { const s = Bank.sectionOf(p.section + '.1'); title = s ? `${p.section} · ${s.title}` : p.section; }
    else if (p.module) title = U.moduleName(p.module);
    else if (p.title) title = p.title;
    const mode = p.mode || Store.settings().practice.mode;
    Session.start({ kind: 'practice', title, subtitle: mode === 'exam' ? 'Exam conditions' : 'Relaxed practice', qids, mode, replaceHistory: true, returnTo: p.back ? decodeURIComponent(p.back) : (p.module ? '#/bank/' + p.module : '#/bank') });
  }

  Session.render = (el, { parts, params }) => {
    if (parts[1] !== 'run') { fromParams(params); return; }
    const s = Store.active();
    if (!s) { el.innerHTML = `<div class="page"><div class="empty"><p>No session running.</p><a class="btn primary" href="#/bank">Choose a topic</a></div></div>`; return; }
    return run(el, s);
  };

  function run(el, s) {
    document.body.classList.add('exam-mode');
    const exam = s.mode === 'exam';
    const qs = s.qids.map((id) => Bank.byId(id)).filter(Boolean);
    if (qs.length !== s.qids.length) s.qids = qs.map((q) => q.id);
    if (!qs.length) {
      Store.clearActive();
      document.body.classList.remove('exam-mode');
      el.innerHTML = '<div class="page"><div class="empty"><p>The questions in this session are no longer in your bank.</p><a class="btn primary" href="#/bank">Choose a topic</a></div></div>';
      return;
    }
    s.i = U.clamp(s.i || 0, 0, qs.length - 1);
    let showingReview = false; // exam review screen
    let sideTab = null; // 'board' | 'tutor' | 'nav'
    let board = null, tutor = null, tutorFor = null;
    s.lastTick = Date.now();

    el.innerHTML = `<div class="session">
      <div class="ses-top">
        <div style="min-width:0" class="ses-title"><div class="title">${U.esc(s.title)}</div><div class="sub">${U.esc(s.subtitle || '')}</div></div>
        <span class="spacer"></span>
        <span class="sub" data-progress></span>
        <div class="timer" data-timer title="${exam ? 'Time remaining' : 'Time on this question'}">0:00</div>
        ${exam ? '' : '<button class="btn sm" data-pause title="Pause (P)">❚❚</button>'}
        <button class="btn sm" data-side="board" title="Scratchpad (S)">✎<span class="lbl"> Scratchpad</span></button>
        ${exam ? '<button class="btn sm" data-side="nav" title="Navigator (N)">▦<span class="lbl"> Navigator</span></button>' : '<button class="btn sm" data-side="tutor" title="AI tutor (T)">✦<span class="lbl"> AI tutor</span></button>'}
        <button class="btn sm" data-quit>${exam ? 'End' : 'Finish'}</button>
      </div>
      <div class="ses-body">
        <div class="ses-main" style="position:relative"><div class="q-wrap" data-main></div></div>
        <aside class="ses-side hidden" data-sidepanel></aside>
      </div>
      <div class="ses-bottom" data-bottom></div>
    </div>`;
    const main = U.$('[data-main]', el), bottom = U.$('[data-bottom]', el), side = U.$('[data-sidepanel]', el);
    side.innerHTML = '<div class="pane-host" data-pane="nav"></div><div class="pane-host" data-pane="board"></div><div class="pane-host" data-pane="tutor"></div>';
    const paneNav = U.$('[data-pane=nav]', side), paneBoard = U.$('[data-pane=board]', side), paneTutor = U.$('[data-pane=tutor]', side);
    const timerEl = U.$('[data-timer]', el), progEl = U.$('[data-progress]', el);

    const save = () => Store.setActive(s);
    const cur = () => qs[s.i];

    /* ---------------- rendering ---------------- */
    function renderQuestion() {
      showingReview = false;
      const q = cur();
      const revealed = !exam && s.checked[q.id];
      const choice = s.answers[q.id];
      main.innerHTML = `
        <div class="q-head">
          <span class="q-num">Question ${s.i + 1}</span><span class="muted">of ${qs.length}</span>
          <span class="spacer"></span>
          <button class="btn sm flag-btn ${s.flags[q.id] ? 'on' : ''}" data-flag title="Flag for review (F)">⚑ ${s.flags[q.id] ? 'Flagged' : 'Flag'}</button>
        </div>
        ${exam ? '' : `<div class="row" style="margin:-4px 0 14px">${C.metaChips(q)}</div>`}
        ${C.stemHTML(q)}
        ${C.optionsHTML(q, { choice, revealed, struck: s.struck[q.id] || [] })}
        <p class="muted" style="font-size:12.5px;margin-top:10px">Tip: press <span class="kbd">A</span>–<span class="kbd">${U.letter(q.options.length - 1)}</span> to choose, right-click an option to cross it out.</p>
        <div data-sol></div>`;
      if (revealed) renderSolution();
      renderBottom();
      renderProgress();
      if (sideTab === 'nav') renderNav();
      if (sideTab === 'tutor') openTutor(true);
      main.parentElement.scrollTop = 0; window.scrollTo(0, 0);
    }

    function renderSolution() {
      const q = cur();
      const choice = s.answers[q.id];
      const ok = choice === q.answer;
      U.$('[data-sol]', main).innerHTML = `<div class="solution">
        <div class="verdict ${ok ? 'good' : 'bad'}">${ok ? '✓ Correct' : choice == null ? '— Not answered' : '✗ Not quite'} <span class="muted" style="font-size:14px;font-weight:500">· answer ${U.letter(q.answer)} · ${U.fmtSecs(s.times[q.id] || 0)} (pace ≈ 89s)</span></div>
        <h3>Worked solution</h3>
        <div class="rich">${U.md(q.solution)}</div>
        <div class="row" style="margin-top:14px">
          <button class="btn sm" data-ai-explain>✦ Ask the AI tutor</button>
          <button class="btn sm" data-ai-mark>✓ Mark my working</button>
          <span class="spacer"></span>
          <button class="btn sm ghost" data-edit title="Fix a mistake in this question">✎ Edit question</button>
          <button class="btn sm ghost" data-hide title="Remove from your bank">Hide</button>
        </div></div>`;
    }

    function renderBottom() {
      const q = cur();
      if (exam) {
        bottom.innerHTML = `<button class="btn" data-prev ${s.i === 0 ? 'disabled' : ''}>← Previous</button>
          <span class="spacer"></span>
          <button class="btn" data-review-screen>Review screen</button>
          <button class="btn primary" data-next>${s.i === qs.length - 1 ? 'Finish →' : 'Next →'}</button>`;
      } else {
        const checked = s.checked[q.id];
        bottom.innerHTML = `<button class="btn" data-prev ${s.i === 0 ? 'disabled' : ''}>← Previous</button>
          <span class="spacer"></span>
          ${checked ? '' : '<button class="btn ghost" data-skip>Skip</button>'}
          ${checked ? `<button class="btn primary" data-next>${s.i === qs.length - 1 ? 'See results →' : 'Next →'}</button>`
            : `<button class="btn primary" data-check ${s.answers[q.id] == null ? 'disabled' : ''}>Check answer</button>`}`;
      }
    }

    function renderProgress() {
      const answered = qs.filter((q) => s.answers[q.id] != null).length;
      if (!exam) {
        const done = qs.filter((q) => s.checked[q.id]);
        const right = done.filter((q) => s.answers[q.id] === q.answer).length;
        progEl.textContent = `${done.length}/${qs.length} done · ${right} right`;
      } else progEl.textContent = `${answered}/${qs.length} answered`;
    }

    function renderReviewScreen() {
      showingReview = true;
      const unanswered = qs.filter((q) => s.answers[q.id] == null).length;
      const flagged = qs.filter((q) => s.flags[q.id]).length;
      main.innerHTML = `<h2>Review screen</h2>
        <p class="muted">Click a question to go back to it. ${unanswered ? `<b>${unanswered} unanswered</b> – there's no negative marking, so guess rather than leave blanks.` : 'All questions answered.'} ${flagged ? `${flagged} flagged.` : ''}</p>
        <div class="navgrid" style="max-width:640px">${qs.map((q, i) => `<button data-jump="${i}" class="${s.answers[q.id] != null ? 'ans' : ''} ${s.flags[q.id] ? 'flag' : ''}">${i + 1}</button>`).join('')}</div>
        <div class="legend" style="margin-top:12px"><span><i style="background:var(--primary-soft);border-color:var(--primary)"></i>answered</span><span><i></i>unanswered</span><span><i style="background:var(--flag);border-radius:50%"></i>flagged</span></div>`;
      bottom.innerHTML = `<button class="btn" data-jump="${qs.length - 1}">← Back to questions</button><span class="spacer"></span>
        ${flagged ? '<button class="btn" data-review-flagged>Review flagged</button>' : ''}
        ${unanswered ? '<button class="btn" data-review-unanswered>Go to first unanswered</button>' : ''}
        <button class="btn primary" data-end>End ${s.kind === 'mock' ? 'module' : 'test'}</button>`;
    }

    function renderNav() {
      paneNav.innerHTML = `<div class="drawer-head"><h3>Navigator</h3><button class="btn ghost sm" data-side-close>✕</button></div>
        <div class="drawer-body"><div class="navgrid">${qs.map((q, i) => {
          const cls = [];
          if (i === s.i && !showingReview) cls.push('cur');
          if (!exam && s.checked[q.id]) cls.push(s.answers[q.id] === q.answer ? 'right' : 'wrong');
          else if (s.answers[q.id] != null) cls.push('ans');
          if (s.flags[q.id]) cls.push('flag');
          return `<button data-jump="${i}" class="${cls.join(' ')}">${i + 1}</button>`;
        }).join('')}</div>
        <p class="muted" style="font-size:13px;margin-top:14px">Keys: <span class="kbd">←</span>/<span class="kbd">→</span> move · <span class="kbd">F</span> flag · <span class="kbd">S</span> scratchpad</p></div>`;
    }

    function openSide(tab, toggle = true) {
      if (sideTab === tab && toggle) { closeSide(); return; }
      sideTab = tab;
      side.classList.remove('hidden');
      U.$$('[data-side]', el).forEach((b) => b.classList.toggle('on', b.dataset.side === tab));
      U.$$('[data-pane]', side).forEach((p) => p.classList.toggle('on', p.dataset.pane === tab));
      if (tab === 'nav') renderNav();
      if (tab === 'board' && !board) {
        paneBoard.innerHTML = '<div class="drawer-head"><h3>Scratchpad</h3><span class="muted" style="font-size:12px">your erasable booklet</span><button class="btn ghost sm" data-side-close>✕</button></div><div style="flex:1;min-height:0" data-wb></div>';
        board = Whiteboard.create(U.$('[data-wb]', paneBoard));
      }
      if (tab === 'tutor') openTutor(false);
    }
    function closeSide() {
      sideTab = null;
      side.classList.add('hidden');
      U.$$('[data-side]', el).forEach((b) => b.classList.remove('on'));
    }

    function openTutor(refresh) {
      const q = cur();
      const key = q.id + ':' + !!s.checked[q.id];
      if (refresh && tutorFor === key) return;
      const seed = tutor && tutorFor && tutorFor.split(':')[0] === q.id ? tutor.messages.slice() : [];
      paneTutor.innerHTML = '';
      tutorFor = key;
      let attachBoard = false;
      tutor = C.chat(paneTutor, {
        title: 'AI tutor', botName: 'Tutor', onClose: closeSide, seed,
        system: () => AI.prompts.tutor(q, { choice: s.answers[q.id], revealed: !!s.checked[q.id] }),
        intro: s.checked[q.id] ? 'Ask about this question – the tutor has the worked solution.' : 'You haven\'t checked your answer yet, so the tutor will give hints rather than the answer.',
        quick: s.checked[q.id] ? [
          { label: 'Explain the solution', text: 'Explain the worked solution step by step, simply.' },
          { label: 'Where did I go wrong?', text: s.answers[q.id] === q.answer ? 'I got it right – is there a faster way?' : `I chose ${U.letter(s.answers[q.id] ?? 0)}. What mistake probably led me there?` },
          { label: 'Faster method', text: 'Show me the quickest no-calculator method for this, the way you would do it in 90 seconds.' },
          { label: 'Similar question', text: 'Give me one similar question to try (with options), but don\'t give the answer until I reply.' },
        ] : [
          { label: 'Give me a hint', text: 'Give me a small hint to get started – do not give the answer.' },
          { label: 'What topic is this?', text: 'Which idea/technique is this testing? No answer please.' },
        ],
        extraImages: () => {
          if (!attachBoard) return [];
          attachBoard = false;
          const img = board && board.toDataURL();
          return img ? [img] : [];
        },
        toolsExtra: '<button class="btn sm" data-send-board title="Send your scratchpad drawing to the tutor">✎ Send scratchpad</button>',
      });
      U.$('[data-send-board]', paneTutor).onclick = () => {
        if (!board || board.isEmpty()) return U.toast('Your scratchpad is empty – draw your working first');
        attachBoard = true;
        tutor.send(U.$('textarea', paneTutor).value.trim() || 'Here is my working on the scratchpad – please check it.');
      };
    }

    /* ---------------- actions ---------------- */
    function choose(i) {
      const q = cur();
      if (showingReview || i < 0 || i >= q.options.length) return;
      if (!exam && s.checked[q.id]) return;
      s.answers[q.id] = i;
      const st = s.struck[q.id];
      if (st && st.includes(i)) s.struck[q.id] = st.filter((x) => x !== i);
      save();
      U.$$('.opt', main).forEach((b) => {
        const k = +b.dataset.opt;
        b.classList.toggle('sel', s.answers[q.id] === k);
        b.classList.toggle('struck', (s.struck[q.id] || []).includes(k));
      });
      renderBottom(); renderProgress();
      if (sideTab === 'nav') renderNav();
    }
    function strike(i) {
      const q = cur();
      if (!exam && s.checked[q.id]) return;
      const st = new Set(s.struck[q.id] || []);
      st.has(i) ? st.delete(i) : st.add(i);
      s.struck[q.id] = [...st];
      save();
      U.$$('.opt', main).forEach((b) => b.classList.toggle('struck', st.has(+b.dataset.opt)));
    }
    function check() {
      const q = cur();
      if (exam || s.checked[q.id] || s.answers[q.id] == null) return;
      s.checked[q.id] = true;
      record(q);
      save();
      renderQuestion();
      if (Store.settings().practice.autoAdvance && s.answers[q.id] === q.answer) setTimeout(() => { if (cur() === q) next(); }, 900);
    }
    function record(q) {
      if (s.recorded[q.id]) return;
      s.recorded[q.id] = true;
      const choice = s.answers[q.id];
      Store.addAttempt({ qid: q.id, module: q.module, spec: q.spec, correct: choice === q.answer, choice: choice ?? null, time: Math.round(s.times[q.id] || 0), mode: s.kind === 'mock' ? 'mock' : s.kind === 'review' ? 'review' : (exam ? 'exam' : 'practice') });
    }
    function go(i) {
      if (i < 0 || i >= qs.length) return;
      s.i = i; save(); renderQuestion();
    }
    function next() {
      if (showingReview) return;
      if (s.i < qs.length - 1) go(s.i + 1);
      else if (exam) renderReviewScreen();
      else finish();
    }
    function skip() {
      // move the question to the end of the queue (relaxed mode)
      const q = cur();
      if (s.i === qs.length - 1) { finish(); return; }
      qs.splice(s.i, 1); qs.push(q); s.qids = qs.map((x) => x.id); save(); renderQuestion();
    }
    function toggleFlag() {
      const q = cur();
      if (showingReview) return;
      s.flags[q.id] ? delete s.flags[q.id] : (s.flags[q.id] = true);
      save();
      const b = U.$('[data-flag]', main);
      b.classList.toggle('on', !!s.flags[q.id]);
      b.textContent = '⚑ ' + (s.flags[q.id] ? 'Flagged' : 'Flag');
      if (sideTab === 'nav') renderNav();
    }

    let pausedCover = null;
    function setPaused(p) {
      if (exam) return;
      s.paused = p; save();
      if (p) {
        pausedCover = U.html('<div class="pause-cover"><div style="text-align:center"><h2>Paused</h2><p class="muted">The question is hidden while paused.</p><button class="btn primary lg" data-resume>Resume</button></div></div>');
        main.parentElement.appendChild(pausedCover);
        U.$('[data-resume]', pausedCover).onclick = () => setPaused(false);
      } else if (pausedCover) { pausedCover.remove(); pausedCover = null; }
      const pb = U.$('[data-pause]', el); if (pb) pb.textContent = p ? '▶' : '❚❚';
    }

    async function finish(timeUp) {
      if (s.finished) return;
      if (exam && !timeUp) {
        const unanswered = qs.filter((q) => s.answers[q.id] == null).length;
        const ok = await U.confirm(`End ${s.kind === 'mock' ? 'this module' : 'the test'}?`, unanswered ? `${unanswered} question(s) unanswered. You can't come back once it has ended.` : 'You can\'t come back once it has ended.', 'End now');
        if (!ok) return;
      }
      s.finished = true;
      clearInterval(ticker);
      // record everything not yet recorded (exam answers are recorded at the end, like a real paper)
      if (exam) qs.forEach(record);
      else qs.filter((q) => s.checked[q.id]).forEach(record);
      if (s.kind === 'mock') { Views.mock.moduleDone(s); return; }
      Store.clearActive();
      showResults();
    }

    function showResults() {
      document.body.classList.remove('exam-mode');
      App.guard = null;
      const done = exam ? qs : qs.filter((q) => s.checked[q.id]);
      const right = done.filter((q) => s.answers[q.id] === q.answer).length;
      const totalTime = done.reduce((t, q) => t + (s.times[q.id] || 0), 0);
      el.innerHTML = `<div class="page" style="padding:28px 34px">
        <div class="page-head"><div><div class="crumbs"><a href="${s.returnTo}">← Back</a></div><h1>${U.esc(s.title)} – results</h1><p>${U.esc(s.subtitle || '')}</p></div>
          <div class="row"><a class="btn" href="${s.returnTo}">Done</a>${Store.dueReview().length ? `<a class="btn primary" href="#/review">Review queue (${Store.dueReview().length})</a>` : ''}</div></div>
        <div class="grid c4">
          <div class="card stat"><span class="l">Score</span><span class="v">${right}/${done.length}</span></div>
          <div class="card stat"><span class="l">Accuracy</span><span class="v">${done.length ? U.pct(right / done.length) : '–'}</span></div>
          <div class="card stat"><span class="l">Avg time</span><span class="v">${done.length ? U.fmtSecs(totalTime / done.length) : '–'}</span></div>
          <div class="card stat"><span class="l">Pace target</span><span class="v">89s</span></div>
        </div>
        <div class="card" style="margin-top:14px">${resultsTable(done, s)}</div></div>`;
      bindResultRows(el, done, s);
    }

    /* ---------------- timer ---------------- */
    function tick() {
      const now = Date.now();
      const dt = Math.min(5, (now - s.lastTick) / 1000);
      s.lastTick = now;
      if (s.paused || s.finished) return draw();
      if (!exam && document.hidden) return draw();
      s.elapsed += dt;
      const q = cur();
      if (!showingReview && q && !(!exam && s.checked[q.id])) s.times[q.id] = (s.times[q.id] || 0) + dt;
      draw();
      if (exam && s.timeLimit && s.elapsed >= s.timeLimit) { U.toast('Time is up', 'bad'); finish(true); }
    }
    let lastSave = 0;
    function draw() {
      if (exam && !s.timeLimit) {
        timerEl.textContent = U.fmtTime(s.elapsed); // untimed mock: count up
      } else if (exam) {
        const left = Math.max(0, s.timeLimit - s.elapsed);
        timerEl.textContent = U.fmtTime(left);
        timerEl.classList.toggle('low', left <= Math.min(300, s.timeLimit * 0.15));
        // pace check: are you behind the 89 s/question line?
        const expected = qs.filter((q) => s.answers[q.id] != null).length * PACE;
        timerEl.classList.toggle('pace-bad', s.elapsed > expected + PACE * 2);
        timerEl.title = `Time remaining · pace target ${U.fmtTime(PACE * qs.length - s.elapsed)}`;
      } else {
        const q = cur();
        timerEl.textContent = U.fmtTime(q ? s.times[q.id] || 0 : 0);
        timerEl.classList.toggle('pace-bad', q && (s.times[q.id] || 0) > PACE && !s.checked[q.id]);
      }
      if (!s.finished && Date.now() - lastSave > 3000) { lastSave = Date.now(); save(); }
    }
    const ticker = setInterval(tick, 250);

    /* ---------------- events ---------------- */
    // Listen on the session's own root (not the persistent #view), so handlers die with the view.
    const root = U.$('.session', el);
    root.addEventListener('click', (e) => {
      const t = e.target.closest('button, a');
      if (!t || !root.contains(t)) return;
      if (t.dataset.opt != null && !t.disabled) { if (e.ctrlKey || e.metaKey) strike(+t.dataset.opt); else choose(+t.dataset.opt); }
      else if (t.hasAttribute('data-flag')) toggleFlag();
      else if (t.hasAttribute('data-next')) next();
      else if (t.hasAttribute('data-prev')) go(s.i - 1);
      else if (t.hasAttribute('data-check')) check();
      else if (t.hasAttribute('data-skip')) skip();
      else if (t.dataset.jump != null) { go(+t.dataset.jump); }
      else if (t.hasAttribute('data-review-screen')) renderReviewScreen();
      else if (t.hasAttribute('data-review-flagged')) { const i = qs.findIndex((q) => s.flags[q.id]); if (i >= 0) go(i); }
      else if (t.hasAttribute('data-review-unanswered')) { const i = qs.findIndex((q) => s.answers[q.id] == null); if (i >= 0) go(i); }
      else if (t.hasAttribute('data-end')) finish();
      else if (t.hasAttribute('data-quit')) { if (exam) { if (!showingReview) renderReviewScreen(); else finish(); } else finish(); }
      else if (t.hasAttribute('data-pause')) setPaused(!s.paused);
      else if (t.dataset.side) openSide(t.dataset.side);
      else if (t.hasAttribute('data-side-close')) closeSide();
      else if (t.hasAttribute('data-ai-explain')) { if (sideTab !== 'tutor') openSide('tutor'); }
      else if (t.hasAttribute('data-ai-mark')) C.markWorking(cur(), s.answers[cur().id], { boardImage: board && board.toDataURL() });
      else if (t.hasAttribute('data-edit')) editCurrent();
      else if (t.hasAttribute('data-hide')) hideCurrent();
    });
    root.addEventListener('contextmenu', (e) => {
      const t = e.target.closest('[data-opt]');
      if (t && !t.disabled) { e.preventDefault(); strike(+t.dataset.opt); }
    });

    function editCurrent() {
      const q = cur();
      C.editQuestion(q, (v) => {
        if (q.source === 'builtin') Store.saveEdit(q.id, v); else Store.updateCustom(Object.assign({}, Store.custom().find((x) => x.id === q.id), v));
        qs[s.i] = Bank.byId(q.id);
        U.toast('Question updated', 'good');
        renderQuestion();
      });
    }
    async function hideCurrent() {
      const q = cur();
      if (!(await U.confirm('Hide this question?', 'It will stop appearing in practice and mocks. You can unhide it from the question bank.', 'Hide'))) return;
      Store.setHidden(q.id, true);
      Store.removeFromReview(q.id);
      U.toast('Hidden');
      next();
    }

    const onKey = (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable) return;
      if (U.$('.modal-back')) return;
      const k = e.key;
      const q = cur();
      if (/^[a-hA-H]$/.test(k) && !showingReview && q) {
        const i = U.letterIndex(k);
        if (i < q.options.length) { e.preventDefault(); if (e.shiftKey) strike(i); else choose(i); }
        return;
      }
      if (k === 'Enter') { e.preventDefault(); if (!exam && !s.checked[q.id]) check(); else next(); }
      else if (k === 'ArrowRight') next();
      else if (k === 'ArrowLeft') go(s.i - 1);
      else if (k === 'f' || k === 'F') toggleFlag();
      // letters A–H are answers, so the panels use other keys
      else if (k === 's' || k === 'S') openSide('board');
      else if ((k === 'n' || k === 'N') && exam) openSide('nav');
      else if ((k === 't' || k === 'T') && !exam) openSide('tutor');
      else if ((k === 'p' || k === 'P') && !exam) setPaused(!s.paused);
    };
    document.addEventListener('keydown', onKey);

    App.guard = async () => {
      if (s.finished) return true;
      if (s.kind === 'mock' || exam) return U.confirm('Leave this test?', 'Your progress is saved – you can resume it from the dashboard. The clock stops while you are away.', 'Leave');
      return true;
    };

    if (s.paused) setPaused(true);
    renderQuestion();
    draw();
    return () => { clearInterval(ticker); document.removeEventListener('keydown', onKey); if (!s.finished) save(); if (board) board.destroy(); };
  }

  /* ---------------- shared results table (also used by mocks) ---------------- */
  function resultsTable(qsList, s) {
    return `<table class="tbl"><thead><tr><th>#</th><th>Topic</th><th>You</th><th>Answer</th><th class="num">Time</th><th></th></tr></thead><tbody>
      ${qsList.map((q, i) => {
        const a = s.answers[q.id];
        const ok = a === q.answer;
        return `<tr class="click" data-row="${i}"><td>${i + 1}</td><td><b>${U.esc(q.spec)}</b> <span class="muted">${U.esc(Bank.specTitle(q.spec))}</span></td>
          <td>${a == null ? '<span class="chip">—</span>' : `<span class="chip ${ok ? 'good' : 'bad'}">${U.letter(a)} ${ok ? '✓' : '✗'}</span>`}</td>
          <td>${U.letter(q.answer)}</td><td class="num ${(s.times[q.id] || 0) > PACE * 1.5 ? 'muted' : ''}">${U.fmtSecs(s.times[q.id] || 0)}</td><td><a href="javascript:void 0">Solution →</a></td></tr>`;
      }).join('')}</tbody></table>`;
  }
  function bindResultRows(root, qsList, s) {
    U.$$('[data-row]', root).forEach((tr) => tr.onclick = () => Session.showSolution(qsList[+tr.dataset.row], s.answers[qsList[+tr.dataset.row].id], s.times[qsList[+tr.dataset.row].id]));
  }
  Session.resultsTable = resultsTable;
  Session.bindResultRows = bindResultRows;

  // Modal with a question, your answer and the worked solution, plus AI help.
  Session.showSolution = (q, choice, time) => {
    const body = U.html(`<div>
      <div class="row" style="margin-bottom:12px">${C.metaChips(q)}${time != null ? `<span class="chip">${U.fmtSecs(time)}</span>` : ''}</div>
      ${C.stemHTML(q)}${C.optionsHTML(q, { choice, revealed: true })}
      <div class="solution"><h3>Worked solution</h3><div class="rich">${U.md(q.solution)}</div></div>
      <div data-chat-host style="height:420px;display:none;border:1px solid var(--line);border-radius:10px;margin-top:14px;overflow:hidden"></div>
    </div>`);
    let chat = null;
    U.modal({
      title: `${q.spec} · ${Bank.specTitle(q.spec)}`, body, wide: true,
      buttons: [
        { label: '✦ Ask AI tutor', onClick: () => {
          if (!AI.isConfigured()) { C.needAI(); return false; }
          const host = U.$('[data-chat-host]', body);
          host.style.display = 'block';
          if (!chat) chat = C.chat(host, { title: 'AI tutor', botName: 'Tutor', system: () => AI.prompts.tutor(q, { choice, revealed: true }),
            quick: [{ label: 'Explain the solution', text: 'Explain the worked solution step by step, simply.' },
              { label: 'Where did I go wrong?', text: choice === q.answer ? 'I got it right – is there a faster way?' : `I chose ${choice == null ? 'nothing' : U.letter(choice)}. What mistake probably led me there?` },
              { label: 'Faster method', text: 'Show me the quickest no-calculator method for this.' }] });
          host.scrollIntoView({ behavior: 'smooth' });
          return false;
        } },
        { label: '✓ Mark my working', onClick: () => { C.markWorking(q, choice); return false; } },
        { label: 'Close', kind: 'primary' },
      ],
    });
  };

  Session.PACE = PACE;
  (window.Views = window.Views || {}).session = Session;
})();
