/* Bring-your-own-key AI client.
   Three wire formats cover almost every provider:
     - "openai"    : OpenAI-style /chat/completions (OpenAI, OpenRouter, Groq, DeepSeek, Mistral, xAI,
                     Together, Ollama, LM Studio, Gemini's OpenAI endpoint, anything "OpenAI compatible")
     - "anthropic" : Anthropic Messages API (Claude)
     - "gemini"    : Google Gemini generateContent
   Calls go straight from this page to the provider with your key (nothing in between),
   unless you switch on "route through local server" when running serve.py. */
(function () {
  const PROVIDERS = {
    openai:     { label: 'OpenAI', format: 'openai', base: 'https://api.openai.com/v1', keyUrl: 'https://platform.openai.com/api-keys', models: [] },
    anthropic:  { label: 'Anthropic (Claude)', format: 'anthropic', base: 'https://api.anthropic.com', keyUrl: 'https://console.anthropic.com/settings/keys', models: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-fable-5-1'] },
    gemini:     { label: 'Google Gemini', format: 'gemini', base: 'https://generativelanguage.googleapis.com', keyUrl: 'https://aistudio.google.com/apikey', models: [] },
    openrouter: { label: 'OpenRouter (any model)', format: 'openai', base: 'https://openrouter.ai/api/v1', keyUrl: 'https://openrouter.ai/keys', models: [] },
    groq:       { label: 'Groq', format: 'openai', base: 'https://api.groq.com/openai/v1', keyUrl: 'https://console.groq.com/keys', models: [] },
    deepseek:   { label: 'DeepSeek', format: 'openai', base: 'https://api.deepseek.com/v1', keyUrl: 'https://platform.deepseek.com/api_keys', models: [] },
    mistral:    { label: 'Mistral', format: 'openai', base: 'https://api.mistral.ai/v1', keyUrl: 'https://console.mistral.ai/api-keys', models: [] },
    xai:        { label: 'xAI (Grok)', format: 'openai', base: 'https://api.x.ai/v1', keyUrl: 'https://console.x.ai', models: [] },
    ollama:     { label: 'Ollama (local, free)', format: 'openai', base: 'http://localhost:11434/v1', keyUrl: '', noKey: true, models: [] },
    lmstudio:   { label: 'LM Studio (local, free)', format: 'openai', base: 'http://localhost:1234/v1', keyUrl: '', noKey: true, models: [] },
    custom:     { label: 'Custom (OpenAI-compatible)', format: 'openai', base: '', keyUrl: '', models: [] },
  };

  const A = { PROVIDERS };

  A.config = () => {
    const c = Store.settings().ai;
    const p = PROVIDERS[c.provider] || PROVIDERS.custom;
    return Object.assign({}, c, { format: p.format, base: (c.baseUrl || p.base || '').replace(/\/+$/, ''), meta: p });
  };
  A.isConfigured = () => {
    const c = A.config();
    return !!(c.model && c.base && (c.apiKey || c.meta.noKey));
  };
  A.label = () => { const c = A.config(); return c.model ? `${c.meta.label} · ${c.model}` : 'not set up'; };

  let serverProxy = null; // detected once: are we being served by serve.py?
  A.detectProxy = async () => {
    if (serverProxy !== null) return serverProxy;
    if (location.protocol === 'file:') return (serverProxy = false);
    try {
      const r = await fetch('/api/health', { cache: 'no-store' });
      serverProxy = r.ok && (await r.json()).app === 'esat-practice';
    } catch (e) { serverProxy = false; }
    return serverProxy;
  };

  async function send(url, init) {
    const c = A.config();
    if (c.useProxy && (await A.detectProxy())) {
      const headers = Object.assign({}, init.headers, { 'X-Target-URL': url });
      return fetch('/proxy', Object.assign({}, init, { headers }));
    }
    return fetch(url, init);
  }

  async function errorFrom(res) {
    let text = '';
    try { text = await res.text(); } catch (e) {}
    let msg = text;
    try {
      const j = JSON.parse(text);
      msg = (j.error && (j.error.message || j.error)) || j.message || j.detail || text;
      if (Array.isArray(j) && j[0] && j[0].error) msg = j[0].error.message;
    } catch (e) {}
    if (typeof msg !== 'string') msg = JSON.stringify(msg);
    const hint = res.status === 401 || res.status === 403 ? ' (check your API key)' : res.status === 404 ? ' (check the model name / base URL)' : res.status === 429 ? ' (rate limit or out of credit)' : '';
    const err = new Error(`${res.status} ${msg.slice(0, 400)}${hint}`);
    err.status = res.status; err.body = text;
    return err;
  }

  // Read an SSE stream, calling onData(jsonObject) for every "data:" line.
  async function readSSE(res, onData) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).replace(/\r$/, '');
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        let obj; try { obj = JSON.parse(data); } catch (e) { continue; }
        onData(obj);
      }
    }
  }

  function splitDataUrl(u) {
    const m = /^data:([^;]+);base64,(.*)$/.exec(u);
    return m ? { mime: m[1], data: m[2] } : { mime: 'image/png', data: '' };
  }

  // messages: [{role:'user'|'assistant', content: string | [{type:'text',text}|{type:'image',dataUrl}]}]
  function partsOf(content) {
    return typeof content === 'string' ? [{ type: 'text', text: content }] : content;
  }
  function stripImages(messages) {
    return messages.map((m) => {
      const parts = partsOf(m.content);
      const imgs = parts.filter((p) => p.type === 'image').length;
      const txt = parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n');
      return { role: m.role, content: imgs ? txt + `\n\n[${imgs} image(s) attached, but image input is switched off for this model]` : txt };
    });
  }

  // Claude models that take output_config.effort and server-side fallbacks.
  const CLAUDE_EFFORT = /^claude-(opus-(4-[5-9]|5)|sonnet-(4-6|5)|fable|mythos|haiku-5)/;
  const CLAUDE_FALLBACK = /^claude-(opus-5|fable-5-1|sonnet-5-5|mythos-5-1)/;
  const noFallback = {}; // endpoints that rejected the fallback option this session

  /* chat({system, messages, onToken, signal, effort:'low'|'medium'|'high', maxTokens}) → full text */
  A.chat = async (opts) => {
    const c = A.config();
    if (!A.isConfigured()) throw new Error('AI is not set up yet – add a provider, model and API key in Settings.');
    let messages = opts.messages;
    if (!c.vision) messages = stripImages(messages);
    const onToken = opts.onToken || (() => {});
    let full = '';
    const emit = (t) => { if (t) { full += t; onToken(t, full); } };

    if (c.format === 'anthropic') {
      const body = {
        model: c.model,
        max_tokens: opts.maxTokens || 32000,
        stream: true,
        system: opts.system || undefined,
        messages: messages.map((m) => ({
          role: m.role,
          content: partsOf(m.content).map((p) => p.type === 'image'
            ? { type: 'image', source: { type: 'base64', media_type: splitDataUrl(p.dataUrl).mime, data: splitDataUrl(p.dataUrl).data } }
            : { type: 'text', text: p.text }),
        })),
      };
      if (CLAUDE_EFFORT.test(c.model) && opts.effort) body.output_config = { effort: opts.effort };
      const headers = {
        'content-type': 'application/json',
        'x-api-key': c.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      };
      // If a safety classifier declines, let the API retry on its recommended fallback model.
      const useFallback = CLAUDE_FALLBACK.test(c.model) && !noFallback[c.base + c.model];
      const attempt = async (withFallback) => {
        const h = Object.assign({}, headers);
        const b = Object.assign({}, body);
        if (withFallback) { h['anthropic-beta'] = 'server-side-fallback-2026-07-01'; b.fallbacks = 'default'; }
        return send(c.base + '/v1/messages', { method: 'POST', headers: h, body: JSON.stringify(b), signal: opts.signal });
      };
      let withFallback = useFallback;
      let res = await attempt(withFallback);
      // Older Claude models: retry without the newer options they don't know about.
      for (let i = 0; i < 3 && !res.ok && res.status === 400; i++) {
        const err = await errorFrom(res);
        if (withFallback && /fallback|beta/i.test(err.message)) { withFallback = false; noFallback[c.base + c.model] = true; }
        else if (/max_tokens/i.test(err.message) && body.max_tokens > 8192) body.max_tokens = 8192;
        else if (body.output_config && /effort|output_config/i.test(err.message)) delete body.output_config;
        else throw err;
        res = await attempt(withFallback);
      }
      if (!res.ok) throw await errorFrom(res);
      let stop = null, streamErr = null;
      await readSSE(res, (ev) => {
        if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') emit(ev.delta.text);
        else if (ev.type === 'message_delta' && ev.delta && ev.delta.stop_reason) stop = ev.delta.stop_reason;
        else if (ev.type === 'error') streamErr = ev.error && ev.error.message;
      });
      if (streamErr) throw new Error(streamErr);
      if (stop === 'refusal' && !full.trim()) throw new Error('The model declined this request.');
      if (stop === 'max_tokens') emit('\n\n_[reply cut off: hit the length limit]_');
      return full;
    }

    if (c.format === 'gemini') {
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: partsOf(m.content).map((p) => p.type === 'image'
          ? { inlineData: { mimeType: splitDataUrl(p.dataUrl).mime, data: splitDataUrl(p.dataUrl).data } }
          : { text: p.text }),
      }));
      const body = { contents };
      if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
      const model = c.model.replace(/^models\//, '');
      const url = `${c.base}/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
      const res = await send(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': c.apiKey }, body: JSON.stringify(body), signal: opts.signal });
      if (!res.ok) throw await errorFrom(res);
      let blocked = null;
      await readSSE(res, (ev) => {
        const cand = ev.candidates && ev.candidates[0];
        if (cand && cand.content && cand.content.parts) cand.content.parts.forEach((p) => { if (p.text && !p.thought) emit(p.text); });
        if (ev.promptFeedback && ev.promptFeedback.blockReason) blocked = ev.promptFeedback.blockReason;
      });
      if (blocked && !full) throw new Error('Gemini blocked the request: ' + blocked);
      return full;
    }

    // OpenAI-compatible
    const msgs = [];
    if (opts.system) msgs.push({ role: 'system', content: opts.system });
    for (const m of messages) {
      const parts = partsOf(m.content);
      if (parts.length === 1 && parts[0].type === 'text') msgs.push({ role: m.role, content: parts[0].text });
      else msgs.push({ role: m.role, content: parts.map((p) => p.type === 'image' ? { type: 'image_url', image_url: { url: p.dataUrl } } : { type: 'text', text: p.text }) });
    }
    const headers = { 'content-type': 'application/json' };
    if (c.apiKey) headers.authorization = 'Bearer ' + c.apiKey;
    if (c.provider === 'openrouter') { headers['X-Title'] = 'ESAT Practice (local)'; }
    const body = { model: c.model, messages: msgs, stream: true };
    const res = await send(c.base + '/chat/completions', { method: 'POST', headers, body: JSON.stringify(body), signal: opts.signal });
    if (!res.ok) throw await errorFrom(res);
    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('application/json')) {
      const j = await res.json();
      emit(j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content);
      return full;
    }
    let finish = null;
    await readSSE(res, (ev) => {
      if (ev.error) throw new Error(ev.error.message || String(ev.error));
      const ch = ev.choices && ev.choices[0];
      if (!ch) return;
      if (ch.delta && typeof ch.delta.content === 'string') emit(ch.delta.content);
      else if (ch.delta && Array.isArray(ch.delta.content)) ch.delta.content.forEach((p) => p.text && emit(p.text));
      if (ch.finish_reason) finish = ch.finish_reason;
    });
    if (finish === 'length') emit('\n\n_[reply cut off: hit the length limit]_');
    return full;
  };

  // Strip <think>…</think> blocks some local reasoning models print.
  A.clean = (t) => String(t || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  A.listModels = async () => {
    const c = A.config();
    if (!c.base) throw new Error('Set a base URL first.');
    if (c.format === 'anthropic') {
      const res = await send(c.base + '/v1/models?limit=100', { headers: { 'x-api-key': c.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } });
      if (!res.ok) throw await errorFrom(res);
      return (await res.json()).data.map((m) => m.id);
    }
    if (c.format === 'gemini') {
      const res = await send(c.base + '/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': c.apiKey } });
      if (!res.ok) throw await errorFrom(res);
      return (await res.json()).models.filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace(/^models\//, ''));
    }
    const headers = {};
    if (c.apiKey) headers.authorization = 'Bearer ' + c.apiKey;
    const res = await send(c.base + '/models', { headers });
    if (!res.ok) throw await errorFrom(res);
    const j = await res.json();
    return (j.data || j.models || []).map((m) => m.id || m.name).filter(Boolean).sort();
  };

  A.test = async () => {
    const out = await A.chat({ messages: [{ role: 'user', content: 'Reply with exactly: OK' }], effort: 'low', maxTokens: 2000 });
    return A.clean(out);
  };

  /* ------------------------------------------------------------------
     Prompts. Kept here so every feature talks about the ESAT the same way.
     ------------------------------------------------------------------ */
  const ESAT_FACTS = `About the ESAT (Engineering and Science Admissions Test, run by UAT-UK, used by Cambridge, Oxford, Imperial and UCL):
- Five modules: Mathematics 1, Biology, Chemistry, Physics, Mathematics 2. Most courses take Mathematics 1 plus two more.
- Each module: 27 multiple-choice questions in 40 minutes (about 89 seconds per question). One mark per correct answer, no negative marking.
- No calculator. Physics uses g = 10 N kg⁻¹. All modules assume Mathematics 1 knowledge.
- Questions reward insight and efficient methods over long algebra.`;

  A.prompts = {
    ESAT_FACTS,

    tutor(q, ctx) {
      const opts = q.options.map((o, i) => `${U.letter(i)}. ${o}`).join('\n');
      return `You are a friendly, sharp ESAT tutor helping a sixth-form student who is practising for the ESAT.
${ESAT_FACTS}

The student is working on this question (${U.moduleName(q.module)}, spec ${q.spec} – ${Bank.specTitle(q.spec)}):

QUESTION:
${q.stem}

OPTIONS:
${opts}

CORRECT ANSWER: ${U.letter(q.answer)}
${ctx.choice != null && ctx.choice >= 0 ? `STUDENT'S ANSWER: ${U.letter(ctx.choice)} (${ctx.choice === q.answer ? 'correct' : 'incorrect'})` : 'The student has not answered yet.'}
${ctx.revealed ? `WORKED SOLUTION (the mark scheme):\n${q.solution}` : 'The student has NOT seen the answer yet: do not reveal which option is correct unless they explicitly ask for the answer. Prefer hints and questions.'}

How to help:
- Be concise and exam-focused: no-calculator methods, quick checks, elimination of options, spotting traps.
- Use LaTeX in $...$ for maths. Short paragraphs or bullet points.
- If the student shares their working (text or a photo), find the exact step where it goes wrong.
- If the question or official answer looks wrong to you, say so plainly and explain why.`;
    },

    markWorking(q, choice) {
      const opts = q.options.map((o, i) => `${U.letter(i)}. ${o}`).join('\n');
      return `You are an ESAT examiner marking a student's written working for one multiple-choice question.
${ESAT_FACTS}

QUESTION (${U.moduleName(q.module)}, spec ${q.spec}):
${q.stem}

OPTIONS:
${opts}

CORRECT ANSWER: ${U.letter(q.answer)}
STUDENT'S CHOSEN OPTION: ${choice != null && choice >= 0 ? U.letter(choice) : 'none'}

WORKED SOLUTION:
${q.solution}

Mark the student's working out of 4 using this mark scheme (adapt the steps to the method they chose – any valid method earns full credit):
- M1: a correct overall approach / relevant principle identified
- M1: key intermediate step(s) carried out correctly
- A1: correct final value / conclusion reached from their working
- E1: efficient, exam-appropriate method (would fit in ~90 seconds without a calculator)

Reply in this format:
### Marks
- M1 (approach): ✓/✗ – one line why
- M1 (key steps): ✓/✗ – one line why
- A1 (answer): ✓/✗ – one line why
- E1 (efficiency): ✓/✗ – one line why

### Where it went wrong
(The first incorrect step, quoted, and the fix. Write "Nothing – well done" if fully correct.)

### Faster route
(One short paragraph with a quicker method if there is one.)

SCORE: x/4

Use LaTeX in $...$ for maths. If the working is illegible or missing, say so and give 0.`;
    },

    markChallenge(ch) {
      const scheme = (ch.markScheme || []).map((m) => `- [${m.marks} mark${m.marks > 1 ? 's' : ''}] ${m.criterion}`).join('\n');
      const total = (ch.markScheme || []).reduce((s, m) => s + m.marks, 0) || 5;
      return `You are an admissions-test examiner marking a student's written answer to an interview-style problem.

PROBLEM: ${ch.title}
${ch.statement}

MODEL SOLUTION:
${ch.solution}

MARK SCHEME (total ${total}):
${scheme || '- Award marks for correct method, correct key steps, correct final answer and clear reasoning.'}

Mark strictly against the mark scheme, but accept any valid alternative method that earns the same credit.
Reply in this format:
### Marks
(one bullet per mark-scheme line: ✓/✗ with marks awarded and a short reason)

### Feedback
(2–4 bullets: what was good, the first error, how to fix it)

SCORE: x/${total}

Use LaTeX in $...$ for maths. If the working is missing or unreadable, say so.`;
    },

    generate({ module, specs, difficulty, count, examples, avoid }) {
      const specLines = specs.map((code) => {
        const i = Bank.specInfo(code);
        return `- ${code} ${i.point.title}: ${i.point.text}`;
      }).join('\n');
      const ex = examples.map((q) => formatQuestion(q)).join('\n');
      return `You are an expert writer of ESAT questions (UAT-UK's Engineering and Science Admissions Test).
${ESAT_FACTS}

Write ${count} NEW, ORIGINAL multiple-choice questions for the ${U.moduleName(module)} module.
Spread them across these specification points:
${specLines}

Difficulty: ${difficulty === 'hard' ? 'hard – like the hardest third of a real ESAT paper: multi-step, needs insight' : difficulty === 'easy' ? 'easier – single idea, a confidence builder, still ESAT style' : 'typical ESAT – a mix of medium and hard, each solvable in about 90 seconds without a calculator by a strong A-level student'}.

Rules:
- Exactly one correct option. Use 5 to 8 options (labelled A, B, C, ...). Distractors must come from realistic mistakes (sign errors, wrong formula, forgetting a factor, unit slips), not random numbers.
- Numbers must work out cleanly without a calculator. Physics: g = 10 N kg⁻¹.
- Self-contained text: no diagrams needed (describe any figure fully in words or a small markdown table).
- Use LaTeX inside $...$ for all maths. Do NOT use JSON.
- Check every answer carefully by solving it yourself before writing it down.
- The SOLUTION must be a concise worked solution a student can follow, ending with the correct option letter.
${avoid && avoid.length ? '- Do not repeat these existing questions:\n' + avoid.map((s) => '  * ' + s.slice(0, 120)).join('\n') : ''}

Here ${examples.length === 1 ? 'is an example' : 'are examples'} of the house style and the EXACT output format:
${ex}

Now output exactly ${count} questions in that format, each starting with "=== QUESTION ===" and ending with "=== END ===". No other text.`;
    },

    verify(q) {
      return `Solve this ESAT multiple-choice question carefully (no calculator; physics uses g = 10 N/kg).

${q.stem}

${q.options.map((o, i) => `${U.letter(i)}. ${o}`).join('\n')}

Work it out step by step, then finish with a final line of the form:
ANSWER: <letter>
If more than one option is correct, or none is, finish with: ANSWER: X`;
    },

    extract(module) {
      return `You convert exam questions into a structured format for a personal revision app.
The student will give you screenshots or pasted text of multiple-choice questions (for the ESAT ${module ? U.moduleName(module) + ' module' : ''}).

For EACH question you can see, output:
=== QUESTION ===
SPEC: <best matching ESAT spec code from the list below>
DIFFICULTY: <1, 2 or 3>
STEM:
<the question text, maths in LaTeX $...$; describe any diagram in words>
OPTIONS:
A) ...
B) ...
(as many as the question has)
ANSWER: <letter, if an answer key is visible; otherwise solve it yourself>
SOLUTION:
<a concise worked solution>
=== END ===

Copy the wording faithfully. Output only the blocks.

Spec codes:
${specCatalogue(module)}`;
    },

    interviewer(cfg) {
      const style = cfg.style === 'supportive'
        ? 'Be warm and encouraging. If the student gets stuck, give a small hint or a simpler sub-question, like a supervisor guiding them through.'
        : 'Be friendly but probing, like a real Oxbridge interviewer: ask "why?", challenge hand-waving, push for the next step, and only hint when the student is truly stuck.';
      return `You are an admissions interviewer for ${cfg.subjectLabel} at a top UK university (Cambridge/Oxford/Imperial style), running a ${cfg.minutes}-minute practice interview.
The student is preparing for the ESAT and interviews; this is a rehearsal, not a real interview.

${style}

How to run it:
- Start with a one-line welcome, then pose the first problem. ${cfg.problem ? 'Use this problem first:\n---\n' + cfg.problem + '\n---' : 'Choose an unseen, interview-style problem appropriate to a strong final-year school student (A-level / IB level knowledge, but needing insight).'}
- Ask ONE thing at a time and keep each turn short (2–5 sentences). Never lecture or give the full solution unprompted.
- The student may type, speak (transcribed, so forgive transcription slips), or share their whiteboard as an image – refer to what they drew.
- Ask them to estimate, sketch graphs, consider limiting cases and check units.
- If they finish a problem, extend it ("what if…?") or move to a new one.
- Use LaTeX in $...$ for maths.
- When the student says the interview is over, stop asking questions.`;
    },

    interviewReport(cfg) {
      return `The practice interview for ${cfg.subjectLabel} has finished. Write a short, honest feedback report for the student based on the transcript.

Format:
### Overall
(2–3 sentences)

### Scores (1–5)
- Problem solving: n – reason
- Mathematical/scientific fluency: n – reason
- Communication & thinking aloud: n – reason
- Responding to hints: n – reason

### What went well
- …

### What to work on
- … (specific, actionable)

### Problems covered
- … (one line each, with the key idea)

Use LaTeX in $...$ where needed.`;
    },
  };

  function specCatalogue(module) {
    return window.ESAT_SPEC.filter((m) => !module || m.id === module)
      .map((m) => m.sections.map((s) => s.points.map((p) => `${p.code} ${p.title}`).join('; ')).join('\n')).join('\n');
  }

  function formatQuestion(q) {
    return `=== QUESTION ===
SPEC: ${q.spec}
DIFFICULTY: ${q.difficulty || 2}
STEM:
${q.stem}
OPTIONS:
${q.options.map((o, i) => `${U.letter(i)}) ${o}`).join('\n')}
ANSWER: ${U.letter(q.answer)}
SOLUTION:
${q.solution}
=== END ===`;
  }
  A.formatQuestion = formatQuestion;

  // Parse "=== QUESTION === … === END ===" blocks into question objects.
  A.parseQuestions = (text, defaults = {}) => {
    text = A.clean(text).replace(/```[a-z]*\n?/g, '');
    const blocks = text.split(/===\s*QUESTION\s*===/i).slice(1);
    const out = [];
    for (let raw of blocks) {
      raw = raw.split(/===\s*END\s*===/i)[0];
      const grab = (name, next) => {
        const re = new RegExp(`(?:^|\\n)\\s*${name}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${next.join('|')})\\s*:|$)`, 'i');
        const m = re.exec(raw);
        return m ? m[1].trim() : '';
      };
      const spec = grab('SPEC', ['DIFFICULTY', 'STEM']).split(/\s/)[0];
      const difficulty = parseInt(grab('DIFFICULTY', ['STEM']), 10) || 2;
      const stem = grab('STEM', ['OPTIONS']);
      const optBlock = grab('OPTIONS', ['ANSWER']);
      const answer = grab('ANSWER', ['SOLUTION']).replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase();
      const solution = grab('SOLUTION', ['=== END']);
      const options = [];
      let cur = null;
      for (const line of optBlock.split('\n')) {
        const m = /^\s*\(?([A-H])[).:]\s*(.*)$/.exec(line);
        if (m && m[1] === U.letter(options.length + (cur != null ? 1 : 0))) {
          if (cur != null) options.push(cur.trim());
          cur = m[2];
        } else if (cur != null && line.trim()) cur += '\n' + line.trim();
      }
      if (cur != null) options.push(cur.trim());
      const ai = U.letterIndex(answer);
      if (!stem || options.length < 2 || ai < 0 || ai >= options.length) continue;
      const info = Bank.specInfo(spec);
      out.push(Object.assign({
        id: U.uid('q-'),
        module: info ? info.module : defaults.module,
        spec: info ? spec : (defaults.spec || ''),
        difficulty: U.clamp(difficulty, 1, 3),
        stem, options, answer: ai, solution: solution || '(no solution given)',
      }, defaults.extra || {}));
    }
    return out;
  };

  A.parseScore = (text) => {
    const m = /SCORE\s*:\s*\**\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/i.exec(text || '');
    return m ? { got: parseFloat(m[1]), of: parseFloat(m[2]) } : null;
  };
  A.parseAnswer = (text) => {
    const all = [...String(text || '').matchAll(/ANSWER\s*:\s*\**\s*\(?([A-HX])\b/gi)];
    return all.length ? all[all.length - 1][1].toUpperCase() : null;
  };

  window.AI = A;
})();
