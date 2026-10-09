# ESAT Practice (local edition)

A personal ESAT practice app that runs on your own computer. It works like ESAT Lab: questions organised by the official ESAT specification, timed practice at real exam pace, full mocks, a review queue for mistakes, and accuracy/timing tracked per spec point. It also has AI features that work with **any** model you have an API key for.

Nothing is uploaded anywhere. Your progress stays in your browser, and AI requests go straight from your computer to the provider you pick.

## Start it

**Option 1: just open it.** Double-click `index.html`. Everything except local AI models (Ollama / LM Studio) works like this.

**Option 2: run the small local server (recommended).** You need Python 3, which is free from [python.org](https://www.python.org/downloads/).

- Windows: double-click `Start ESAT Practice (Windows).bat`
- Mac: double-click `Start ESAT Practice (Mac).command`. If macOS blocks it, right-click → Open the first time.
- Any OS: run `python3 serve.py`, then open http://localhost:8765

The server only listens on your own computer. It can also relay AI requests for providers that block calls made directly from a web page (tick *Route requests through the local server* in Settings).

> Progress is stored per browser *and* per way of opening the app. `file://…/index.html` and `http://localhost:8765` count as different places, so stick to one. You can move your data between them with **Settings → Export/Import backup**.

## Matching your subject

On first launch, pick your course from UAT-UK's 2027-entry list (Cambridge, Oxford, Imperial, UCL) and the app sets your modules. For example, Cambridge Engineering gets Maths 1 + Physics + Maths 2, and Imperial Biological Sciences gets Maths 1 + Chemistry + Biology. For "any two" courses such as Natural Sciences you tick your own modules. The dashboard, mixed practice, mocks and stats then follow those modules. All five modules stay browsable.

## What's in it

| Feature | What it does |
|---|---|
| **Question bank** | 208 original ESAT-style questions (Maths 1: 50, Maths 2: 42, Physics: 42, Chemistry: 39, Biology: 35). Each has a worked solution and is tagged with an official spec point such as *M2.3 Primes, factors and multiples*. Browse by module → topic → spec point. |
| **Practice modes** | **Relaxed:** the timer counts up and can be paused, and you get instant feedback plus the worked solution after each question. **Exam conditions:** a countdown at real pace (40 min / 27 Qs ≈ 89 s each), no pausing, free navigation, flagging and a review screen, with solutions at the end. |
| **Mock test** | Your modules back to back in exam order, 27 questions / 40 minutes each, separately timed, no calculator, solutions at the end. Results show your score per module plus a rough 1.0–9.0 scale estimate and percentile (see note below). |
| **Review queue** | Anything you get wrong comes back straight away. Get it right and it returns once more a few days later to check it stuck, then it leaves the queue. |
| **Progress** | Accuracy and average time for every spec point, shown as a colour-coded spec map. Also your weakest spec points, time vs the 89 s pace, daily activity and mock history. |
| **Scratchpad** | A drawing board beside every question, like the erasable booklet you get in the real test. You can send it to the AI. |
| **Challenge problems** | 27 longer, interview-style problems with step-by-step hints, answer checking (it understands `5/6`, `2sqrt(3)`, `pi/6`, `3e9`) and a mark scheme. |
| **AI tutor** | A chat on any question that knows the question, your answer and the worked solution. Before you've answered it only gives hints. |
| **AI marking** | *Mark my working:* type your working or photograph your paper, and the AI marks it against the worked solution (M1 approach · M1 key steps · A1 answer · E1 efficiency), pinpoints the first mistake and shows a faster route. Challenge write-ups are marked against each problem's own mark scheme. |
| **AI mock interview** | An interviewer for Engineering, Physics, Maths, Chemistry, Natural Sciences or Biology, in a challenging or supportive style. Type or talk (browser speech recognition), share the whiteboard, and get a feedback report with scores at the end. |
| **AI question maker** | Unlimited new ESAT-style questions for any spec points you pick (or *my weakest*). Each one is double-checked by having the model re-solve it blind, and disagreements are flagged. It can also build a whole fresh AI mock paper. |
| **Import** | Turn screenshots or pasted text of questions (e.g. the free official practice papers) into practice questions. You can also import/export JSON question packs or write your own questions. |
| **Fix anything** | Edit any question (your fix is stored as a personal correction) or hide it. |

### Keyboard shortcuts (in a question)
`A`–`H` choose · `Shift`+letter or right-click crosses out an option · `Enter` check / next · `←` `→` move · `F` flag · `S` scratchpad · `T` AI tutor · `N` navigator (exam) · `P` pause (relaxed)

## Plugging in an AI model

Go to **Settings → AI model**, pick a provider, paste your API key, choose a model (*Load models* lists what your key can use) and press **Test connection**.

| Provider | Notes |
|---|---|
| OpenAI | Key from platform.openai.com |
| Anthropic (Claude) | Key from console.anthropic.com. Defaults to `claude-opus-5-5`; `claude-sonnet-5-5` and `claude-haiku-5-5` are cheaper. On Claude models that support it, the app opts into Anthropic's server-side fallback so a request a safety classifier declines is retried on another model instead of failing. |
| Google Gemini | Key from aistudio.google.com (has a free tier) |
| OpenRouter | One key for hundreds of models |
| Groq, DeepSeek, Mistral, xAI | Cheap and fast. Untick "accepts images" if the model can't take images. |
| Ollama / LM Studio | Free and offline, but small models make more maths mistakes. Use `serve.py`. |
| Custom | Anything with an OpenAI-compatible `/chat/completions` endpoint |

- **Cost:** the tutor and marking cost very little per use. The question maker and the AI mock paper make more and longer requests.
- **Privacy:** your key is stored only in this browser (Export leaves it out unless you choose otherwise). Whatever you type, draw or upload for an AI feature is sent to your chosen provider.
- **Accuracy:** AI-made questions are labelled *AI-made*. Use the double-check and fix or hide anything that looks wrong.

## How marking works

- Multiple choice is marked like the real ESAT: 1 mark per correct answer and no negative marking, so never leave a blank.
- AI marking compares your working to the worked solution (or the challenge's mark scheme) and ends with `SCORE: x/y`, which the app records.
- The mock's **1–9 scale estimate** uses the scaling constants and percentiles published in UAT-UK's *ESAT Technical Report 2024–25*. Item difficulties aren't published, so the estimate assumes a typical spread of difficulty: treat it as ±1, a feel for the scale, not a prediction.

## Adding questions as a JSON pack

```json
[
  { "spec": "M2.3", "difficulty": 2,
    "stem": "How many factors does $2^3 \\times 3^2$ have?",
    "options": ["5", "6", "9", "12", "36"],
    "answer": "D",
    "solution": "$(3+1)(2+1) = 12$." }
]
```

Import it from **Question bank → My questions → Import pack**. Use Markdown with LaTeX in `$…$`, and `spec` must be a code from the official spec (e.g. `M4.16`, `P3.6`, `C4.10`, `B5.3`, `MM6.3`).

## Files

```
index.html            the app
serve.py              optional local server + AI relay (Python standard library only)
css/app.css           styles (light & dark)
js/                   app code: store, bank, AI client, whiteboard, views/
data/spec.js          official ESAT specification (all 270 spec points)
data/courses.js       course → module requirements (2027 entry)
data/questions-*.js   built-in question bank
data/challenges.js    challenge problems
vendor/katex/         maths rendering (MIT licence), bundled so it works offline
```

## Sources & disclaimer

The spec points, module rules and scaling data come from UAT-UK's free official documents: the *ESAT Content Specification* (October 2026 / January 2027), the *Course List 2027 Entry* and the *ESAT Technical Report 2024–25*. The built-in questions are original practice questions written in the ESAT style. They are not official ESAT questions and are not copied from ESAT Lab or anywhere else. This is a personal study tool and is not affiliated with UAT-UK, ESAT Lab, Pearson VUE or any university. Always check your course's module requirements on the university website before booking.
