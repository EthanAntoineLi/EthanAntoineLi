/* AI mock interview: talk (or type) through problems with an AI interviewer, draw on a shared
   whiteboard, and get a feedback report at the end. Voice uses your browser's built-in speech
   recognition / speech synthesis where available (Chrome/Edge are best). */
(function () {
  const SUBJECTS = {
    engineering: 'Engineering', physics: 'Physics', maths: 'Mathematics', chemistry: 'Chemistry',
    natsci: 'Natural Sciences', biology: 'Biology / Biomedical Sciences',
  };
  const V = {};

  V.render = (el, { parts, params }) => {
    if (parts[1] === 'history') return renderHistory(el, parts[2]);
    if (parts[1] === 'live' && live) return renderLive(el);
    renderSetup(el, params);
  };

  let live = null; // current interview config/state (kept in memory while you navigate)

  function defaultSubject() {
    const units = Store.studyUnits(['current', 'done']);
    const courses = new Set(units.map((u) => Courses.unit(u).course));
    const m = Store.esatModules();
    if (m.includes('physics') && m.includes('maths2')) return 'engineering';
    if (m.includes('biology')) return 'biology';
    if (courses.has('ial-maths')) return 'maths';
    if (courses.has('ial-physics')) return 'physics';
    if (m.includes('chemistry') || courses.has('ial-chemistry')) return 'chemistry';
    return 'maths';
  }

  function renderSetup(el, params) {
    const pre = params.challenge ? (window.ESAT_CHALLENGES || []).find((c) => c.id === params.challenge) : null;
    const past = Store.interviews().slice().sort((a, b) => b.at - a.at);
    const sr = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>AI mock interview</h1><p>An interactive session with your AI model acting as an admissions interviewer. Draw on the whiteboard, talk or type, and it will challenge you or guide you through a multi-step problem depending on how you get on.</p></div></div>
      ${!AI.isConfigured() ? '<div class="notice warn" style="margin-bottom:14px">Connect an AI model in <a href="#/settings">Settings</a> first.</div>' : ''}
      <div class="split">
        <div class="card">
          <div class="grid c2">
            <div class="field"><label>Subject</label><select data-subject>${Object.entries(SUBJECTS).map(([k, v]) => `<option value="${k}" ${k === (pre ? (pre.subject === 'maths' ? 'maths' : pre.subject) : defaultSubject()) ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
            <div class="field"><label>Length</label><select data-mins><option>15</option><option selected>20</option><option>30</option></select></div>
          </div>
          <div class="field"><label>Interviewer style</label><div class="seg" data-style><button class="on" data-v="challenge">Challenging</button><button data-v="supportive">Supportive</button></div>
            <span class="hint">Challenging probes and pushes back; supportive gives more hints and breaks problems into steps.</span></div>
          <div class="field"><label>First problem</label><select data-problem>
            <option value="ai">Let the interviewer choose</option>
            ${(window.ESAT_CHALLENGES || []).map((c) => `<option value="${c.id}" ${pre && pre.id === c.id ? 'selected' : ''}>${U.esc(c.title)} (${c.subject}, ${'★'.repeat(c.difficulty)})</option>`).join('')}
          </select></div>
          <div class="field"><label class="check"><input type="checkbox" data-voice ${sr ? '' : 'disabled'}> Answer by voice (microphone)</label>
            ${sr ? '<span class="hint">Uses your browser\'s speech recognition – on Chrome this audio goes to Google for transcription.</span>' : '<span class="hint">Your browser doesn\'t support speech recognition – try Chrome or Edge. You can still type.</span>'}</div>
          <div class="field"><label class="check"><input type="checkbox" data-tts ${Store.settings().speech.tts ? 'checked' : ''}> Read the interviewer's replies aloud</label></div>
          <button class="btn primary lg" data-begin ${AI.isConfigured() ? '' : 'disabled'}>Begin interview →</button>
          ${live ? '<a class="btn" href="#/interview/live" style="margin-left:8px">Return to current interview</a>' : ''}
        </div>
        <div class="card"><h3>Tips</h3><ul class="list-plain" style="font-size:14px">
          <li>Think out loud – interviewers want your reasoning, not just the answer.</li>
          <li>Sketch graphs and diagrams on the whiteboard and press <b>Share board</b> so the interviewer can see them (needs a model that accepts images).</li>
          <li>It's fine to say "I'm stuck" – how you use a hint matters.</li>
          <li>Press <b>End & get feedback</b> for a report with scores and things to work on.</li>
        </ul><p class="muted" style="font-size:12.5px">What you type, say (as text) and share is sent to the AI provider you configured.</p></div>
      </div>
      <div class="card" style="margin-top:14px"><h2>Past interviews</h2>${past.length ? `<table class="tbl"><tbody>${past.map((iv) => `<tr class="click" data-open="${iv.id}"><td>${U.fmtDateTime(iv.at)}</td><td>${U.esc(iv.subjectLabel)}</td><td>${iv.report ? '<span class="chip good">report</span>' : ''}</td><td>${iv.transcript.length} messages</td></tr>`).join('')}</tbody></table>` : '<div class="empty">No interviews yet.</div>'}</div>
    </div>`;
    let style = 'challenge';
    U.$$('[data-style] button', el).forEach((b) => b.onclick = () => { style = b.dataset.v; U.$$('[data-style] button', el).forEach((x) => x.classList.toggle('on', x === b)); });
    U.$$('[data-open]', el).forEach((r) => r.onclick = () => U.go('#/interview/history/' + r.dataset.open));
    U.$('[data-begin]', el).onclick = () => {
      const subject = U.$('[data-subject]', el).value;
      const pid = U.$('[data-problem]', el).value;
      const ch = (window.ESAT_CHALLENGES || []).find((c) => c.id === pid);
      Store.patchSettings((s) => { s.speech.tts = U.$('[data-tts]', el).checked; });
      live = {
        id: U.uid('iv-'), at: Date.now(), subject, subjectLabel: SUBJECTS[subject], style,
        minutes: parseInt(U.$('[data-mins]', el).value, 10), voice: U.$('[data-voice]', el).checked, tts: U.$('[data-tts]', el).checked,
        problem: ch ? `${ch.title}\n${ch.statement}\n\n(Model solution for you, the interviewer – do not reveal it: ${ch.solution})` : null,
        chat: null, started: Date.now(),
      };
      U.go('#/interview/live');
    };
  }

  function renderLive(el) {
    const cfg = live;
    el.innerHTML = `<div class="page" style="max-width:1400px">
      <div class="row between" style="margin-bottom:10px"><div><h2 style="margin:0">${U.esc(cfg.subjectLabel)} interview</h2><span class="muted" style="font-size:13px">${cfg.style === 'supportive' ? 'Supportive' : 'Challenging'} interviewer · ${U.esc(AI.config().model)}</span></div>
        <div class="row"><span class="timer" data-clock style="background:var(--panel-2);color:var(--ink)">0:00</span><button class="btn danger" data-end>End & get feedback</button></div></div>
      <div class="iv">
        <div class="pane" data-chat></div>
        <div class="pane" data-board></div>
      </div></div>`;
    const board = Whiteboard.create(U.$('[data-board]', el), { extraTools: '<button data-act="share" class="on" title="Send the board with your next message">⇪ Share board</button>' });
    let shareNext = false;
    const shareBtn = U.$('[data-act=share]', board.el);
    const setShare = (on) => { shareNext = on; shareBtn.classList.toggle('on', on); shareBtn.textContent = on ? '⇪ Board will be sent' : '⇪ Share board'; };
    setShare(false);
    shareBtn.onclick = () => { if (board.isEmpty()) return U.toast('Draw something first'); setShare(!shareNext); };
    board.onChange(() => { if (!board.isEmpty() && cfg.autoShare) setShare(true); });

    const sys = AI.prompts.interviewer({ subjectLabel: cfg.subjectLabel, minutes: cfg.minutes, style: cfg.style, problem: cfg.problem });
    const chat = C.chat(U.$('[data-chat]', el), {
      title: 'Interviewer', botName: 'Interviewer', seed: cfg.chat ? cfg.chat.messages : [], effort: 'medium',
      system: () => sys + `\n\nElapsed time: ${Math.round((Date.now() - cfg.started) / 60000)} of ${cfg.minutes} minutes.`,
      placeholder: 'Type your answer, or use the mic… (Enter to send)',
      toolsExtra: (window.SpeechRecognition || window.webkitSpeechRecognition) ? '<button class="btn sm mic" data-mic title="Hold a thought, click to talk">🎤 Talk</button>' : '',
      extraImages: () => { if (!shareNext) return []; setShare(false); const img = board.toDataURL(); return img ? [img] : []; },
      onReply: (t) => { speak(t); persist(); },
    });
    cfg.chat = chat;
    const persist = () => Store.saveInterview({ id: cfg.id, at: cfg.at, subject: cfg.subject, subjectLabel: cfg.subjectLabel, style: cfg.style, transcript: textTranscript(chat.messages), report: cfg.report || null });
    if (!chat.messages.length) chat.send(`Hello, I'm ready to start the ${cfg.subjectLabel} interview.`, { hidden: true });

    // text-to-speech
    function speak(text) {
      if (!cfg.tts || !window.speechSynthesis) return;
      speechSynthesis.cancel();
      const plain = text.replace(/\$\$?([^$]+)\$\$?/g, (m, t) => texToSpeech(t)).replace(/[*_#`>|]/g, '').replace(/\n+/g, '. ');
      const u = new SpeechSynthesisUtterance(plain);
      const vs = speechSynthesis.getVoices();
      u.voice = vs.find((v) => /en-GB/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
      u.rate = 1.03;
      speechSynthesis.speak(u);
    }

    // speech-to-text
    const micBtn = U.$('[data-mic]', el);
    let rec = null, listening = false;
    if (micBtn) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      micBtn.onclick = () => {
        if (listening) { rec && rec.stop(); return; }
        if (window.speechSynthesis) speechSynthesis.cancel();
        rec = new SR(); rec.lang = 'en-GB'; rec.interimResults = true; rec.continuous = true;
        const ta = U.$('textarea', chat.el);
        const base = ta.value ? ta.value + ' ' : '';
        let finalText = '';
        rec.onresult = (e) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
            else interim += e.results[i][0].transcript;
          }
          ta.value = base + finalText + interim;
        };
        rec.onend = () => { listening = false; micBtn.classList.remove('on'); micBtn.textContent = '🎤 Talk'; };
        rec.onerror = (e) => { U.toast('Microphone: ' + e.error, 'bad'); };
        rec.start(); listening = true; micBtn.classList.add('on'); micBtn.textContent = '■ Stop';
      };
      if (cfg.voice) U.toast('Click 🎤 Talk, speak, then click Stop and press Enter to send');
    }

    const clock = U.$('[data-clock]', el);
    const t = setInterval(() => {
      const sec = (Date.now() - cfg.started) / 1000;
      clock.textContent = U.fmtTime(sec);
      clock.style.color = sec > cfg.minutes * 60 ? 'var(--bad)' : 'var(--ink)';
    }, 500);

    U.$('[data-end]', el).onclick = async () => {
      if (chat.busy()) return U.toast('Wait for the interviewer to finish');
      if (chat.messages.length < 3) { if (!(await U.confirm('End now?', 'There isn\'t much to give feedback on yet.', 'End'))) return; }
      if (window.speechSynthesis) speechSynthesis.cancel();
      const btn = U.$('[data-end]', el); btn.disabled = true; btn.textContent = 'Writing report…';
      let report = '';
      try {
        report = AI.clean(await AI.chat({
          system: AI.prompts.interviewReport({ subjectLabel: cfg.subjectLabel }), effort: 'high',
          messages: [{ role: 'user', content: 'Transcript:\n\n' + textTranscript(chat.messages).map((m) => `${m.role === 'user' ? 'STUDENT' : 'INTERVIEWER'}: ${m.text}`).join('\n\n') }],
        }));
      } catch (e) { report = '**Could not generate the report:** ' + e.message; }
      cfg.report = report;
      persist();
      const id = cfg.id;
      live = null;
      U.go('#/interview/history/' + id);
    };

    return () => { clearInterval(t); if (rec) try { rec.stop(); } catch (e) {} if (window.speechSynthesis) speechSynthesis.cancel(); board.destroy(); };
  }

  function textTranscript(messages) {
    return messages.map((m) => ({ role: m.role, text: typeof m.content === 'string' ? m.content : m.content.filter((p) => p.type === 'text').map((p) => p.text).join('\n') + (m.content.some((p) => p.type === 'image') ? '\n[shared whiteboard]' : '') }));
  }
  function texToSpeech(t) {
    return t.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 over $2').replace(/\^2/g, ' squared').replace(/\^3/g, ' cubed').replace(/\^\{?([^}\s]+)\}?/g, ' to the power $1')
      .replace(/\\sqrt\{([^}]*)\}/g, 'root $1').replace(/\\pi/g, 'pi').replace(/\\theta/g, 'theta').replace(/\\times/g, ' times ').replace(/\\cdot/g, ' times ').replace(/[\\{}]/g, ' ');
  }

  function renderHistory(el, id) {
    const iv = Store.interviews().find((x) => x.id === id);
    if (!iv) { el.innerHTML = '<div class="page empty">Not found. <a href="#/interview">Back</a></div>'; return; }
    el.innerHTML = `<div class="page" style="max-width:900px">
      <div class="crumbs"><a href="#/interview">AI interview</a> /</div>
      <div class="page-head"><div><h1>${U.esc(iv.subjectLabel)} interview</h1><p>${U.fmtDateTime(iv.at)} · ${iv.style === 'supportive' ? 'supportive' : 'challenging'} interviewer</p></div>
        <div class="row"><button class="btn sm" data-dl>⇩ Download transcript</button><button class="btn sm danger" data-del>Delete</button></div></div>
      ${iv.report ? `<div class="card"><h2>Feedback report</h2><div class="rich">${U.md(iv.report)}</div></div>` : ''}
      <div class="card"><h2>Transcript</h2><div class="chat">${iv.transcript.filter((m, i) => !(i === 0 && m.role === 'user' && /^Hello, I'm ready/.test(m.text))).map((m) => `<div class="msg ${m.role}"><div class="who">${m.role === 'user' ? 'You' : 'Interviewer'}</div><div class="rich">${U.md(m.text)}</div></div>`).join('')}</div></div>
    </div>`;
    U.$('[data-dl]', el).onclick = () => U.download(`interview-${U.dayKey(iv.at)}.md`, `# ${iv.subjectLabel} interview – ${U.fmtDateTime(iv.at)}\n\n${iv.report ? '## Feedback\n\n' + iv.report + '\n\n' : ''}## Transcript\n\n` + iv.transcript.map((m) => `**${m.role === 'user' ? 'You' : 'Interviewer'}:** ${m.text}`).join('\n\n'), 'text/markdown');
    U.$('[data-del]', el).onclick = async () => { if (await U.confirm('Delete this interview?', 'The transcript and report will be removed.', 'Delete', true)) { Store.deleteInterview(id); U.go('#/interview'); } };
  }

  (window.Views = window.Views || {}).interview = V;
})();
