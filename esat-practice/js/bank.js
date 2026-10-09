/* Question bank: built-in questions (data/questions-*.js) + your own (AI-made / imported),
   with your personal corrections applied. Also spec lookups and per-spec statistics. */
(function () {
  let cache = null;
  let specIdx = null;

  function buildSpecIndex() {
    specIdx = {};
    for (const m of window.ESAT_SPEC) {
      for (const s of m.sections) {
        for (const p of s.points) specIdx[p.code] = { module: m.id, moduleName: m.name, section: s, point: p };
      }
    }
  }

  function normalise(q) {
    q = Object.assign({}, q);
    if (typeof q.answer === 'string') q.answer = U.letterIndex(q.answer);
    q.difficulty = q.difficulty || 2;
    q.source = q.source || 'builtin';
    if (!q.module && q.spec) q.module = B.specInfo(q.spec)?.module;
    q.section = q.spec ? q.spec.split('.')[0] : '';
    return q;
  }

  const B = {
    invalidate() { cache = null; },

    specInfo(code) { if (!specIdx) buildSpecIndex(); return specIdx[code] || null; },
    specTitle(code) { const i = B.specInfo(code); return i ? i.point.title : code; },
    modules() { return window.ESAT_SPEC; },
    module(id) { return window.ESAT_SPEC.find((m) => m.id === id); },
    sectionOf(code) { const i = B.specInfo(code); return i ? i.section : null; },

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
    forSpec(code) { return B.all().filter((q) => q.spec === code); },
    forSection(code) { return B.all().filter((q) => q.section === code); },

    // Per-question history: {qid: {n, right, last, lastCorrect}}
    history() {
      const h = {};
      for (const a of Store.attempts()) {
        const x = h[a.qid] || (h[a.qid] = { n: 0, right: 0, last: 0, lastCorrect: false });
        x.n++; if (a.correct) x.right++;
        if (a.at >= x.last) { x.last = a.at; x.lastCorrect = a.correct; }
      }
      return h;
    },

    // Stats keyed by spec code (and by section code and module): {n, right, time, timed}
    stats(attempts) {
      attempts = attempts || Store.liveAttempts();
      const out = { spec: {}, section: {}, module: {} };
      const add = (bucket, key, a) => {
        const x = bucket[key] || (bucket[key] = { n: 0, right: 0, time: 0, timed: 0 });
        x.n++; if (a.correct) x.right++;
        if (a.time > 0 && a.time < 1800) { x.time += a.time; x.timed++; }
      };
      for (const a of attempts) {
        if (a.spec) { add(out.spec, a.spec, a); add(out.section, a.spec.split('.')[0], a); }
        if (a.module) add(out.module, a.module, a);
      }
      for (const b of [out.spec, out.section, out.module]) {
        for (const k in b) { b[k].acc = b[k].n ? b[k].right / b[k].n : null; b[k].avg = b[k].timed ? b[k].time / b[k].timed : null; }
      }
      return out;
    },

    // Weakest spec points (needs some data): sorted by a blend of accuracy and pace.
    weakest(modules, limit = 6) {
      const st = B.stats().spec;
      const rows = Object.keys(st).filter((c) => st[c].n >= 2 && (!modules || modules.includes(B.specInfo(c)?.module)))
        .map((c) => ({ code: c, ...st[c], score: st[c].acc - Math.max(0, ((st[c].avg || 0) - 89) / 400) }));
      rows.sort((a, b) => a.score - b.score || b.n - a.n);
      return rows.filter((r) => r.acc < 0.85 || (r.avg || 0) > 110).slice(0, limit);
    },

    /* Pick n questions for a module the way a paper would: spread across sections,
       unseen questions first, then the ones you saw longest ago; roughly easy → hard. */
    pickPaper(module, n = 27, opts = {}) {
      const hist = B.history();
      const exclude = new Set(opts.exclude || []);
      const pool = B.forModule(module).filter((q) => !exclude.has(q.id) && (!opts.source || opts.source === 'any' || (opts.source === 'builtin' ? q.source === 'builtin' : q.source !== 'builtin')));
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

    // Practice set for a filter. filter: {module, section, spec, only: 'unseen'|'wrong'|'all'}
    pickPractice(filter, n = 10) {
      const hist = B.history();
      let pool = B.all();
      if (filter.module) pool = pool.filter((q) => q.module === filter.module);
      if (filter.modules) pool = pool.filter((q) => filter.modules.includes(q.module));
      if (filter.section) pool = pool.filter((q) => q.section === filter.section);
      if (filter.spec) pool = pool.filter((q) => q.spec === filter.spec);
      if (filter.specs) pool = pool.filter((q) => filter.specs.includes(q.spec));
      if (filter.only === 'unseen') pool = pool.filter((q) => !hist[q.id]);
      if (filter.only === 'wrong') pool = pool.filter((q) => hist[q.id] && !hist[q.id].lastCorrect);
      if (filter.source === 'builtin') pool = pool.filter((q) => q.source === 'builtin');
      if (filter.source === 'mine') pool = pool.filter((q) => q.source !== 'builtin');
      // unseen first, then least recently seen, with shuffling inside each band
      pool = U.shuffle(pool).sort((a, b) => ((hist[a.id] || {}).last || 0) - ((hist[b.id] || {}).last || 0));
      return pool.slice(0, n).map((q) => q.id);
    },
  };

  window.Bank = B;
})();
