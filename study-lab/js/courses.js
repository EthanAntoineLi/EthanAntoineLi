/* Course registry. A course has units; a unit has topics (sections); a topic has spec points.
   - ESAT is one course whose units are the five ESAT modules (spec keys like "M2.3", kept as-is).
   - A-level courses come from data/courses/*.js (window.STUDY_COURSES) and from courses you add
     yourself; their spec keys are "<unitId>:<topic>.<point>", e.g. "fp3:1.2".
   Built-in courses can be edited – your edited copy (stored in this browser) replaces the built-in one. */
(function () {
  let cache = null;

  function normaliseCourse(c, takenIds) {
    const course = { id: c.id, name: c.name, short: c.short || c.name, board: c.board || '', kind: c.kind || 'alevel', custom: !!c.custom, edited: !!c.edited, units: [] };
    const idMap = {};
    for (const u0 of c.units || []) {
      const orig = String(u0.id).toLowerCase().replace(/[^a-z0-9_-]/g, '');
      // your own courses' units always carry the course id, so they can never take over (or lose) another
      // course's unit id when courses are added, edited, deleted or merged in from a backup
      let id = course.custom && !orig.startsWith(course.id + '-') ? course.id + '-' + orig : orig;
      if (takenIds.has(id)) id = course.id + '-' + id;
      takenIds.add(id);
      idMap[orig] = id;
      const unit = {
        id, course: course.id, short: u0.short || u0.id, code: u0.code || '', name: u0.name || u0.short || id,
        level: u0.level || '', prereqs: (u0.prereqs || []).map((p) => String(p).toLowerCase()), practical: !!u0.practical, sections: [],
      };
      for (const s0 of u0.sections || []) {
        const sec = { code: String(s0.code), title: s0.title, key: course.kind === 'esat' ? String(s0.code) : `${id}:${s0.code}`, unit: id, points: [] };
        for (const p0 of s0.points || []) {
          const key = course.kind === 'esat' ? String(p0.code) : `${id}:${p0.code}`;
          sec.points.push({ code: String(p0.code), key, title: p0.title || p0.code, text: p0.text || '', section: sec.key, unit: id });
        }
        unit.sections.push(sec);
      }
      course.units.push(unit);
    }
    course.units.forEach((u) => { u.prereqs = u.prereqs.map((p) => idMap[p] || p); });
    return course;
  }

  function build() {
    const taken = new Set();
    const courses = [];
    const esatShort = { maths1: 'Maths 1', maths2: 'Maths 2', physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology' };
    courses.push(normaliseCourse({
      id: 'esat', name: 'ESAT', short: 'ESAT', board: 'UAT-UK', kind: 'esat',
      units: (window.ESAT_SPEC || []).map((m) => ({ id: m.id, short: esatShort[m.id] || m.name, name: m.name, prereqs: m.id === 'maths1' ? [] : ['maths1'], sections: m.sections })),
    }, taken));
    const overrides = (window.Store && Store.courseOverrides()) || {};
    const builtins = (window.STUDY_COURSES || []).map((c) => overrides[c.id] ? Object.assign({}, overrides[c.id], { edited: true }) : c);
    const custom = ((window.Store && Store.customCourses()) || []).map((c) => Object.assign({}, c, { custom: true }));
    for (const c of builtins.concat(custom)) courses.push(normaliseCourse(c, taken));

    const units = {}, specs = {}, sections = {}, byCourse = {};
    for (const c of courses) {
      byCourse[c.id] = c;
      for (const u of c.units) {
        units[u.id] = u;
        for (const s of u.sections) {
          sections[s.key] = s;
          for (const p of s.points) specs[p.key] = { course: c, unit: u, section: s, point: p };
        }
      }
    }
    cache = { courses, units, specs, sections, byCourse };
  }

  const C = {
    invalidate() { cache = null; if (window.Bank) Bank.invalidate(); },
    all() { if (!cache) build(); return cache.courses; },
    course(id) { if (!cache) build(); return cache.byCourse[id] || null; },
    unit(id) { if (!cache) build(); return cache.units[id] || null; },
    spec(key) { if (!cache) build(); return cache.specs[key] || null; },
    section(key) { if (!cache) build(); return cache.sections[key] || null; },
    courseOfUnit(id) { const u = C.unit(id); return u ? C.course(u.course) : null; },
    points(unitId) { const u = C.unit(unitId); return u ? u.sections.flatMap((s) => s.points) : []; },
    // "FP3 1.2" for A-level, "M2.3" for ESAT
    label(key) {
      const i = C.spec(key);
      if (!i) return key;
      return i.course.kind === 'esat' ? i.point.code : `${i.unit.short} ${i.point.code}`;
    },
    unitLabel(id) { const u = C.unit(id); return u ? (u.course === 'esat' ? u.short : `${u.short}`) : id; },
    // prerequisite chain: every earlier unit this one builds on, directly or indirectly, no duplicates
    prereqChain(unitId) {
      const out = [], seen = new Set([unitId]);
      const visit = (id) => {
        const u = C.unit(id);
        if (!u) return;
        for (const p of u.prereqs) if (!seen.has(p) && C.unit(p)) { seen.add(p); out.push(p); visit(p); }
      };
      visit(unitId);
      return out;
    },

    /* ---- plain-text course format (for editing / adding your own syllabus) ----
       # Unit: FP3 | Further Pure Mathematics 3 | A2 | prereqs: fp1, p4
       ## 1 Hyperbolic functions
       1.1 Definitions | Definitions of sinh, cosh, tanh and their graphs.  */
    toText(course) {
      const lines = [`# Course: ${course.name}${course.board ? ' | ' + course.board : ''}`];
      for (const u of course.units) {
        // prerequisites inside this course are written by their short name (readable, survives an edit); others by id
        const pre = u.prereqs.map((p) => { const t = course.units.find((x) => x.id === p); return t ? t.short : p; });
        lines.push('', `# Unit: ${u.short} | ${u.name} | ${u.level || ''} | prereqs: ${pre.join(', ')}${u.code ? ' | code: ' + u.code : ''}`);
        for (const s of u.sections) {
          lines.push(`## ${s.code} ${s.title}`);
          for (const p of s.points) lines.push(`${p.code} ${p.title}${p.text ? ' | ' + p.text : ''}`);
        }
      }
      return lines.join('\n');
    },
    /* base: the course being edited. Units keep their ids (matched by short name, then exam code), so ticks,
       scores and questions stay attached when a list is edited and saved. */
    fromText(text, base = {}) {
      const course = { id: base.id, name: base.name || 'My course', short: base.custom ? undefined : base.short, board: base.board || '', kind: 'alevel', units: [] };
      const norm = (x) => String(x).toLowerCase().replace(/[^a-z0-9]+/g, '');
      const old = base.units || [];
      const used = new Set();
      let unit = null, sec = null;
      for (const raw of String(text).split(/\r?\n/)) {
        const line = raw.trim();
        if (!line) continue;
        let m;
        if ((m = /^#\s*Course:\s*(.*)$/i.exec(line))) {
          const [name, board] = m[1].split('|').map((x) => x.trim());
          course.name = name || course.name; if (board) course.board = board;
        } else if ((m = /^#\s*Unit:\s*(.*)$/i.exec(line))) {
          const parts = m[1].split('|').map((x) => x.trim());
          const short = parts[0] || 'Unit ' + (course.units.length + 1);
          const pre = parts.find((x) => /^prereqs?:/i.test(x));
          const code = parts.find((x) => /^code:/i.test(x));
          const codeV = code ? code.replace(/^code:/i, '').trim() : '';
          const prev = old.find((u) => !used.has(u.id) && norm(u.short) === norm(short)) || (codeV && old.find((u) => !used.has(u.id) && u.code === codeV));
          const baseId = prev ? prev.id : (norm(short) || 'unit');
          let id = baseId;
          for (let k = 2; used.has(id); k++) id = baseId + '-' + k;
          used.add(id);
          unit = {
            id, short, name: parts[1] || short,
            level: (parts[2] && /^(AS|A2)$/i.test(parts[2])) ? parts[2].toUpperCase() : '',
            prereqs: pre ? pre.replace(/^prereqs?:/i, '').split(',').map((x) => x.trim()).filter(Boolean) : [],
            code: codeV, sections: [],
          };
          if (prev && prev.practical) unit.practical = true;
          course.units.push(unit); sec = null;
        } else if ((m = /^##\s*([\w.]+)\s+(.*)$/.exec(line))) {
          if (!unit) { unit = { id: 'unit1', short: 'Unit 1', name: 'Unit 1', prereqs: [], sections: [] }; course.units.push(unit); }
          sec = { code: m[1], title: m[2], points: [] }; unit.sections.push(sec);
        } else if ((m = /^([\w]+(?:\.[\w]+)+)\s+(.*)$/.exec(line))) {
          if (!unit) { unit = { id: 'unit1', short: 'Unit 1', name: 'Unit 1', prereqs: [], sections: [] }; course.units.push(unit); }
          if (!sec) { sec = { code: m[1].split('.')[0], title: 'Topic ' + m[1].split('.')[0], points: [] }; unit.sections.push(sec); }
          const [title, ...rest] = m[2].split('|');
          sec.points.push({ code: m[1], title: title.trim(), text: rest.join('|').trim() });
        }
      }
      // prerequisites: a unit of this course (by short name or id), else any existing unit id
      course.units.forEach((u) => {
        u.prereqs = [...new Set(u.prereqs.map((p) => {
          const t = course.units.find((x) => norm(x.short) === norm(p) || x.id === p.toLowerCase());
          if (t) return t.id;
          const o = old.find((x) => norm(x.short) === norm(p)); // renamed unit: same id, new short
          if (o && course.units.some((x) => x.id === o.id)) return o.id;
          return p.toLowerCase().replace(/[^a-z0-9_-]+/g, '');
        }).filter((p) => p && p !== u.id))];
      });
      return course;
    },
  };

  window.Courses = C;
})();
