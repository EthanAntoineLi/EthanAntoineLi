# Study Lab

A personal revision app that runs on your own computer. It covers **Edexcel International A Level Maths, Further Maths, Physics and Chemistry** unit by unit, and the **ESAT** if you're taking it. It works like ESAT Lab: questions organised by the official specification, practice at real exam pace, a review queue, and progress tracked for every spec point. The AI features work with **any** model you have an API key for.

Nothing is uploaded anywhere. Your progress stays in your browser, and AI requests go straight from your computer to the provider you pick.

## Start it

**Option 1: just open it.** Double-click `index.html`. Everything except local AI models (Ollama / LM Studio) works like this.

**Option 2: run the small local server (recommended).** You need Python 3, which is free from [python.org](https://www.python.org/downloads/).

- Windows: double-click `Start Study Lab (Windows).bat`
- Mac: double-click `Start Study Lab (Mac).command`. If macOS blocks it, right-click → Open the first time.
- Any OS: run `python3 serve.py`, then open http://localhost:8765

The server only listens on your own computer. It can also relay AI requests for providers that block calls made directly from a web page (tick *Route requests through the local server* in Settings).

> Progress is stored per browser *and* per way of opening the app. `file://…/index.html` and `http://localhost:8765` count as different places, so stick to one. You can move your data between them with **Settings → Export/Import backup**.

## Set it up for your units

On first launch, mark each unit as **Done**, **Studying now**, **Later** or **Not taking**. For example, an IAL Further Maths student in A2 might set P1–P4, FP1, M1, S1 and S2 as *Done* and FP3, M2 and S3 as *Studying now*. The dashboard, practice, review and stats then follow those units. Earlier units stay in your review, because later papers keep using earlier content.

Tick *I'm also taking the ESAT* to add the ESAT modules for your university course, with full mocks and the 89-second pace.

Using a different board or subject? **Settings → Courses & spec lists → Add a course**: paste the syllabus and the AI turns it into units and spec points, or type the list yourself. You can also edit any built-in list.

## What's in it

| Feature | What it does |
|---|---|
| **Progress map** | Every spec point of every unit you study. Mark each one *learning* → *learned* (it turns **green**) or *shaky*. Your marks update it too: two or more answers on a point averaging 80%+ turn it green, and under 50% flags it as shaky. Each unit shows a bar of how far you've got, plus your weak points and a practise button per point. |
| **Question bank** | 226 original Edexcel IAL-style questions (2,054 marks) with full mark schemes: FP1, FP2, FP3, M1, M2, S1, S2, S3 (83 questions), Physics Units 1, 2, 4, 5 (69) and Chemistry Units 1, 2, 4, 5 (74, written plus Section A multiple choice). Between them they cover every spec point of those units, and each one was re-solved and checked by a second examiner. There are also 208 ESAT-style questions. Browse by course → unit → topic → spec point. For units without built-in questions (P1–P4, M3, D1, the practical units) or any spec point you want more on, there's a button to make some with AI. |
| **Written answers + marking** | Type your answer (or photograph your working) and submit. You then get the mark scheme as a checklist (M1, A1, B1, dM1, A1ft…) to tick what you earned, or press **Mark with AI** and the model marks your answer line by line against the scheme, explains where marks were lost and fills in the checklist. The worked solution follows. |
| **Practice modes** | **Relaxed:** the timer counts up and can be paused, and you get marking and the solution after each question. **Exam conditions:** a countdown at real pace (A-level: 72 s per mark, which is 90 minutes for 75 marks; ESAT: 89 s per question), free navigation and flagging, with marking at the end. |
| **Review** | *Review all topics* brings back the topics you've covered on a spaced schedule: weak ones after 2 days, middling ones after 6 days and strong ones after 18 days. It includes earlier units (e.g. FP1 and P4 while you study FP3). *Mistakes* brings back questions you lost marks on until you get them right twice. |
| **Statistics** | Accuracy (marks scored ÷ marks available) per unit, topic and spec point, your pace per mark or per question, daily activity and mock history. |
| **AI question maker** | Unlimited new exam-style questions with mark schemes for any spec points you pick (or *my weak points*). A second pass checks each one, and anything it disputes is flagged. It can also build a whole **practice paper** for a unit, about a quarter drawn from earlier units. |
| **Import** | Turn screenshots or pasted text of past-paper questions and mark schemes into practice questions. Also JSON question packs and your own questions. |
| **AI tutor** | A chat on any question that knows the question, your answer and the mark scheme. Before you've answered it only gives hints. |
| **Scratchpad** | A drawing board beside every question. You can send it to the AI. |
| **ESAT extras** | 208 original ESAT-style questions on the official ESAT spec, full mocks with a 1–9 scale estimate, 27 challenge problems and AI mock interviews. |
| **Fix anything** | Edit any question (your fix is stored as a personal correction) or hide it. |

### Keyboard shortcuts (in a question)
`A`–`H` choose (multiple choice) · `Enter` check / next · `←` `→` move · `F` flag · `S` scratchpad · `T` AI tutor · `N` navigator (exam) · `P` pause (relaxed)

## Plugging in an AI model

Go to **Settings → AI model**, pick a provider, paste your API key, choose a model (*Load models* lists what your key can use) and press **Test connection**.

| Provider | Notes |
|---|---|
| OpenAI | Key from platform.openai.com |
| Anthropic (Claude) | Key from console.anthropic.com. Defaults to `claude-opus-5-5`; `claude-sonnet-5-5` and `claude-haiku-5-5` are cheaper. On Claude models that support it, the app opts into Anthropic's server-side fallback, so a request a safety classifier declines is retried on another model instead of failing. |
| Google Gemini | Key from aistudio.google.com (has a free tier) |
| OpenRouter | One key for hundreds of models |
| Groq, DeepSeek, Mistral, xAI | Cheap and fast. Untick "accepts images" if the model can't take images. |
| Ollama / LM Studio | Free and offline, but small models make more maths mistakes. Use `serve.py`. |
| Custom | Anything with an OpenAI-compatible `/chat/completions` endpoint |

- **Cost:** marking and the tutor cost very little per use. The question maker and practice papers make more and longer requests.
- **Privacy:** your key is stored only in this browser (Export leaves it out unless you choose otherwise). Whatever you type, draw or upload for an AI feature is sent to your chosen provider.
- **Accuracy:** AI marking is a strong second opinion, not an examiner. If a mark looks wrong, change the ticks and save. AI-made questions are labelled *AI-made*.

## How marking works

- **Written questions** use Edexcel-style mark schemes. **M** marks are for a correct method, **A** marks are for accurate answers and normally need the M mark before them, **B** marks stand alone, **dM** depends on the previous M, and **ft** means follow-through from an earlier error. Your score is the marks you earned out of the total. A question counts as "right" for the review queue at 70% or more.
- **Multiple choice** scores 1 mark per correct answer with no negative marking, like the real papers.
- The ESAT mock's **1–9 scale estimate** uses the scaling constants and percentiles published in UAT-UK's *ESAT Technical Report 2024–25*. Treat it as ±1.

## Adding questions as a JSON pack

```json
[
  { "spec": "fp3:1.1", "difficulty": 2, "type": "written",
    "stem": "**(a)** Show that $\\cosh 2x = 1 + 2\\sinh^2 x$. **(2)**\n\n**(b)** Hence solve $\\cosh 2x = 5\\sinh x - 1$, giving answers in ln form. **(5)**",
    "markScheme": "**(a)**\n- **M1** uses exponential definitions\n- **A1*** cso\n**(b)**\n- **M1** forms quadratic in $\\sinh x$\n- **A1** $\\sinh x = \\tfrac12, 2$\n- **M1** uses $\\operatorname{arsinh} x = \\ln(x + \\sqrt{x^2+1})$\n- **A1** **A1** $\\ln\\frac{1+\\sqrt5}{2}$, $\\ln(2+\\sqrt5)$",
    "solution": "…" },
  { "spec": "M2.3", "difficulty": 2,
    "stem": "How many factors does $2^3 \\times 3^2$ have?",
    "options": ["5", "6", "9", "12", "36"], "answer": "D",
    "solution": "$(3+1)(2+1) = 12$." }
]
```

Import it from **Question bank → My questions → Import pack**. Use Markdown with LaTeX in `$…$`. A-level `spec` keys look like `unit:topic.point` (e.g. `fp3:1.1`, `m2:4.2`, `phy4:7.3`) and are shown on the progress map. ESAT keys look like `M2.3`. In a mark scheme, put each mark code in bold; the codes are added up to give the question's total.

## Files

```
index.html                 the app
serve.py                   optional local server + AI relay (Python standard library only)
css/app.css                styles (light & dark)
js/                        app code: store, courses, bank, AI client, whiteboard, views/
data/courses/ial-*.js      IAL units, topics and spec points (Maths/Further Maths, Physics, Chemistry)
data/questions-ial-*.js    built-in A-level questions with mark schemes
data/spec.js               ESAT specification (270 spec points)
data/esat-courses.js       ESAT course → module requirements (2027 entry)
data/questions-*.js        built-in ESAT questions
data/challenges.js         challenge problems
vendor/katex/              maths rendering (MIT licence), bundled so it works offline
```

## Sources & disclaimer

The IAL spec lists follow the structure of the Pearson Edexcel International A Level specifications (first teaching 2018). They were written from knowledge of those specifications and cross-checked, not copied from them, so check them against your own copy and edit anything that differs (**Settings → Courses & spec lists**). The built-in A-level and ESAT questions are original practice questions written in the style of the real papers and checked by a second examiner pass. They are not official Pearson or UAT-UK questions and are not copied from ESAT Lab or anywhere else. The ESAT spec, module rules and scaling data come from UAT-UK's free official documents. This is a personal study tool and is not affiliated with Pearson, UAT-UK, ESAT Lab or any university.
