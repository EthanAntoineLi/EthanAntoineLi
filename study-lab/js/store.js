/* Persistence. Everything lives in this browser's localStorage under "esatp." keys.
   Use Settings → Export to back it up (or to move it between browsers). */
(function () {
  const P = 'esatp.';
  const mem = {};

  function load(key, fallback) {
    if (key in mem) return mem[key];
    let v = fallback;
    try {
      const raw = localStorage.getItem(P + key);
      if (raw != null) v = JSON.parse(raw);
    } catch (e) { /* storage blocked or corrupt – fall back */ }
    mem[key] = v;
    return v;
  }
  function save(key, value) {
    mem[key] = value;
    try { localStorage.setItem(P + key, JSON.stringify(value)); }
    catch (e) { U && U.toast('Could not save – browser storage is full or blocked. Export your data from Settings.', 'bad'); }
  }

  const DEFAULT_SETTINGS = {
    theme: 'auto',
    ai: { provider: 'openai', baseUrl: '', apiKey: '', model: '', vision: true, useProxy: false },
    practice: { mode: 'relaxed', shuffleOptions: false, autoAdvance: false, autoStatus: true },
    speech: { tts: true, voice: '' },
    review: { confirmAfterDays: 3 },
  };

  const S = {
    KEYS: ['profile', 'settings', 'attempts', 'review', 'mocks', 'custom', 'hidden', 'interviews', 'challenges', 'cutoffs', 'active', 'edits', 'specStatus', 'customCourses', 'courseOverrides'],

    profile() { return load('profile', null); },
    setProfile(p) { save('profile', p); if (window.Courses) Courses.invalidate(); },

    /* What you study. ESAT modules (if doing the ESAT) + A-level units by status:
       'current' (studying now), 'done' (finished, keep reviewing), 'later'. */
    esatOn() { const p = S.profile(); return !!(p && p.esat !== false && (p.modules || []).length); },
    esatModules() { const p = S.profile(); return S.esatOn() ? p.modules.slice() : []; },
    unitStatus(id) {
      const p = S.profile();
      if (!p) return null;
      if ((p.modules || []).includes(id)) return S.esatOn() ? 'current' : null;
      return (p.units || {})[id] || null;
    },
    // statuses: array of statuses to include, default current + done
    studyUnits(statuses = ['current', 'done']) {
      const p = S.profile();
      if (!p) return [];
      const out = statuses.includes('current') ? S.esatModules() : [];
      for (const [id, st] of Object.entries(p.units || {})) if (statuses.includes(st) && window.Courses && Courses.unit(id)) out.push(id);
      return out;
    },
    studyCourses() {
      const ids = new Set(S.studyUnits(['current', 'done', 'later']).map((u) => Courses.unit(u) && Courses.unit(u).course));
      return Courses.all().filter((c) => ids.has(c.id));
    },

    /* Spec-point tracker: key -> {s: 'learning'|'learned'|'shaky', at} */
    specStatus() { return load('specStatus', {}); },
    setSpecStatus(key, s) {
      const all = S.specStatus();
      if (!s) delete all[key]; else all[key] = { s, at: Date.now() };
      save('specStatus', all);
    },
    setSpecStatusMany(keys, s) {
      const all = S.specStatus();
      keys.forEach((k) => { if (!s) delete all[k]; else all[k] = { s, at: Date.now() }; });
      save('specStatus', all);
    },
    /* After a marked answer: 2+ attempts on a spec point averaging 80%+ (last 5) turn it green;
       under 50% flags it as shaky. Whatever you set by hand stands until you answer on it again. */
    autoStatus(spec) {
      if (!spec || !window.Bank || !S.settings().practice.autoStatus) return;
      const x = Bank.stats().spec[spec];
      if (!x || x.n < 2 || x.recentAcc == null) return;
      const next = x.recentAcc >= 0.8 ? 'learned' : x.recentAcc < 0.5 ? 'shaky' : null;
      const all = S.specStatus();
      if (next && (all[spec] || {}).s !== next) { all[spec] = { s: next, at: Date.now(), auto: true }; save('specStatus', all); }
    },

    /* Your own courses, and edited copies of built-in ones */
    customCourses() { return load('customCourses', []); },
    saveCustomCourse(c) { const list = S.customCourses().filter((x) => x.id !== c.id); list.push(c); save('customCourses', list); Courses.invalidate(); },
    deleteCustomCourse(id) { save('customCourses', S.customCourses().filter((x) => x.id !== id)); Courses.invalidate(); },
    courseOverrides() { return load('courseOverrides', {}); },
    saveCourseOverride(id, c) { const o = S.courseOverrides(); if (c) o[id] = c; else delete o[id]; save('courseOverrides', o); Courses.invalidate(); },

    settings() {
      const s = load('settings', null) || {};
      // deep-ish merge with defaults so new settings appear for old saves
      const out = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      for (const k of Object.keys(s)) {
        if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) out[k] = Object.assign(out[k] || {}, s[k]);
        else out[k] = s[k];
      }
      return out;
    },
    setSettings(s) { save('settings', s); },
    patchSettings(fn) { const s = S.settings(); fn(s); S.setSettings(s); return s; },

    /* ---- attempts: {qid, module, spec, correct, choice, time, at, mode} ---- */
    attempts() { return load('attempts', []); },
    addAttempt(a) {
      const list = S.attempts();
      const rec = Object.assign({ at: Date.now() }, a);
      list.push(rec);
      save('attempts', list);
      S.updateReview(a.qid, a.correct, a.mode);
      S.autoStatus(rec.spec);
      return rec.at;
    },
    // re-marking a written answer changes the score of that attempt
    updateAttempt(qid, at, patch) {
      const list = S.attempts();
      const a = list.find((x) => x.qid === qid && x.at === at);
      if (!a) return;
      const wasCorrect = a.correct;
      Object.assign(a, patch);
      save('attempts', list);
      if (patch.correct != null && patch.correct !== wasCorrect) S.updateReview(qid, patch.correct, a.mode);
      S.autoStatus(a.spec);
    },
    cutoffs() { return load('cutoffs', {}); },
    resetModule(module) { const c = S.cutoffs(); c[module] = Date.now(); save('cutoffs', c); },
    // attempts that count for stats (after any module reset)
    liveAttempts() {
      const c = S.cutoffs();
      return S.attempts().filter((a) => !c[a.module] || a.at > c[a.module]);
    },

    /* ---- review queue: qid -> {due, stage, added} ----
       Wrong answer → due now (stage 0). Right while in the queue → stage 1, due again in N days
       to confirm it stuck. Right again → removed. Wrong at any point → back to stage 0, due now. */
    review() { return load('review', {}); },
    updateReview(qid, correct) {
      const r = S.review();
      const now = Date.now();
      if (!correct) {
        r[qid] = { due: now, stage: 0, added: (r[qid] && r[qid].added) || now, misses: ((r[qid] && r[qid].misses) || 0) + 1 };
      } else if (r[qid]) {
        if (r[qid].due > now) { /* answered early (e.g. in normal practice) – leave schedule alone */ }
        else if (r[qid].stage >= 1) delete r[qid];
        else { r[qid].stage = 1; r[qid].due = now + (S.settings().review.confirmAfterDays || 3) * U.DAY; }
      }
      save('review', r);
    },
    removeFromReview(qid) { const r = S.review(); delete r[qid]; save('review', r); },
    dueReview() {
      const r = S.review(), now = Date.now();
      return Object.keys(r).filter((q) => r[q].due <= now && Bank.byId(q)).sort((a, b) => r[a].due - r[b].due);
    },

    /* ---- mocks ---- */
    mocks() { return load('mocks', []); },
    saveMock(m) { const list = S.mocks().filter((x) => x.id !== m.id); list.push(m); save('mocks', list); },
    deleteMock(id) { save('mocks', S.mocks().filter((x) => x.id !== id)); },

    /* ---- custom questions (AI-made / imported / your own) ---- */
    custom() { return load('custom', []); },
    addCustom(qs) { const list = S.custom(); list.push(...qs); save('custom', list); Bank.invalidate(); },
    updateCustom(q) { save('custom', S.custom().map((x) => x.id === q.id ? q : x)); Bank.invalidate(); },
    deleteCustom(id) { save('custom', S.custom().filter((x) => x.id !== id)); Bank.invalidate(); },

    // Personal corrections to built-in questions (qid -> partial question)
    edits() { return load('edits', {}); },
    saveEdit(qid, patch) { const e = S.edits(); e[qid] = patch; save('edits', e); Bank.invalidate(); },
    clearEdit(qid) { const e = S.edits(); delete e[qid]; save('edits', e); Bank.invalidate(); },

    hidden() { return load('hidden', []); },
    setHidden(qid, on) {
      const h = new Set(S.hidden());
      on ? h.add(qid) : h.delete(qid);
      save('hidden', [...h]); Bank.invalidate();
    },

    /* ---- interviews & challenge progress ---- */
    interviews() { return load('interviews', []); },
    saveInterview(iv) { const list = S.interviews().filter((x) => x.id !== iv.id); list.push(iv); save('interviews', list); },
    deleteInterview(id) { save('interviews', S.interviews().filter((x) => x.id !== id)); },
    challenges() { return load('challenges', {}); },
    patchChallenge(id, fn) { const c = S.challenges(); c[id] = c[id] || { tries: 0, hints: 0, solved: false }; fn(c[id]); save('challenges', c); },

    /* ---- an unfinished session (so a refresh doesn't lose a mock) ---- */
    active() { return load('active', null); },
    setActive(a) { save('active', a); },
    clearActive() { save('active', null); },

    /* ---- backup ---- */
    exportAll(includeKey) {
      const data = { app: 'esat-practice', version: 1, exportedAt: new Date().toISOString() };
      for (const k of S.KEYS) data[k] = load(k, null);
      if (!includeKey && data.settings && data.settings.ai) data.settings = Object.assign({}, data.settings, { ai: Object.assign({}, data.settings.ai, { apiKey: '' }) });
      return data;
    },
    importAll(data, mode = 'replace') {
      if (!data || data.app !== 'esat-practice') throw new Error('That file is not a Study Lab backup.');
      for (const k of S.KEYS) {
        if (!(k in data) || data[k] == null) continue;
        if (mode === 'merge' && k === 'attempts') {
          const seen = new Set(S.attempts().map((a) => a.qid + '|' + a.at));
          save(k, S.attempts().concat(data[k].filter((a) => !seen.has(a.qid + '|' + a.at))).sort((a, b) => a.at - b.at));
        } else if (mode === 'merge' && k === 'custom') {
          const ids = new Set(S.custom().map((q) => q.id));
          save(k, S.custom().concat(data[k].filter((q) => !ids.has(q.id))));
        } else if (k === 'settings' && data.settings.ai && !data.settings.ai.apiKey) {
          const keep = S.settings().ai.apiKey;
          save(k, Object.assign({}, data.settings, { ai: Object.assign({}, data.settings.ai, { apiKey: keep }) }));
        } else save(k, data[k]);
      }
      Bank.invalidate(); if (window.Courses) Courses.invalidate();
    },
    wipe() {
      for (const k of S.KEYS) { delete mem[k]; try { localStorage.removeItem(P + k); } catch (e) {} }
      Bank.invalidate();
    },
  };

  window.Store = S;
})();
