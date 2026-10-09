/* Question bank: built-in questions (data/questions-*.js) + your own (AI-made / imported),
   with your personal corrections applied. Also spec lookups and per-spec statistics.
   Two question types:
     mcq     – ESAT-style multiple choice: {options[], answer}
     written – exam-style written answer: {marks, markScheme, solution}; you type/photograph your
               answer and it is marked against the mark scheme (by the AI or by you). */
(function () {
  let cache = null;

  function normalise(q) {
    q = Object.assign({}, q);
    q.type = q.type || (Array.isArray(q.options) ? 'mcq' : 'written');
    if (q.type === 'mcq' && typeof q.answer === 'string') q.answer = U.letterIndex(q.answer);
    if (q.type === 'written') q.marks = q.marks || C.parseMarkScheme(q.markScheme || '').total || 1;
    q.difficulty = q.difficulty || 2;
    q.source = q.source || 'builtin';
    const info = q.spec ? Courses.spec(q.spec) : null;
    if (info) q.module = info.unit.id;
    q.course = info ? info.course.id : (q.module && Courses.unit(q.module) ? Courses.unit(q.module).course : '');
    q.section = info ? info.section.key : (q.spec ? q.spec.split('.')[0] : '');
    return q;
  }

  // Value of one attempt between 0 and 1 (marks scored / marks available).
  const value = (a) => (a.max ? a.score / a.max : (a.correct ? 1 : 0));

  const B = {
    invalidate() { cache = null; },
    value,

    specInfo(code) {
      const i = Courses.spec(code);
      return i ? { module: i.unit.id, moduleName: i.unit.name, unit: i.unit, course: i.course, section: i.section, point: i.point } : null;
    },
    specTitle(code) { const i = Courses.spec(code); return i ? i.point.title : code; },
    specLabel(code) { return Courses.label(code); },
    modules() { return Courses.all().flatMap((c) => c.units); },
    module(id) { return Courses.unit(id); },
    sectionOf(code) { const i = Courses.spec(code); return i ? i.section : Courses.section(code); },

    all(opts = {}) {
      if (!cache) {
        const edits = Store.edits();
        const builtin = (window.ESAT_QUESTIONS || []).map((q) => normalise(edits[q.id] ? Object.assign({}, q, edits[q.id], { edited: true }) : q));
        const custom = Store.custom().map(normalise);
        const hidden = new Set(Store.hidden());
        const list = builtin.concat(custom);
        list.forEach((q) => { q.hidden = hidden.has(q.id); });
        cache = { list, byId: Object.fromEntries(list.map((q) => [q.id, q])) };
      }
      return opts.includeHidden ? cache.list : cache.list.filter((q) => !q.hidden);
    },
    byId(id) { B.all(); return cache.byId[id] || null; },
    forModule(m) { return B.all().filter((q) => q.module === m); },
    forSpec(code) { return B.all().filter((q) => q.spec === code || (q.specs || []).includes(code)); },
    forSection(code) { return B.all().filter((q) => q.section === code); },
    countBySpec() {
      const c = {};
      B.all().forEach((q) => { c[q.spec] = (c[q.spec] || 0) + 1; (q.specs || []).forEach((s) => { if (s !== q.spec) c[s] = (c[s] || 0) + 1; }); });
      return c;
    },

    // Per-question history: {qid: {n, right, last, lastCorrect, lastValue}}
    history() {
      const h = {};
      for (const a of Store.attempts()) {
        const x = h[a.qid] || (h[a.qid] = { n: 0, right: 0, last: 0, lastCorrect: false, lastValue: 0 });
        x.n++; x.right += value(a);
        if (a.at >= x.last) { x.last = a.at; x.lastCorrect = a.correct; x.lastValue = value(a); }
      }
      return h;
    },

    /* Stats keyed by spec key, section key and unit: {n, right, acc, avg (s per MCQ), perMark (s per mark), last}
       "right" is in questions-worth: a written answer scoring 6/8 counts 0.75. */
    stats(attempts) {
      attempts = attempts || Store.liveAttempts();
      const out = { spec: {}, section: {}, module: {} };
      const add = (bucket, key, a) => {
        const x = bucket[key] || (bucket[key] = { n: 0, right: 0, time: 0, timed: 0, wTime: 0, wMarks: 0, last: 0, recent: [] });
        x.n++; x.right += value(a);
        if (a.at > x.last) x.last = a.at;
        x.recent.push(value(a));
        if (a.time > 0 && a.time < 7200) {
          if (a.max) { x.wTime += a.time; x.wMarks += a.max; } else if (a.time < 1800) { x.time += a.time; x.timed++; }
        }
      };
      for (const a of attempts) {
        if (a.spec) {
          add(out.spec, a.spec, a);
          const sec = B.sectionOf(a.spec);
          add(out.section, sec ? sec.key : a.spec.split('.')[0], a);
        }
        if (a.module) add(out.module, a.module, a);
      }
      for (const b of [out.spec, out.section, out.module]) {
        for (const k in b) {
          const x = b[k];
          x.acc = x.n ? x.right / x.n : null;
          x.avg = x.timed ? x.time / x.timed : null;
          x.perMark = x.wMarks ? x.wTime / x.wMarks : null;
          const r = x.recent.slice(-5);
          x.recentAcc = r.length ? r.reduce((s, v) => s + v, 0) / r.length : null;
          delete x.recent;
        }
      }
      return out;
    },

    // Weakest spec points (needs some data): sorted by a blend of accuracy and pace.
    weakest(units, limit = 6) {
      const st = B.stats().spec;
      const status = Store.specStatus();
      const rows = Object.keys(st).filter((c) => (st[c].n >= 2 || (status[c] && status[c].s === 'shaky')) && (!units || units.includes(B.specInfo(c)?.module)))
        .map((c) => ({ code: c, ...st[c], score: (st[c].recentAcc ?? st[c].acc) - Math.max(0, ((st[c].avg || 0) - 89) / 400) - (status[c] && status[c].s === 'shaky' ? 0.3 : 0) }));
      rows.sort((a, b) => a.score - b.score || b.n - a.n);
      return rows.filter((r) => r.score < 0.7 || (r.avg || 0) > 110).slice(0, limit);
    },

    /* Pick n questions for an ESAT module the way a paper would: spread across sections,
       unseen questions first, then the ones you saw longest ago; roughly easy → hard. */
    pickPaper(module, n = 27, opts = {}) {
      const hist = B.history();
      const exclude = new Set(opts.exclude || []);
      const pool = B.forModule(module).filter((q) => q.type === 'mcq' && !exclude.has(q.id) && (!opts.source || opts.source === 'any' || (opts.source === 'builtin' ? q.source === 'builtin' : q.source !== 'builtin')));
      const bySec = {};
      for (const q of pool) (bySec[q.section] || (bySec[q.section] = [])).push(q);
      const freshness = (q) => { const h = hist[q.id]; return h ? h.last : 0; };
      for (const s in bySec) bySec[s] = U.shuffle(bySec[s]).sort((a, b) => freshness(a) - freshness(b));
      const secs = U.shuffle(Object.keys(bySec));
      const chosen = [];
      while (chosen.length < n && secs.some((s) => bySec[s].length)) {
        for (const s of secs) {
          if (chosen.length >= n) break;
          if (bySec[s].length) chosen.push(bySec[s].shift());
        }
      }
      return chosen
        .map((q) => ({ q, k: q.difficulty + Math.random() * 1.2 }))
        .sort((a, b) => a.k - b.k).map((x) => x.q.id);
    },

    // Practice set for a filter. filter: {module, modules, section, spec, specs, only: 'unseen'|'wrong', source, type}
    pickPractice(filter, n = 10) {
      const hist = B.history();
      let pool = B.all();
      if (filter.module) pool = pool.filter((q) => q.module === filter.module);
      if (filter.modules) pool = pool.filter((q) => filter.modules.includes(q.module));
      if (filter.section) pool = pool.filter((q) => q.section === filter.section);
      if (filter.spec) pool = pool.filter((q) => q.spec === filter.spec || (q.specs || []).includes(filter.spec));
      if (filter.specs) pool = pool.filter((q) => filter.specs.includes(q.spec) || (q.specs || []).some((s) => filter.specs.includes(s)));
      if (filter.type) pool = pool.filter((q) => q.type === filter.type);
      if (filter.only === 'unseen') pool = pool.filter((q) => !hist[q.id]);
      if (filter.only === 'wrong') pool = pool.filter((q) => hist[q.id] && !hist[q.id].lastCorrect);
      if (filter.source === 'builtin') pool = pool.filter((q) => q.source === 'builtin');
      if (filter.source === 'mine') pool = pool.filter((q) => q.source !== 'builtin');
      // unseen first, then least recently seen, with shuffling inside each band
      pool = U.shuffle(pool).sort((a, b) => ((hist[a.id] || {}).last || 0) - ((hist[b.id] || {}).last || 0));
      return pool.slice(0, n).map((q) => q.id);
    },

    /* ---------------- topic review (spaced, across all your units) ----------------
       Each spec point you've started gets a "due" score: how long since you last practised it,
       relative to an interval that grows with how well you know it. */
    topicReview(units, opts = {}) {
      const st = B.stats().spec;
      const status = Store.specStatus();
      const counts = B.countBySpec();
      const now = Date.now();
      const rows = [];
      for (const u of units) {
        for (const p of Courses.points(u)) {
          const s = st[p.key];
          const mark = status[p.key] && status[p.key].s;
          if (!opts.includeUnstarted && !s && !mark) continue;
          const mastery = s ? (s.recentAcc ?? s.acc) : null;
          let days = mastery == null ? 0 : mastery < 0.5 ? 2 : mastery < 0.8 ? 6 : 18;
          if (mark === 'shaky') days = Math.min(days, 2);
          if (mark === 'learned' && mastery == null) days = 0; // learned but never tested: check it
          const since = s ? (now - s.last) / U.DAY : Infinity;
          const due = days === 0 ? Infinity : since / days;
          rows.push({ key: p.key, unit: u, mastery, mark, since, due, questions: counts[p.key] || 0 });
        }
      }
      if (opts.order === 'weak') rows.sort((a, b) => (a.mastery ?? -1) - (b.mastery ?? -1));
      else if (opts.order === 'mixed') rows.sort(() => Math.random() - 0.5);
      else rows.sort((a, b) => b.due - a.due);
      return rows;
    },
    // Questions for a set of spec points: one or two per point, in the order given.
    pickForSpecs(keys, n = 10) {
      const hist = B.history();
      const used = new Set();
      const out = [];
      for (let round = 0; round < 3 && out.length < n; round++) {
        for (const k of keys) {
          if (out.length >= n) break;
          const cands = B.forSpec(k).filter((q) => !used.has(q.id)).sort((a, b) => ((hist[a.id] || {}).last || 0) - ((hist[b.id] || {}).last || 0));
          if (cands.length) { used.add(cands[0].id); out.push(cands[0].id); }
        }
      }
      return out;
    },
  };

  window.Bank = B;
})();
