(function () {
  "use strict";

  var STORAGE_KEY_V1 = "bslLearnProgress_v1";
  var STORAGE_KEY = "bslLearnProgress_v2";
  var SVG_NS = "http://www.w3.org/2000/svg";
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var LEECH_THRESHOLD = 3;
  var PACK_IDS = ["family", "feelings", "school", "food", "play"];
  var ALLOWED_HOSTS = {
    "www.signbsl.com": 1, "signbsl.com": 1,
    "www.british-sign.co.uk": 1, "british-sign.co.uk": 1,
    "bslsignbank.ucl.ac.uk": 1,
    "www.youtube.com": 1, "youtube.com": 1, "youtu.be": 1,
    "www.bslzone.co.uk": 1, "bslzone.co.uk": 1,
    "lumotv.co.uk": 1, "www.lumotv.co.uk": 1,
    "theschoolofsigns.org.uk": 1, "www.theschoolofsigns.org.uk": 1,
    "www.ndcs.org.uk": 1, "ndcs.org.uk": 1,
    "bslsearch.co.uk": 1, "www.bslsearch.co.uk": 1,
    "commandinghands.co.uk": 1, "www.commandinghands.co.uk": 1
  };

  var data = window.BSL_DATA || {};
  if (!Array.isArray(data.alphabet)) data.alphabet = [];
  if (!Array.isArray(data.beginnerSigns)) data.beginnerSigns = [];
  if (!Array.isArray(data.drillWords)) data.drillWords = [];
  if (!data.packs || typeof data.packs !== "object") data.packs = {};
  if (!Array.isArray(data.stories)) data.stories = [];
  if (!Array.isArray(data.demoSources)) data.demoSources = [];
  if (!Array.isArray(data.badges)) data.badges = [];

  var store = null;
  var state = null;
  var booted = false;
  var currentScreen = "home";
  var currentModule = "alphabet";
  var learnIndex = 0;
  var mirrorIndex = 0;
  var mirrorStream = null;
  var mirrorTick = null;
  var mirrorGen = 0;
  var drillTimer = null;
  var quizTimer = null;
  var quizToken = 0;
  var drill = null;
  var lastUtterance = "Welcome to UK BSL Learn. This is British Sign Language, not American Sign Language.";
  var sessionAnchor = Date.now();
  var sessionFlushTimer = null;
  var queueMode = null;
  var storyId = null;
  var storyStep = 0;
  var storyCompletedId = null;
  var storyCoachMode = false;
  var guideLetterIndex = 0;
  var guideStepIndex = 0;
  var guideMountedLetter = null;
  var guideEndCelebrated = false;
  var guidePlayToken = 0;
  var guidePlayTimer = null;
  var GUIDE_STEPS = [
    { id: "name", label: "1 · Letter", title: "Name the letter" },
    { id: "how", label: "2 · Handshape", title: "Handshape / How" },
    { id: "move", label: "3 · Movement", title: "Movement" },
    { id: "face", label: "4 · Face", title: "Face / look at partner" }
  ];
  var pendingGateAction = null;
  var demoSrcChoice = {};
  var skipProgressSave = false;
  var progressKeyKnownPresent = false;

  function isPlainObject(v) {
    return !!v && typeof v === "object" && !Array.isArray(v);
  }
  function defaultQuizArea() { return { correct: 0, wrong: 0 }; }
  function blankDay() {
    return { drills: 0, quizzes: 0, mirrorMinutes: 0, score: 0, letters: 0, signs: 0, minutes: 0 };
  }
  function defaultProfile(id, name, avatar) {
    return {
      id: id || "learner-1",
      name: name || "Learner 1",
      avatar: avatar || "🌟",
      audioOn: true, streak: 0, stars: 0, xp: 0, gems: 0,
      lastActiveDate: null, difficulty: 1,
      lettersLearned: {}, signsLearned: {}, favourites: {}, badges: {}, srs: {},
      quizStats: {
        correct: 0, wrong: 0, bestStreak: 0, currentStreak: 0,
        byArea: { alphabet: defaultQuizArea(), greetings: defaultQuizArea() }
      },
      weeklyLog: {}, history: []
    };
  }
  function defaultStore() {
    var p = defaultProfile("learner-1", "Learner 1", "🌟");
    return { version: 2, softPin: "1234", kidMode: false, activeProfileId: "learner-1", profiles: { "learner-1": p } };
  }
  function asNumberOrNull(v, min, max) {
    if (typeof v === "boolean" || v == null) return null;
    var n = typeof v === "number" ? v : (typeof v === "string" ? Number(v) : NaN);
    if (!isFinite(n)) return null;
    if (typeof min === "number" && n < min) n = min;
    if (typeof max === "number" && n > max) n = max;
    return n;
  }
  function asInt(v, fallback, min, max) {
    var n = asNumberOrNull(v, min, max);
    return n == null ? fallback : Math.round(n);
  }
  function asFloat(v, fallback, min, max) {
    var n = asNumberOrNull(v, min, max);
    return n == null ? fallback : n;
  }
  function todayKey() {
    var d = new Date();
    var m = String(d.getMonth() + 1), day = String(d.getDate());
    if (m.length < 2) m = "0" + m;
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function allSignLists() {
    var lists = [data.beginnerSigns];
    PACK_IDS.forEach(function (pid) {
      if (Array.isArray(data.packs[pid])) lists.push(data.packs[pid]);
    });
    return lists;
  }
  function knownSignIds() {
    var set = {};
    allSignLists().forEach(function (list) {
      list.forEach(function (s) {
        if (s && typeof s.id === "string" && /^[a-z0-9-]{1,40}$/.test(s.id)) set[s.id] = 1;
      });
    });
    return set;
  }
  function findSignById(id) {
    var lists = allSignLists();
    for (var i = 0; i < lists.length; i++) {
      for (var j = 0; j < lists[i].length; j++) {
        if (lists[i][j] && lists[i][j].id === id) return lists[i][j];
      }
    }
    return null;
  }

  function sanitizeProfile(raw) {
    var next = defaultProfile(
      (raw && typeof raw.id === "string" && /^[a-z0-9-]{1,40}$/.test(raw.id)) ? raw.id : "learner-1",
      (raw && typeof raw.name === "string") ? String(raw.name).slice(0, 40) : "Learner 1",
      (raw && typeof raw.avatar === "string") ? String(raw.avatar).slice(0, 8) : "🌟"
    );
    if (!isPlainObject(raw)) return next;
    next.audioOn = typeof raw.audioOn === "boolean" ? raw.audioOn : true;
    next.streak = asInt(raw.streak, 0, 0, 9999);
    next.stars = asInt(raw.stars, 0, 0, 1000000);
    next.xp = asInt(raw.xp, 0, 0, 10000000);
    next.gems = asInt(raw.gems, 0, 0, 1000000);
    next.difficulty = asInt(raw.difficulty, 1, 1, 3);
    next.lastActiveDate = (typeof raw.lastActiveDate === "string" && DATE_RE.test(raw.lastActiveDate)) ? raw.lastActiveDate : null;
    if (isPlainObject(raw.lettersLearned)) {
      Object.keys(raw.lettersLearned).forEach(function (k) {
        if (!/^[A-Z]$/.test(k)) return;
        var t = asNumberOrNull(raw.lettersLearned[k], 0, 1e15);
        if (t == null && raw.lettersLearned[k] === true) t = Date.now();
        if (t != null) next.lettersLearned[k] = t;
      });
    }
    var signIds = knownSignIds();
    if (isPlainObject(raw.signsLearned)) {
      Object.keys(raw.signsLearned).forEach(function (k) {
        if (!signIds[k]) return;
        var t = asNumberOrNull(raw.signsLearned[k], 0, 1e15);
        if (t == null && raw.signsLearned[k] === true) t = Date.now();
        if (t != null) next.signsLearned[k] = t;
      });
    }
    if (isPlainObject(raw.favourites)) {
      Object.keys(raw.favourites).forEach(function (k) {
        if (!signIds[k] && !/^[A-Z]$/.test(k)) return;
        if (raw.favourites[k]) next.favourites[k] = 1;
      });
    }
    if (isPlainObject(raw.badges)) {
      Object.keys(raw.badges).forEach(function (k) {
        if (!/^[a-z0-9-]{1,40}$/.test(k)) return;
        var t = asNumberOrNull(raw.badges[k], 0, 1e15);
        if (t != null) next.badges[k] = t;
      });
    }
    if (isPlainObject(raw.srs)) {
      Object.keys(raw.srs).forEach(function (k) {
        if (!signIds[k] && !/^[A-Z]$/.test(k)) return;
        var s = raw.srs[k];
        if (!isPlainObject(s)) return;
        next.srs[k] = {
          ease: asFloat(s.ease, 2.5, 1.3, 3.5),
          interval: asInt(s.interval, 0, 0, 3650),
          nextDue: (typeof s.nextDue === "string" && DATE_RE.test(s.nextDue)) ? s.nextDue : todayKey(),
          reps: asInt(s.reps, 0, 0, 100000),
          lapses: asInt(s.lapses, 0, 0, 100000),
          failsRecent: asInt(s.failsRecent, 0, 0, 100),
          success: asInt(s.success, 0, 0, 100000),
          fail: asInt(s.fail, 0, 0, 100000)
        };
      });
    }
    if (isPlainObject(raw.quizStats)) {
      var qs = raw.quizStats;
      next.quizStats.correct = asInt(qs.correct, 0, 0, 10000000);
      next.quizStats.wrong = asInt(qs.wrong, 0, 0, 10000000);
      next.quizStats.bestStreak = asInt(qs.bestStreak, 0, 0, 10000000);
      next.quizStats.currentStreak = asInt(qs.currentStreak, 0, 0, 10000000);
      if (isPlainObject(qs.byArea)) {
        Object.keys(qs.byArea).forEach(function (area) {
          if (!/^[a-z0-9-]{1,40}$/.test(area)) return;
          var a = qs.byArea[area];
          if (!isPlainObject(a)) return;
          next.quizStats.byArea[area] = { correct: asInt(a.correct, 0, 0, 10000000), wrong: asInt(a.wrong, 0, 0, 10000000) };
        });
      }
    }
    if (isPlainObject(raw.weeklyLog)) {
      Object.keys(raw.weeklyLog).forEach(function (k) {
        if (!DATE_RE.test(k)) return;
        var day = raw.weeklyLog[k];
        if (!isPlainObject(day)) return;
        next.weeklyLog[k] = {
          drills: asInt(day.drills, 0, 0, 100000), quizzes: asInt(day.quizzes, 0, 0, 100000),
          mirrorMinutes: asFloat(day.mirrorMinutes, 0, 0, 100000), score: asInt(day.score, 0, 0, 1000000),
          letters: asInt(day.letters, 0, 0, 100000), signs: asInt(day.signs, 0, 0, 100000),
          minutes: asFloat(day.minutes, 0, 0, 100000)
        };
      });
    }
    if (Array.isArray(raw.history)) {
      raw.history.slice(0, 100).forEach(function (h) {
        if (!isPlainObject(h)) return;
        if (typeof h.kind !== "string" || !/^(drill|quiz|letter|sign|mirror|story|review)$/.test(h.kind)) return;
        next.history.push({ t: typeof h.t === "string" ? h.t.slice(0, 40) : "", kind: h.kind, points: asInt(h.points, 0, 0, 1000) });
      });
    }
    return next;
  }

  function loadStore() {
    var fresh = defaultStore();
    try {
      var text2 = localStorage.getItem(STORAGE_KEY);
      if (text2 && typeof text2 === "string") {
        var raw2 = JSON.parse(text2);
        if (isPlainObject(raw2) && Number(raw2.version) === 2) {
          var st = defaultStore();
          st.softPin = (typeof raw2.softPin === "string" && /^\d{1,8}$/.test(raw2.softPin)) ? raw2.softPin : "1234";
          st.kidMode = !!raw2.kidMode;
          st.profiles = {};
          if (isPlainObject(raw2.profiles)) {
            Object.keys(raw2.profiles).forEach(function (pid) {
              if (!/^[a-z0-9-]{1,40}$/.test(pid)) return;
              st.profiles[pid] = sanitizeProfile(Object.assign({}, raw2.profiles[pid], { id: pid }));
            });
          }
          if (!Object.keys(st.profiles).length) st.profiles["learner-1"] = defaultProfile();
          var aid = typeof raw2.activeProfileId === "string" ? raw2.activeProfileId : "learner-1";
          st.activeProfileId = st.profiles[aid] ? aid : Object.keys(st.profiles)[0];
          return st;
        }
      }
    } catch (e) {}
    try {
      var text1 = localStorage.getItem(STORAGE_KEY_V1);
      if (text1 && typeof text1 === "string") {
        var raw1 = JSON.parse(text1);
        if (isPlainObject(raw1)) {
          var migrated = defaultStore();
          migrated.profiles["learner-1"] = sanitizeProfile(Object.assign({}, raw1, { id: "learner-1", name: "Learner 1", avatar: "🌟" }));
          migrated.activeProfileId = "learner-1";
          migrated._dropV1AfterSave = true;
          return migrated;
        }
      }
    } catch (e2) {}
    return fresh;
  }

  function activeProfile() {
    if (!store || !store.profiles) return defaultProfile();
    return store.profiles[store.activeProfileId] || store.profiles[Object.keys(store.profiles)[0]] || defaultProfile();
  }
  function syncStateFromStore() { state = activeProfile(); }

  function sanitizeRuntime() {
    if (!state) return;
    state.difficulty = asInt(state.difficulty, 1, 1, 3);
    state.streak = asInt(state.streak, 0, 0, 9999);
    state.stars = asInt(state.stars, 0, 0, 1000000);
    state.xp = asInt(state.xp, 0, 0, 10000000);
    state.gems = asInt(state.gems, 0, 0, 1000000);
    if (!isPlainObject(state.weeklyLog)) state.weeklyLog = {};
    if (!isPlainObject(state.lettersLearned)) state.lettersLearned = {};
    if (!isPlainObject(state.signsLearned)) state.signsLearned = {};
    if (!isPlainObject(state.favourites)) state.favourites = {};
    if (!isPlainObject(state.badges)) state.badges = {};
    if (!isPlainObject(state.srs)) state.srs = {};
    if (!isPlainObject(state.quizStats)) state.quizStats = defaultProfile().quizStats;
    store.profiles[state.id] = state;
  }
  function saveState() {
    if (skipProgressSave) return;
    try {
      var existing = localStorage.getItem(STORAGE_KEY);
      if (progressKeyKnownPresent && (existing == null || existing === "")) {
        skipProgressSave = true;
        return;
      }
    } catch (e0) {}
    sanitizeRuntime();
    var dropV1 = !!store._dropV1AfterSave;
    if (dropV1) delete store._dropV1AfterSave;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      progressKeyKnownPresent = true;
      if (dropV1) {
        try { localStorage.removeItem(STORAGE_KEY_V1); } catch (e1) {}
      }
    } catch (e) {}
    renderHeader();
    if (currentScreen === "home") renderHomeBits();
  }

  function ensureTodayLog() {
    var k = todayKey();
    if (!isPlainObject(state.weeklyLog[k])) state.weeklyLog[k] = blankDay();
    var day = state.weeklyLog[k];
    day.drills = asInt(day.drills, 0, 0, 100000);
    day.quizzes = asInt(day.quizzes, 0, 0, 100000);
    day.mirrorMinutes = asFloat(day.mirrorMinutes, 0, 0, 100000);
    day.score = asInt(day.score, 0, 0, 1000000);
    day.letters = asInt(day.letters, 0, 0, 100000);
    day.signs = asInt(day.signs, 0, 0, 100000);
    day.minutes = asFloat(day.minutes, 0, 0, 100000);
    return day;
  }
  function touchStreak() {
    var today = todayKey();
    if (state.lastActiveDate === today) return;
    if (!state.lastActiveDate) {
      /* Bare migrate / first open: keep a positive migrated streak; otherwise start at 1. */
      if (asInt(state.streak, 0, 0, 9999) < 1) state.streak = 1;
    } else {
      var prev = new Date(state.lastActiveDate + "T12:00:00");
      var now = new Date(today + "T12:00:00");
      var diff = Math.round((now - prev) / 86400000);
      state.streak = diff === 1 ? state.streak + 1 : 1;
    }
    state.lastActiveDate = today;
    ensureTodayLog();
    if (state.streak >= 7) awardBadge("streak-7");
    awardXp(5, 1);
    saveState();
  }
  function awardXp(xp, gems) {
    state.xp = Math.min(10000000, asInt(state.xp, 0, 0, 10000000) + asInt(xp, 0, 0, 1000));
    state.gems = Math.min(1000000, asInt(state.gems, 0, 0, 1000000) + asInt(gems, 0, 0, 100));
    if (state.gems >= 25) awardBadge("gem-collector");
  }
  function awardBadge(id) {
    if (!id || state.badges[id]) return false;
    state.badges[id] = Date.now();
    celebrate("Badge unlocked");
    return true;
  }
  function celebrate(msg) {
    var burst = $("celeb-burst");
    if (burst) {
      clearChildren(burst);
      burst.appendChild(document.createTextNode("✨💎⭐"));
      burst.classList.remove("show");
      void burst.offsetWidth;
      burst.classList.add("show");
      setTimeout(function () { burst.classList.remove("show"); }, 900);
    }
    var home = $("home-celebrate");
    if (home && currentScreen === "home" && msg) {
      home.style.display = "block";
      home.className = "feedback ok";
      home.textContent = msg;
    }
  }
  function logActivity(kind, points) {
    touchStreak();
    var log = ensureTodayLog();
    var pts = asInt(points, 1, 0, 1000);
    if (kind === "drill") log.drills += 1;
    if (kind === "quiz" || kind === "review") log.quizzes += 1;
    if (kind === "letter") log.letters += 1;
    if (kind === "sign") log.signs += 1;
    if (kind === "mirror") log.mirrorMinutes = Math.min(100000, log.mirrorMinutes + asFloat(points, 1, 0, 1000));
    log.score = Math.min(1000000, log.score + (kind === "mirror" ? 1 : pts));
    state.history.unshift({ t: new Date().toISOString(), kind: kind, points: pts });
    state.history = state.history.slice(0, 100);
    saveState();
  }
  function flushSessionMinutes() {
    if (skipProgressSave) return;
    var now = Date.now();
    var elapsed = (now - sessionAnchor) / 60000;
    sessionAnchor = now;
    if (!(elapsed > 0) || elapsed > 10) return;
    var log = ensureTodayLog();
    log.minutes = Math.min(100000, Math.round((log.minutes + elapsed) * 100) / 100);
    saveState();
    if (currentScreen === "parent") renderParent();
  }
  function cancelSpeech() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {}
  }
  function speak(text, opts) {
    var force = !!(opts && opts.force);
    if (text) lastUtterance = String(text);
    if ((!state.audioOn && !force) || !lastUtterance) {
      if (opts && typeof opts.onend === "function") {
        setTimeout(opts.onend, 0);
      }
      return;
    }
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
      if (opts && typeof opts.onend === "function") {
        setTimeout(opts.onend, 2500);
      }
      return;
    }
    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(lastUtterance);
      u.lang = "en-GB";
      u.rate = (opts && opts.rate) || 0.95;
      var voices = typeof window.speechSynthesis.getVoices === "function" ? window.speechSynthesis.getVoices() : [];
      for (var i = 0; i < voices.length; i++) {
        var lang = (voices[i].lang || "").toLowerCase().replace("_", "-");
        if (lang.indexOf("en-gb") === 0) { u.voice = voices[i]; break; }
      }
      if (opts && typeof opts.onend === "function") {
        var done = false;
        var finish = function () {
          if (done) return;
          done = true;
          opts.onend();
        };
        u.onend = finish;
        u.onerror = finish;
        setTimeout(finish, Math.min(60000, Math.max(6000, String(lastUtterance).length * 70)));
      }
      window.speechSynthesis.speak(u);
    } catch (e) {
      if (opts && typeof opts.onend === "function") setTimeout(opts.onend, 0);
    }
  }
  function beep(ok) {
    if (!state.audioOn) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      var ctx = new AC();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = ok ? 880 : 260;
      g.gain.value = ok ? 0.045 : 0.03;
      o.start();
      setTimeout(function () { try { o.stop(); } catch (e) {} try { ctx.close(); } catch (e2) {} }, ok ? 110 : 180);
    } catch (e) {}
  }
  function $(id) { return document.getElementById(id); }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function button(label, className, fn) {
    var b = el("button", className, label);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }
  function clearChildren(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  function safeHttpsUrl(url) {
    if (typeof url !== "string" || url.length > 400) return null;
    try {
      var u = new URL(url);
      if (u.protocol !== "https:") return null;
      if (!ALLOWED_HOSTS[u.hostname]) return null;
      return u.href;
    } catch (e) { return null; }
  }
  function makeLink(href, label) {
    var safe = safeHttpsUrl(href);
    if (!safe) return null;
    var a = document.createElement("a");
    a.className = "link-btn"; a.href = safe; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.textContent = label;
    return a;
  }
  function handDiagram(glyph, title) {
    var wrap = el("div", "hand-visual");
    wrap.appendChild(el("div", "big-glyph", glyph));
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 320 120");
    svg.setAttribute("class", "hand-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", title || "BSL prompt");
    function add(tag, attrs) {
      var n = document.createElementNS(SVG_NS, tag);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      svg.appendChild(n);
      return n;
    }
    add("rect", { x: "8", y: "8", width: "304", height: "104", rx: "18", fill: "#e0f2fe", stroke: "#0284c7", "stroke-width": "3" });
    add("ellipse", { cx: "110", cy: "62", rx: "36", ry: "28", fill: "#bae6fd", stroke: "#0369a1" });
    add("ellipse", { cx: "210", cy: "58", rx: "32", ry: "26", fill: "#ddd6fe", stroke: "#6d28d9" });
    var caption = add("text", { x: "160", y: "28", "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#5b21b6" });
    caption.textContent = "UK BSL · two hands";
    wrap.appendChild(svg);
    return wrap;
  }
  function levelName() {
    if (state.difficulty <= 1) return "beginner";
    if (state.difficulty === 2) return "growing";
    return "confident";
  }
  function itemKey(item) { return item ? (item.letter || item.id || null) : null; }
  function isFavourite(item) { var k = itemKey(item); return !!(k && state.favourites[k]); }
  function toggleFavourite(item) {
    var k = itemKey(item);
    if (!k) return;
    if (state.favourites[k]) delete state.favourites[k];
    else state.favourites[k] = 1;
    if (Object.keys(state.favourites).length >= 10) awardBadge("fav-10");
    saveState();
  }
  function ensureSrs(key) {
    if (!state.srs[key]) {
      state.srs[key] = { ease: 2.5, interval: 0, nextDue: todayKey(), reps: 0, lapses: 0, failsRecent: 0, success: 0, fail: 0 };
    }
    return state.srs[key];
  }
  function addDays(iso, n) {
    var p = iso.split("-");
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    d.setDate(d.getDate() + n);
    var m = String(d.getMonth() + 1), day = String(d.getDate());
    if (m.length < 2) m = "0" + m;
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function srsReview(key, success) {
    if (!key) return;
    var s = ensureSrs(key);
    if (success) {
      s.success += 1; s.failsRecent = Math.max(0, s.failsRecent - 1); s.reps += 1;
      if (s.interval <= 0) s.interval = 1;
      else if (s.interval === 1) s.interval = 3;
      else s.interval = Math.min(3650, Math.round(s.interval * s.ease));
      s.ease = Math.min(3.5, s.ease + 0.05);
      s.nextDue = addDays(todayKey(), s.interval);
      if (s.lapses >= LEECH_THRESHOLD && s.failsRecent === 0) awardBadge("leech-cleared");
    } else {
      s.fail += 1; s.failsRecent += 1; s.lapses += 1; s.reps = 0; s.interval = 0;
      s.ease = Math.max(1.3, s.ease - 0.2);
      s.nextDue = todayKey();
    }
  }
  function dueReviewKeys() {
    var today = todayKey(), out = [];
    Object.keys(state.srs).forEach(function (k) {
      var s = state.srs[k];
      if (s && typeof s.nextDue === "string" && s.nextDue <= today) out.push(k);
    });
    return out;
  }
  function leechKeys() {
    var out = [];
    Object.keys(state.srs).forEach(function (k) {
      var s = state.srs[k];
      if (s && asInt(s.failsRecent, 0, 0, 100) >= LEECH_THRESHOLD) out.push(k);
    });
    return out;
  }
  function resolveKeyToItem(key) {
    if (/^[A-Z]$/.test(key)) {
      for (var i = 0; i < data.alphabet.length; i++) if (data.alphabet[i].letter === key) return data.alphabet[i];
      return null;
    }
    return findSignById(key);
  }
  function itemsFromKeys(keys) {
    var out = [];
    keys.forEach(function (k) { var it = resolveKeyToItem(k); if (it) out.push(it); });
    return out;
  }

  function localDemoUrl() {
    return (data.localDemo && typeof data.localDemo === "string") ? data.localDemo : "assets/media/demo-loop.mp4";
  }
  function mountDemoPlayer(parent, item) {
    if (!parent) return;
    var wrap = el("div", "demo-player");
    var vid = document.createElement("video");
    vid.setAttribute("playsinline", "");
    vid.setAttribute("controls", "");
    vid.setAttribute("preload", "auto");
    vid.muted = true;
    vid.loop = true;
    vid.src = localDemoUrl();
    vid.playbackRate = 0.75;
    wrap.appendChild(vid);
    var controls = el("div", "demo-controls");
    function rateBtn(r) {
      controls.appendChild(button(r + "×", null, function () { vid.playbackRate = r; }));
    }
    rateBtn(0.25); rateBtn(0.5); rateBtn(0.75); rateBtn(1);
    var loopBtn = button("Loop: on", null, function () {
      vid.loop = !vid.loop;
      loopBtn.textContent = vid.loop ? "Loop: on" : "Loop: off";
    });
    controls.appendChild(loopBtn);
    controls.appendChild(button("Play/Pause", null, function () {
      if (vid.paused) vid.play().catch(function () {}); else vid.pause();
    }));
    controls.appendChild(button("Restart", null, function () {
      vid.currentTime = 0; vid.play().catch(function () {});
    }));
    var scrubLabel = el("label", null, "Scrub ");
    var scrub = document.createElement("input");
    scrub.type = "range"; scrub.min = "0"; scrub.max = "100"; scrub.value = "0";
    scrub.addEventListener("input", function () {
      if (!isFinite(vid.duration) || vid.duration <= 0) return;
      vid.currentTime = (Number(scrub.value) / 100) * vid.duration;
    });
    vid.addEventListener("timeupdate", function () {
      if (!isFinite(vid.duration) || vid.duration <= 0) return;
      scrub.value = String(Math.round((vid.currentTime / vid.duration) * 100));
    });
    scrubLabel.appendChild(scrub);
    controls.appendChild(scrubLabel);
    wrap.appendChild(controls);
    wrap.appendChild(el("p", "demo-note",
      "Slow-mo / loop / scrub apply to this local HTML5 sample. External dictionary embeds cannot be scrubbed cross-origin. We do not host Sign BSL / NDCS video files."));
    var sources = el("div", "demo-sources");
    sources.appendChild(el("strong", null, "Deaf demos (external): "));
    var vids = (item && Array.isArray(item.videos) && item.videos.length)
      ? item.videos
      : (item && item.videoSearch ? [{ label: "Sign BSL", variety: "multi-signer dictionary", url: item.videoSearch }] : []);
    if (!vids.length && item && item.letter) {
      vids = [
        { label: "Sign BSL letter", variety: "multi-signer dictionary", url: "https://www.signbsl.com/sign/" + String(item.letter).toLowerCase() },
        { label: "Commanding Hands", variety: "family/child-friendly", url: "https://www.youtube.com/@CommandingHands" }
      ];
    }
    var key = itemKey(item) || "_";
    if (demoSrcChoice[key] == null && vids[0]) demoSrcChoice[key] = 0;
    vids.forEach(function (v, idx) {
      var safe = safeHttpsUrl(v.url);
      if (!safe) return;
      var lab = (v.label || "Demo") + " · " + (v.variety || "Deaf demo");
      var a = document.createElement("a");
      a.className = "link-btn" + (demoSrcChoice[key] === idx ? " active-src" : "");
      a.href = safe; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.textContent = "Open: " + lab;
      a.addEventListener("click", function () { demoSrcChoice[key] = idx; });
      sources.appendChild(a);
      sources.appendChild(button("Pick " + (v.label || "src"), "secondary", function () {
        demoSrcChoice[key] = idx;
        var kids = sources.querySelectorAll("a");
        for (var i = 0; i < kids.length; i++) kids[i].classList.toggle("active-src", i === idx);
      }));
    });
    if (!vids.length) sources.appendChild(el("span", "demo-note", " No external demo link for this card."));
    wrap.appendChild(sources);
    parent.appendChild(wrap);
    vid.play().catch(function () {});
  }

  function renderHeader() {
    var streak = $("streak-badge"), stars = $("stars-badge"), level = $("level-chip"), mute = $("btn-mute");
    var xp = $("xp-badge"), gems = $("gems-badge"), prof = $("profile-badge");
    if (streak) streak.textContent = state.streak === 1 ? "🔥 1 day streak" : ("🔥 " + state.streak + " day streak");
    if (stars) stars.textContent = "⭐ " + state.stars;
    if (xp) xp.textContent = "✨ " + state.xp + " XP";
    if (gems) gems.textContent = "💎 " + state.gems;
    if (prof) prof.textContent = (state.avatar || "🌟") + " " + (state.name || "Learner");
    if (level) level.textContent = "Level: " + levelName();
    if (mute) {
      mute.textContent = state.audioOn ? "🔊 Sound on" : "🔇 Sound off";
      mute.setAttribute("aria-pressed", state.audioOn ? "false" : "true");
    }
  }
  function renderBadgesInto(node) {
    if (!node) return;
    clearChildren(node);
    (data.badges || []).forEach(function (b) {
      var on = !!state.badges[b.id];
      var chip = el("span", "badge-chip" + (on ? "" : " off"), (b.emoji || "🏅") + " " + b.title);
      chip.title = b.desc || "";
      node.appendChild(chip);
    });
  }
  function renderProfileSwitcher() {
    var box = $("profile-switcher");
    if (!box) return;
    clearChildren(box);
    Object.keys(store.profiles).forEach(function (pid) {
      var p = store.profiles[pid];
      box.appendChild(button((p.avatar || "🌟") + " " + p.name, pid === store.activeProfileId ? "big" : "secondary", function () {
        requestProfileSwitch(pid);
      }));
    });
  }
  function renderHomeBits() {
    var node = $("streak-home-msg");
    if (node) {
      if (state.streak <= 0) node.textContent = "Practise today to start your streak.";
      else if (state.streak === 1) node.textContent = "Day 1 streak — lovely start. Come back tomorrow to keep it.";
      else node.textContent = state.streak + " day streak. Brilliant. " + state.xp + " XP · " + state.gems + " gems.";
    }
    var due = dueReviewKeys().length, leech = leechKeys().length, fav = Object.keys(state.favourites).length;
    var celeb = $("home-celebrate");
    if (celeb) {
      celeb.style.display = "block";
      celeb.className = "feedback info";
      celeb.textContent = "Review due: " + due + " · Weak signs: " + leech + " · Favourites: " + fav;
    }
    renderBadgesInto($("home-badges"));
    renderProfileSwitcher();
    updateOfflineStatus();
  }
  function showScreen(name) {
    if (name !== "mirror") stopMirror();
    if (name !== "drill") clearDrillTimer();
    if (name !== "quiz") clearQuizTimer();
    if (name !== "guide") stopGuidePlayAll();
    if (name !== "stories") { /* keep storyCoachMode until home clears it */ }
    var screens = document.querySelectorAll("section.screen");
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.toggle("active", screens[i].id === "screen-" + name);
    }
    currentScreen = name;
    if (name === "home") {
      storyCoachMode = false;
      renderHomeBits();
    }
  }
  function items() {
    if (queueMode === "review") return itemsFromKeys(dueReviewKeys());
    if (queueMode === "leech") return itemsFromKeys(leechKeys());
    if (queueMode === "favourites") return itemsFromKeys(Object.keys(state.favourites));
    if (currentModule === "alphabet") return data.alphabet;
    if (currentModule === "greetings") return data.beginnerSigns;
    if (PACK_IDS.indexOf(currentModule) >= 0 && Array.isArray(data.packs[currentModule])) return data.packs[currentModule];
    return data.alphabet;
  }
  function viewModel(item) {
    if (!item) return null;
    if (item.letter) {
      return {
        key: item.letter, glyph: item.letter, title: "Letter " + item.letter,
        speak: "Letter " + item.letter + ". " + (item.tip || ""),
        href: "https://www.signbsl.com/sign/" + String(item.letter).toLowerCase(),
        linkLabel: "Check this letter on Sign BSL",
        lines: [
          ["Hands", item.hands === "two" ? "Two-handed UK BSL" : "Mainly one hand, still UK BSL"],
          ["How", item.tip || ""], ["Movement", item.movement || ""], ["Face", item.face || ""]
        ], item: item
      };
    }
    return {
      key: item.id, glyph: item.english || "Sign", title: item.english || "Sign",
      speak: (item.english || "Sign") + ". " + (item.tip || ""),
      href: item.videoSearch, linkLabel: "Watch this sign on Sign BSL",
      lines: [
        ["Gloss", item.gloss || ""], ["How", item.tip || ""], ["Movement", item.movement || ""],
        ["Face", item.face || ""], ["Category", item.category || ""]
      ], item: item
    };
  }
  function fillLines(parent, vm) {
    vm.lines.forEach(function (pair) {
      var p = el("p", "tip-line");
      p.appendChild(el("strong", null, pair[0] + ": "));
      p.appendChild(document.createTextNode(pair[1] || ""));
      parent.appendChild(p);
    });
    var link = makeLink(vm.href, vm.linkLabel);
    if (link) parent.appendChild(link);
  }
  function renderLearn(doSpeak) {
    var list = items();
    var panel = $("learn-panel"), progress = $("learn-progress"), fb = $("learn-feedback"), favBtn = $("btn-fav-toggle");
    if (!list.length) {
      if (panel) { clearChildren(panel); panel.appendChild(el("p", null, queueMode ? "Nothing in this queue yet." : "No UK BSL cards are loaded.")); }
      if (favBtn) favBtn.textContent = "☆ Favourite";
      return;
    }
    if (learnIndex < 0) learnIndex = list.length - 1;
    if (learnIndex >= list.length) learnIndex = 0;
    var item = list[learnIndex];
    var vm = viewModel(item);
    if (progress) progress.textContent = (learnIndex + 1) + " / " + list.length;
    if (favBtn) {
      favBtn.textContent = isFavourite(item) ? "★ Favourited" : "☆ Favourite";
      favBtn.classList.toggle("fav-on", isFavourite(item));
    }
    if (panel) {
      clearChildren(panel);
      panel.appendChild(el("h2", null, vm.title));
      panel.appendChild(handDiagram(vm.glyph, vm.title));
      fillLines(panel, vm);
      mountDemoPlayer(panel, item);
    }
    if (fb) {
      fb.className = isLearned(item) ? "feedback ok" : "feedback info";
      fb.textContent = isLearned(item) ? "Practised on this device." : "Try the shape, then tap Next to save it.";
    }
    if (doSpeak && vm) speak(vm.speak);
  }
  function isLearned(item) {
    if (!item) return false;
    if (item.letter) return !!state.lettersLearned[item.letter];
    return !!state.signsLearned[item.id];
  }
  function checkPackComplete() {
    PACK_IDS.concat(["greetings"]).forEach(function (pid) {
      var list = pid === "greetings" ? data.beginnerSigns : data.packs[pid];
      if (!Array.isArray(list) || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        if (!list[i] || !state.signsLearned[list[i].id]) return;
      }
      awardBadge("pack-complete");
    });
  }
  function markLearned(item) {
    if (!item) return;
    if (item.letter) {
      if (!state.lettersLearned[item.letter]) {
        state.lettersLearned[item.letter] = Date.now();
        state.stars += 1; awardXp(3, 1); logActivity("letter", 2);
      } else saveState();
      srsReview(item.letter, true);
    } else if (item.id) {
      if (!state.signsLearned[item.id]) {
        state.signsLearned[item.id] = Date.now();
        state.stars += 1; awardXp(4, 1); logActivity("sign", 3); checkPackComplete();
      } else saveState();
      srsReview(item.id, true);
    }
  }

  function letterPool() {
    var all = data.alphabet.filter(function (a) { return a && /^[A-Z]$/.test(a.letter); });
    var pool = all.filter(function (a) { return asInt(a.difficulty, 1, 1, 3) <= state.difficulty + 1; });
    return pool.length >= 4 ? pool : all;
  }
  function signPoolForModule() {
    var list = items();
    if (queueMode) {
      var signs = list.filter(function (s) { return s && s.english; });
      return signs.length ? signs : list;
    }
    if (currentModule === "alphabet") return letterPool();
    var all = list.filter(function (s) { return s && s.english; });
    var pool = all.filter(function (s) { return asInt(s.difficulty, 1, 1, 3) <= state.difficulty + 1; });
    return pool.length >= 2 ? pool : all;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function findLetter(letter) {
    for (var i = 0; i < data.alphabet.length; i++) if (data.alphabet[i].letter === letter) return data.alphabet[i];
    return null;
  }
  function clearQuizTimer() { if (quizTimer) { clearTimeout(quizTimer); quizTimer = null; } }
  function quizAreaKey() { return queueMode || currentModule || "alphabet"; }

  function newQuiz() {
    clearQuizTimer();
    var token = ++quizToken;
    var prompt = $("quiz-prompt"), options = $("quiz-options"), fb = $("quiz-feedback"), chip = $("quiz-mode-chip");
    if (chip) {
      chip.textContent = queueMode === "review" ? "Quiz · review due"
        : queueMode === "leech" ? "Quiz · weak signs"
        : queueMode === "favourites" ? "Quiz · favourites"
        : ("Quiz · " + currentModule);
    }
    if (fb) { fb.className = "feedback info"; fb.textContent = "Listen, then choose an answer. You've got this!"; }
    clearChildren(prompt); clearChildren(options);
    var useSigns = currentModule !== "alphabet" || !!queueMode;
    var pool = useSigns ? signPoolForModule() : letterPool();
    if (queueMode && pool.length) useSigns = !!pool[0].english;
    if (currentModule === "alphabet" && !queueMode) { useSigns = false; pool = letterPool(); }
    if (!pool.length) {
      if (prompt) prompt.appendChild(el("p", null, "Nothing to quiz yet in this queue."));
      return;
    }
    var answerItem = pool[Math.floor(Math.random() * pool.length)];
    var answer = useSigns ? answerItem.english : answerItem.letter;
    var clue = answerItem.tip || "";
    var labels = pool.map(function (p) { return useSigns ? p.english : p.letter; });
    var unique = [];
    labels.forEach(function (lab) { if (unique.indexOf(lab) === -1) unique.push(lab); });
    if (unique.length < 4 && useSigns) {
      allSignLists().forEach(function (list) {
        list.forEach(function (s) { if (s && s.english && unique.indexOf(s.english) === -1) unique.push(s.english); });
      });
    }
    if (unique.length < 4 && !useSigns) {
      data.alphabet.forEach(function (a) { if (a && a.letter && unique.indexOf(a.letter) === -1) unique.push(a.letter); });
    }
    var distractors = shuffle(unique.filter(function (lab) { return lab !== answer; })).slice(0, 3);
    var opts = shuffle([answer].concat(distractors));
    if (prompt) {
      prompt.appendChild(el("h2", null, useSigns ? "Which UK BSL sign is this?" : "Which UK BSL letter is this?"));
      prompt.appendChild(el("p", "tip-line", clue));
      mountDemoPlayer(prompt, answerItem);
    }
    speak((useSigns ? "Quiz. Which sign is this? " : "Quiz. Which letter is this? ") + clue);
    var locked = false;
    opts.forEach(function (label) {
      var b = button(label, null, function () {
        if (locked) return;
        locked = true;
        var buttons = options.querySelectorAll("button");
        for (var i = 0; i < buttons.length; i++) buttons[i].disabled = true;
        var ok = label === answer;
        for (var j = 0; j < buttons.length; j++) {
          if (buttons[j].textContent === answer) buttons[j].classList.add("correct");
          if (buttons[j] === b && !ok) buttons[j].classList.add("wrong");
        }
        var area = quizAreaKey();
        if (!state.quizStats.byArea[area]) state.quizStats.byArea[area] = defaultQuizArea();
        var key = itemKey(answerItem);
        if (ok) {
          state.quizStats.correct += 1;
          state.quizStats.byArea[area].correct += 1;
          state.quizStats.currentStreak += 1;
          if (state.quizStats.currentStreak > state.quizStats.bestStreak) state.quizStats.bestStreak = state.quizStats.currentStreak;
          state.stars += 1; awardXp(5, 1); srsReview(key, true);
          if (state.quizStats.correct === 1) awardBadge("first-quiz");
          if (fb) { fb.className = "feedback ok"; fb.textContent = "Correct! ✨ +XP +gem"; }
          celebrate("Nice!"); speak("Correct! Well done."); beep(true);
          logActivity(queueMode === "review" ? "review" : "quiz", 2);
          adaptDifficulty(true);
        } else {
          state.quizStats.wrong += 1;
          state.quizStats.byArea[area].wrong += 1;
          state.quizStats.currentStreak = 0;
          srsReview(key, false);
          if (fb) {
            fb.className = "feedback gentle";
            fb.textContent = "Almost — here's the sign again. The answer was " + answer + ". " + (clue ? clue.slice(0, 120) : "");
          }
          speak("Almost. Here's the sign again. The answer was " + answer + ". " + clue);
          beep(false); logActivity("quiz", 0); adaptDifficulty(false);
        }
        quizTimer = setTimeout(function () { if (token === quizToken) newQuiz(); }, ok ? 1200 : 2200);
      });
      options.appendChild(b);
    });
  }

  function adaptDifficulty(success) {
    var before = state.difficulty;
    if (success) {
      if (state.quizStats.currentStreak >= 4 && state.difficulty < 3) { state.difficulty += 1; state.quizStats.currentStreak = 0; }
    } else if (state.difficulty > 1 && state.quizStats.wrong > 0 && state.quizStats.wrong % 3 === 0) {
      state.difficulty -= 1;
    }
    state.difficulty = asInt(state.difficulty, 1, 1, 3);
    if (state.difficulty !== before) {
      speak(success ? ("Nice run. Difficulty is now " + levelName() + ".") : ("Let's ease off. Difficulty is now " + levelName() + "."));
    }
    saveState();
  }

  var matchSel = { left: null, right: null };
  function newMatch() {
    matchSel = { left: null, right: null };
    var left = $("match-left"), right = $("match-right"), fb = $("match-feedback");
    clearChildren(left); clearChildren(right);
    var pool = (currentModule === "alphabet" && !queueMode) ? letterPool() : signPoolForModule();
    var count = Math.min(pool.length, 2 + state.difficulty);
    if (count < 2) count = Math.min(pool.length, 2);
    var picked = shuffle(pool).slice(0, count);
    if (fb) { fb.className = "feedback info"; fb.textContent = picked.length ? "Tap a sign, then tap its meaning." : "Nothing to match yet."; }
    if (!picked.length) return;
    var pairs = picked.map(function (item) {
      if (item.letter) {
        var tip = item.tip || "";
        return { key: item.letter, left: "Letter " + item.letter, right: tip.length > 90 ? tip.slice(0, 89) + "…" : tip };
      }
      var t = item.tip || "";
      return { key: item.id, left: item.english, right: t.length > 90 ? t.slice(0, 89) + "…" : t };
    });
    function addCol(col, side, rows) {
      rows.forEach(function (row) {
        var node = el("div", "match-item", side === "left" ? row.left : row.right);
        node.dataset.key = row.key; node.dataset.side = side;
        node.addEventListener("click", function () { onMatchClick(node); });
        col.appendChild(node);
      });
    }
    addCol(left, "left", shuffle(pairs));
    addCol(right, "right", shuffle(pairs));
    speak("Matching game. Match each item to its description.");
  }
  function onMatchClick(node) {
    if (node.classList.contains("matched")) return;
    var side = node.dataset.side === "right" ? "right" : "left";
    var col = side === "left" ? $("match-left") : $("match-right");
    var kids = col ? col.children : [];
    for (var i = 0; i < kids.length; i++) kids[i].classList.remove("selected");
    node.classList.add("selected");
    matchSel[side] = node;
    if (!matchSel.left || !matchSel.right) return;
    var ok = matchSel.left.dataset.key === matchSel.right.dataset.key;
    var fb = $("match-feedback");
    if (ok) {
      matchSel.left.classList.add("matched"); matchSel.right.classList.add("matched");
      matchSel.left.classList.remove("selected"); matchSel.right.classList.remove("selected");
      state.stars += 1; awardXp(3, 1); srsReview(matchSel.left.dataset.key, true);
      beep(true); speak("Match found!"); logActivity("quiz", 2);
      var leftKids = $("match-left").children, done = true;
      for (var j = 0; j < leftKids.length; j++) if (!leftKids[j].classList.contains("matched")) done = false;
      if (done) {
        state.stars += 2; awardXp(5, 2); celebrate("All matched!");
        if (fb) { fb.className = "feedback ok"; fb.textContent = "All matched — brilliant!"; }
        speak("All pairs matched. Brilliant!"); logActivity("quiz", 3);
      } else if (fb) { fb.className = "feedback ok"; fb.textContent = "Match found. Keep going!"; }
    } else {
      beep(false); srsReview(matchSel.left.dataset.key, false);
      speak("Almost — try another pair.");
      if (fb) { fb.className = "feedback gentle"; fb.textContent = "Those two do not match yet. Try again — you're learning!"; }
      matchSel.left.classList.remove("selected"); matchSel.right.classList.remove("selected");
    }
    matchSel = { left: null, right: null };
  }

  function clearDrillTimer() { if (drillTimer) { clearInterval(drillTimer); drillTimer = null; } }
  function buildDrillShell() {
    var panel = $("drill-panel");
    clearChildren(panel);
    var title = el("h2", "drill-title", ""), status = el("p", "drill-status", "");
    var stage = el("div", "drill-stage"), controls = el("div", "nav-row"), feedback = el("div", "feedback");
    panel.appendChild(title); panel.appendChild(status); panel.appendChild(stage);
    panel.appendChild(controls); panel.appendChild(feedback);
    return { title: title, status: status, stage: stage, controls: controls, feedback: feedback };
  }
  function secondsForDifficulty() {
    if (state.difficulty >= 3) return 3;
    if (state.difficulty === 2) return 5;
    return 8;
  }
  function startDrill(mode) {
    currentModule = "alphabet"; queueMode = null; clearDrillTimer(); showScreen("drill");
    if (mode === "timed") setupTimed();
    else if (mode === "spell") setupSpell();
    else setupShow();
  }
  function setupShow() {
    var ui = buildDrillShell();
    var queue = shuffle(letterPool().map(function (a) { return a.letter; })).slice(0, 8);
    drill = { mode: "show", queue: queue, index: 0, revealed: false, done: false, ui: ui };
    ui.title.textContent = "Show and sign";
    if (!queue.length) { ui.feedback.className = "feedback gentle"; ui.feedback.textContent = "No alphabet cards are loaded."; return; }
    ui.stage.appendChild(el("div", "big-glyph", ""));
    ui.stage.appendChild(el("p", "tip-line", ""));
    ui.controls.appendChild(button("Reveal tip", "secondary", function () {
      if (!drill || drill.done) return;
      drill.revealed = true; paintShow();
      var item = findLetter(drill.queue[drill.index]);
      if (item) speak(item.tip || ("Letter " + item.letter));
    }));
    ui.controls.appendChild(button("Got it", "big", function () {
      if (!drill || drill.done) return;
      var L = drill.queue[drill.index];
      markLearned(findLetter(L)); beep(true); speak("Well done. Letter " + L + ".");
      drill.index += 1; drill.revealed = false;
      if (drill.index >= drill.queue.length) finishShow(); else paintShow();
    }));
    ui.controls.appendChild(button("Try again", "secondary", function () {
      if (!drill || drill.done) return;
      drill.revealed = true; paintShow(); beep(false);
      var item = findLetter(drill.queue[drill.index]);
      speak(item ? ("Almost — try again. " + item.tip) : "Almost — try again.");
    }));
    paintShow();
    speak("Show and sign. Form each UK BSL letter, then reveal the tip if you want a hint.");
  }
  function paintShow() {
    if (!drill || !drill.ui) return;
    var L = drill.queue[drill.index], item = findLetter(L);
    var big = drill.ui.stage.querySelector(".big-glyph"), tip = drill.ui.stage.querySelector(".tip-line");
    if (big) big.textContent = L || "";
    if (tip) tip.textContent = drill.revealed && item ? item.tip : "Tip hidden — try the shape, then reveal.";
    drill.ui.status.textContent = "Letter " + (drill.index + 1) + " of " + drill.queue.length;
    if (!drill.revealed) speak("Letter " + L);
  }
  function finishShow() {
    if (!drill || drill.done) return;
    drill.done = true; awardXp(8, 2);
    drill.ui.feedback.className = "feedback ok";
    drill.ui.feedback.textContent = "Show-and-sign round complete.";
    logActivity("drill", 5); speak("Show and sign round complete. Great work.");
    drill.ui.controls.appendChild(button("Play again", "secondary", function () { setupShow(); }));
  }
  function setupTimed() {
    var ui = buildDrillShell();
    var queue = shuffle(letterPool().map(function (a) { return a.letter; })).slice(0, 8);
    drill = { mode: "timed", queue: queue, index: 0, hits: 0, misses: 0, left: secondsForDifficulty(), done: false, ui: ui };
    ui.title.textContent = "Timed fingerspelling";
    if (!queue.length) { ui.feedback.className = "feedback gentle"; ui.feedback.textContent = "No alphabet cards are loaded."; return; }
    ui.stage.appendChild(el("div", "countdown", ""));
    ui.stage.appendChild(el("div", "big-glyph", ""));
    ui.stage.appendChild(el("p", "tip-line", "Sign the letter before the timer runs out."));
    ui.controls.appendChild(button("I signed it", "big", timedHit));
    showTimedLetter(true);
    drillTimer = setInterval(timedTick, 1000);
    speak("Timed drill. Sign each letter before the countdown ends.");
  }
  function showTimedLetter(announce) {
    if (!drill || drill.done) return;
    if (drill.index >= drill.queue.length) { finishTimed(); return; }
    drill.left = secondsForDifficulty();
    var L = drill.queue[drill.index];
    var cd = drill.ui.stage.querySelector(".countdown"), big = drill.ui.stage.querySelector(".big-glyph");
    if (cd) cd.textContent = String(drill.left);
    if (big) big.textContent = L;
    drill.ui.status.textContent = "Letter " + (drill.index + 1) + " of " + drill.queue.length + " · " + drill.left + "s";
    if (announce) speak("Letter " + L);
  }
  function timedTick() {
    if (!drill || drill.mode !== "timed" || drill.done) return;
    drill.left -= 1;
    var cd = drill.ui.stage.querySelector(".countdown");
    if (cd) cd.textContent = String(Math.max(0, drill.left));
    drill.ui.status.textContent = "Letter " + (drill.index + 1) + " of " + drill.queue.length + " · " + Math.max(0, drill.left) + "s";
    if (drill.left <= 0) {
      drill.misses += 1; beep(false); srsReview(drill.queue[drill.index], false);
      drill.index += 1;
      if (drill.index >= drill.queue.length) finishTimed(); else showTimedLetter(true);
    }
  }
  function timedHit() {
    if (!drill || drill.done || drill.mode !== "timed") return;
    markLearned(findLetter(drill.queue[drill.index]));
    drill.hits += 1; beep(true); drill.index += 1;
    if (drill.index >= drill.queue.length) finishTimed(); else showTimedLetter(true);
  }
  function finishTimed() {
    if (!drill || drill.done) return;
    drill.done = true; clearDrillTimer();
    awardXp(Math.max(2, drill.hits * 2), 1);
    logActivity("drill", Math.max(1, drill.hits));
    drill.ui.feedback.className = "feedback ok";
    drill.ui.feedback.textContent = "Timed round finished. Signed in time: " + drill.hits + ". Missed: " + drill.misses + ".";
    speak("Timed round finished. You signed " + drill.hits + " in time.");
    drill.ui.controls.appendChild(button("Play again", "secondary", function () { setupTimed(); }));
  }
  function pickWord() {
    var words = data.drillWords.filter(function (w) { return typeof w === "string" && /^[A-Z]+$/.test(w); });
    var maxLen = 2 + state.difficulty;
    var pool = words.filter(function (w) { return w.length <= Math.max(3, maxLen); });
    if (!pool.length) pool = words;
    if (!pool.length) pool = ["CAT"];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function setupSpell() {
    var ui = buildDrillShell();
    var word = pickWord();
    drill = { mode: "spell", word: word, index: 0, done: false, ui: ui };
    ui.title.textContent = "Spell the word";
    ui.stage.appendChild(el("div", "spell-word", word));
    ui.stage.appendChild(el("div", "big-glyph", ""));
    ui.stage.appendChild(el("p", "tip-line", ""));
    ui.controls.appendChild(button("Next letter", "big", spellAdvance));
    ui.controls.appendChild(button("Hear letter", "secondary", function () {
      if (!drill || drill.done) return;
      var L = drill.word.charAt(Math.min(drill.index, drill.word.length - 1));
      var item = findLetter(L);
      speak(item ? ("Letter " + L + ". " + item.tip) : ("Letter " + L));
    }));
    paintSpell(true);
    speak("Spell the word " + word.split("").join(", ") + ". UK BSL fingerspelling.");
  }
  function paintSpell(announce) {
    if (!drill || drill.done) return;
    var L = drill.word.charAt(drill.index), item = findLetter(L);
    var big = drill.ui.stage.querySelector(".big-glyph"), tip = drill.ui.stage.querySelector(".tip-line");
    if (big) big.textContent = L;
    if (tip) tip.textContent = item ? item.tip : "";
    drill.ui.status.textContent = "Letter " + (drill.index + 1) + " of " + drill.word.length + " in " + drill.word;
    if (announce) speak("Letter " + L);
  }
  function spellAdvance() {
    if (!drill || drill.done || drill.mode !== "spell") return;
    markLearned(findLetter(drill.word.charAt(drill.index)));
    drill.index += 1;
    if (drill.index >= drill.word.length) {
      drill.done = true; state.stars += 2; awardXp(6, 2);
      drill.ui.feedback.className = "feedback ok";
      drill.ui.feedback.textContent = "You spelled " + drill.word + ".";
      logActivity("drill", 4); speak("You spelled " + drill.word + ". Excellent.");
      beep(true); celebrate("Spelled!");
      drill.ui.controls.appendChild(button("Another word", "secondary", function () { setupSpell(); }));
      return;
    }
    paintSpell(true);
  }

  function releaseStream(stream) {
    if (!stream || typeof stream.getTracks !== "function") return;
    try {
      stream.getTracks().forEach(function (t) {
        try { if (t && typeof t.stop === "function") t.stop(); } catch (e) {}
      });
    } catch (e) {}
  }
  function stopMirror() {
    mirrorGen += 1;
    if (mirrorTick) { clearInterval(mirrorTick); mirrorTick = null; }
    releaseStream(mirrorStream); mirrorStream = null;
    var video = $("mirror-video");
    if (video) { try { video.srcObject = null; } catch (e) {} }
  }
  function renderMirror() {
    var list = items(), box = $("mirror-demo"), fb = $("mirror-feedback");
    if (!list.length) {
      if (box) { clearChildren(box); box.appendChild(el("p", null, "No demo loaded.")); }
      return;
    }
    mirrorIndex = ((mirrorIndex % list.length) + list.length) % list.length;
    var item = list[mirrorIndex], vm = viewModel(item);
    if (box) {
      clearChildren(box);
      box.appendChild(el("div", "mirror-label", currentModule === "alphabet" ? "Demo letter" : "Demo sign"));
      box.appendChild(handDiagram(vm.glyph, vm.title));
      fillLines(box, vm);
      mountDemoPlayer(box, item);
    }
    if (fb) { fb.className = "feedback info"; fb.textContent = "Copy the handshape next to the camera, then tap I matched it."; }
  }
  function currentMirrorItem() {
    var list = items();
    if (!list.length) return null;
    mirrorIndex = ((mirrorIndex % list.length) + list.length) % list.length;
    return list[mirrorIndex];
  }
  async function startMirror() {
    var video = $("mirror-video"), fallback = $("mirror-fallback"), acquired = null;
    stopMirror();
    var gen = mirrorGen;
    try {
      if (currentScreen !== "mirror") return;
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") throw new Error("no-camera-api");
      acquired = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false
      });
      if (gen !== mirrorGen || currentScreen !== "mirror") { releaseStream(acquired); return; }
      mirrorStream = acquired;
      if (!video) throw new Error("no-video-element");
      video.srcObject = acquired;
      if (typeof video.play !== "function") throw new Error("no-play");
      await video.play();
      if (gen !== mirrorGen || currentScreen !== "mirror") throw new Error("mirror-left");
      if (fallback) { fallback.style.display = "none"; fallback.textContent = ""; }
      video.style.display = "block";
      mirrorTick = setInterval(function () {
        try {
          var log = ensureTodayLog();
          log.mirrorMinutes = Math.min(100000, Math.round((log.mirrorMinutes + 0.05) * 100) / 100);
          saveState();
        } catch (e) {}
      }, 3000);
      logActivity("mirror", 1);
      var vm = viewModel(currentMirrorItem());
      speak(vm ? ("Mirror on. " + vm.speak) : "Mirror on. Compare your handshape.");
    } catch (err) {
      releaseStream(acquired);
      if (mirrorStream === acquired) {
        mirrorStream = null;
        if (video) { try { video.srcObject = null; } catch (e) {} }
      } else if (video && video.srcObject === acquired) {
        try { video.srcObject = null; } catch (e2) {}
      }
      if (gen !== mirrorGen) return;
      if (mirrorTick) { clearInterval(mirrorTick); mirrorTick = null; }
      if (video) video.style.display = "none";
      if (err && err.message === "mirror-left") return;
      if (fallback) {
        fallback.style.display = "block";
        fallback.textContent = "Camera didn't start (permission, play error, or no camera). Practise with the demo, or a real mirror. Video never leaves this device.";
      }
      speak("Camera not available. Use the demo panel or a real mirror.");
    }
  }
  function shiftMirror(delta) {
    var list = items();
    if (!list.length) return;
    mirrorIndex = (mirrorIndex + delta + list.length) % list.length;
    renderMirror();
    var vm = viewModel(list[mirrorIndex]);
    if (vm) speak(vm.speak);
  }
  function mirrorGotIt() {
    markLearned(currentMirrorItem());
    awardXp(3, 1); beep(true); celebrate("Matched!");
    var fb = $("mirror-feedback");
    if (fb) { fb.className = "feedback ok"; fb.textContent = "Saved. Lovely matching."; }
    speak("Saved. Lovely matching.");
  }


  function stopGuidePlayAll() {
    guidePlayToken += 1;
    if (guidePlayTimer) { clearTimeout(guidePlayTimer); guidePlayTimer = null; }
    cancelSpeech();
  }
  function guideLetter() {
    return data.alphabet[guideLetterIndex] || null;
  }
  function handsPhrase(item) {
    if (!item) return "UK BSL.";
    if (item.hands === "two") return "Two-handed UK BSL.";
    return "Mainly one hand, still UK BSL.";
  }
  function guideStepPayload(item, stepIdx) {
    var step = GUIDE_STEPS[stepIdx] || GUIDE_STEPS[0];
    var text = "";
    var speakLine = "";
    if (!item) return { step: step, text: "", speakLine: "" };
    if (step.id === "name") {
      text = "Letter " + item.letter + ". " + handsPhrase(item);
      speakLine = "Letter " + item.letter + ". " + handsPhrase(item);
    } else if (step.id === "how") {
      text = item.tip || "Form the handshape clearly.";
      speakLine = "How: " + text;
    } else if (step.id === "move") {
      text = item.movement || "Hold steady.";
      speakLine = "Movement: " + text;
    } else {
      text = item.face || "Look at your conversation partner.";
      speakLine = "Face: " + text;
      if (!/partner/i.test(text)) speakLine += " Look at your conversation partner.";
    }
    return { step: step, text: text, speakLine: speakLine };
  }
  function paintGuide(doSpeak) {
    var list = data.alphabet;
    if (!list.length) return;
    if (guideLetterIndex < 0) guideLetterIndex = list.length - 1;
    if (guideLetterIndex >= list.length) guideLetterIndex = 0;
    if (guideStepIndex < 0) guideStepIndex = 0;
    if (guideStepIndex >= GUIDE_STEPS.length) guideStepIndex = GUIDE_STEPS.length - 1;
    var item = list[guideLetterIndex];
    var payload = guideStepPayload(item, guideStepIndex);
    var title = $("guide-letter-title");
    var hand = $("guide-hand");
    var demo = $("guide-demo");
    var pills = $("guide-step-pills");
    var label = $("guide-step-label");
    var text = $("guide-step-text");
    var fb = $("guide-feedback");
    if (title) title.textContent = "Letter " + item.letter + " · " + (guideLetterIndex + 1) + " / " + list.length;
    var letterKey = String(item.letter || "");
    var needRemount = guideMountedLetter !== letterKey;
    if (needRemount) {
      guideMountedLetter = letterKey;
      if (hand) {
        clearChildren(hand);
        hand.appendChild(handDiagram(item.letter, "Letter " + item.letter));
      }
      if (demo) {
        clearChildren(demo);
        mountDemoPlayer(demo, item);
        var link = makeLink("https://www.signbsl.com/sign/" + String(item.letter).toLowerCase(), "Check letter " + item.letter + " on Sign BSL");
        if (link) demo.appendChild(link);
      }
    }
    var nextStepBtn = $("btn-guide-next-step");
    if (nextStepBtn) {
      nextStepBtn.textContent = guideStepIndex >= GUIDE_STEPS.length - 1
        ? "Mark done → next letter"
        : "Next step →";
    }
    if (pills) {
      clearChildren(pills);
      GUIDE_STEPS.forEach(function (s, idx) {
        var cls = "step-pill";
        if (idx === guideStepIndex) cls += " active";
        else if (idx < guideStepIndex) cls += " done";
        var b = button(s.label, cls, function () {
          stopGuidePlayAll();
          guideStepIndex = idx;
          paintGuide(true);
        });
        pills.appendChild(b);
      });
    }
    if (label) label.textContent = "Step " + (guideStepIndex + 1) + " · " + payload.step.title;
    if (text) text.textContent = payload.text;
    if (fb) {
      fb.className = isLearned(item) ? "feedback ok" : "feedback info";
      fb.textContent = isLearned(item)
        ? "Letter " + item.letter + " marked practised. Keep refining the shape."
        : "Finish step 4 to mark letter " + item.letter + " as practised.";
    }
    if (doSpeak) speak(payload.speakLine);
  }
  function startGuide() {
    stopGuidePlayAll();
    currentModule = "alphabet";
    queueMode = null;
    guideLetterIndex = 0;
    guideStepIndex = 0;
    guideMountedLetter = null;
    guideEndCelebrated = false;
    showScreen("guide");
    paintGuide(true);
  }
  function guideNextStep() {
    stopGuidePlayAll();
    var item = guideLetter();
    if (guideStepIndex >= GUIDE_STEPS.length - 1) {
      if (item) markLearned(item);
      if (guideLetterIndex < data.alphabet.length - 1) {
        guideLetterIndex += 1;
        guideStepIndex = 0;
        paintGuide(true);
        return;
      }
      var fb = $("guide-feedback");
      if (fb) { fb.className = "feedback ok"; fb.textContent = "Alphabet guide finished — letter Z practised."; }
      if (!guideEndCelebrated) {
        guideEndCelebrated = true;
        celebrate("Alphabet guide finished!");
        speak("You reached the end of the alphabet guide. Brilliant.");
      }
      paintGuide(false);
      return;
    }
    guideStepIndex += 1;
    paintGuide(true);
  }
  function guidePrevStep() {
    stopGuidePlayAll();
    if (guideStepIndex > 0) guideStepIndex -= 1;
    paintGuide(true);
  }
  function guideNextLetter() {
    stopGuidePlayAll();
    var item = guideLetter();
    if (item && guideStepIndex >= GUIDE_STEPS.length - 1) markLearned(item);
    guideLetterIndex += 1;
    if (guideLetterIndex >= data.alphabet.length) {
      guideLetterIndex = data.alphabet.length - 1;
      celebrate("Alphabet guide finished!");
      speak("You reached the end of the alphabet guide. Brilliant.");
      paintGuide(false);
      return;
    }
    guideStepIndex = 0;
    paintGuide(true);
  }
  function guidePlayAllSteps() {
    stopGuidePlayAll();
    var token = guidePlayToken;
    guideStepIndex = 0;
    function runStep() {
      if (token !== guidePlayToken || currentScreen !== "guide") return;
      paintGuide(false);
      var item = guideLetter();
      var payload = guideStepPayload(item, guideStepIndex);
      speak(payload.speakLine, {
        force: true,
        onend: function () {
          if (token !== guidePlayToken || currentScreen !== "guide") return;
          guidePlayTimer = setTimeout(function () {
            guidePlayTimer = null;
            if (token !== guidePlayToken || currentScreen !== "guide") return;
            if (guideStepIndex >= GUIDE_STEPS.length - 1) {
              if (item) markLearned(item);
              var fb = $("guide-feedback");
              if (fb) { fb.className = "feedback ok"; fb.textContent = "All steps coached for letter " + (item && item.letter) + "."; }
              speak("All steps for letter " + (item && item.letter) + ". Well done.", { force: true });
              return;
            }
            guideStepIndex += 1;
            runStep();
          }, 450);
        }
      });
    }
    runStep();
  }

  function stepRole(step, idx) {
    if (step && (step.role === "you" || step.role === "partner")) return step.role;
    return (idx % 2 === 0) ? "you" : "partner";
  }
  function roleLabel(role) {
    return role === "partner" ? "Partner" : "You";
  }
  function resolveStepSigns(step) {
    var out = [];
    var ids = (step && step.signIds) || [];
    for (var i = 0; i < ids.length; i++) {
      var s = findSignById(ids[i]);
      if (s) out.push(s);
    }
    return out;
  }
  function coachSpeakForStep(step, force) {
    if (!step) return;
    var parts = [];
    var role = stepRole(step, storyStep);
    parts.push(roleLabel(role) + (role === "you" ? " say: " : " says: ") + (step.english || (step.glosses || []).join(" ")));
    var signs = resolveStepSigns(step);
    signs.forEach(function (s) {
      var bit = "Sign " + (s.english || s.gloss || "") + ".";
      if (s.tip) bit += " How: " + s.tip;
      parts.push(bit);
    });
    speak(parts.join(" "), force ? { force: true } : undefined);
  }

  function renderStoriesList() {
    var list = $("stories-list"), player = $("story-player");
    if (player) player.style.display = "none";
    if (!list) return;
    clearChildren(list);
    if (storyCoachMode) {
      var intro = el("article", "card");
      intro.appendChild(el("div", "emoji", "💬"));
      intro.appendChild(el("h3", null, "Conversation signing"));
      intro.appendChild(el("p", null, "Each dialogue is a turn strip: You ↔ Partner. For every turn you see English, glosses, and in-panel how / movement / face tips, with spoken coaching."));
      list.appendChild(intro);
    }
    (data.stories || []).forEach(function (st) {
      var card = el("article", "card");
      card.appendChild(el("div", "emoji", storyCoachMode ? "💬" : "📖"));
      card.appendChild(el("h3", null, st.title || "Story"));
      card.appendChild(el("p", null, st.blurb || ""));
      card.appendChild(button(storyCoachMode ? "Coach this dialogue" : "Start", null, function () { startStory(st.id); }));
      list.appendChild(card);
    });
  }
  function startStory(id) {
    storyId = id; storyStep = 0;
    storyCompletedId = null;
    var player = $("story-player");
    if (player) player.style.display = "block";
    paintStory(true);
  }
  function currentStory() {
    for (var i = 0; i < data.stories.length; i++) if (data.stories[i].id === storyId) return data.stories[i];
    return null;
  }
  function paintStory(doSpeak) {
    var st = currentStory();
    if (!st || !Array.isArray(st.steps) || !st.steps.length) return;
    if (storyStep < 0) storyStep = 0;
    if (storyStep >= st.steps.length) {
      if (storyCompletedId !== st.id) {
        storyCompletedId = st.id;
        awardBadge("story-done"); awardXp(10, 3); celebrate("Story complete!");
        var fbDone = $("story-feedback");
        if (fbDone) { fbDone.className = "feedback ok"; fbDone.textContent = "Conversation finished — brilliant signing!"; }
        speak("Conversation finished. Brilliant signing!");
        logActivity("story", 5);
      }
      storyStep = st.steps.length - 1;
    }
    var step = st.steps[storyStep];
    var role = stepRole(step, storyStep);
    var title = $("story-title"), prog = $("story-progress"), eng = $("story-english");
    var gloss = $("story-gloss"), demo = $("story-demo");
    var strip = $("story-turn-strip"), roleEl = $("story-role");
    var coachPanel = $("story-sign-coach"), banner = $("story-coach-banner");
    if (banner) banner.style.display = storyCoachMode ? "block" : "none";
    if (title) title.textContent = (storyCoachMode ? "Conversation · " : "") + (st.title || "Story");
    if (prog) prog.textContent = "Turn " + (storyStep + 1) + " / " + st.steps.length;
    if (roleEl) {
      roleEl.className = "turn-role " + role;
      roleEl.textContent = roleLabel(role) + " ↔ " + (role === "you" ? "Partner listens" : "You watch");
    }
    if (eng) eng.textContent = step.english || "";
    if (gloss) gloss.textContent = (step.glosses || []).join(" · ");
    if (strip) {
      clearChildren(strip);
      st.steps.forEach(function (s, idx) {
        var r = stepRole(s, idx);
        var cls = "turn-chip " + r + (idx === storyStep ? " active" : "");
        var label = (idx + 1) + ". " + roleLabel(r) + ": " + (s.english || (s.glosses || []).join(" "));
        var chip = button(label, cls, function () {
          storyStep = idx;
          paintStory(true);
        });
        strip.appendChild(chip);
      });
    }
    if (coachPanel) {
      clearChildren(coachPanel);
      var signs = resolveStepSigns(step);
      if (!signs.length && step.demo) {
        coachPanel.appendChild(el("p", "note", "Open the demo links below for formation detail."));
      }
      signs.forEach(function (s) {
        var card = el("div", "sign-coach-card");
        card.appendChild(el("h4", null, "How to sign: " + (s.english || s.gloss || "")));
        var tip = el("p", null); tip.appendChild(el("strong", null, "How: ")); tip.appendChild(document.createTextNode(s.tip || "See demo.")); card.appendChild(tip);
        var mov = el("p", null); mov.appendChild(el("strong", null, "Movement: ")); mov.appendChild(document.createTextNode(s.movement || "—")); card.appendChild(mov);
        var face = el("p", null); face.appendChild(el("strong", null, "Face: ")); face.appendChild(document.createTextNode(s.face || "—")); card.appendChild(face);
        coachPanel.appendChild(card);
      });
    }
    if (demo) {
      clearChildren(demo);
      var signs2 = resolveStepSigns(step);
      var sign = signs2[0] || null;
      if (!sign && step.demo) {
        sign = { english: step.english, tip: "", videoSearch: step.demo,
          videos: [{ label: "Sign BSL", variety: "multi-signer dictionary", url: step.demo }] };
      }
      if (sign) {
        demo.appendChild(handDiagram(sign.english || "Sign", sign.english || "Sign"));
        mountDemoPlayer(demo, sign);
      }
      signs2.forEach(function (s) {
        if (s.videoSearch) {
          var link = makeLink(s.videoSearch, "Sign BSL · " + (s.english || s.id));
          if (link) demo.appendChild(link);
        }
      });
    }
    if (doSpeak) {
      if (storyCoachMode) coachSpeakForStep(step, false);
      else speak(step.english || (step.glosses || []).join(" "));
    }
  }

  function lastNDays(n) {
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var m = String(d.getMonth() + 1), day = String(d.getDate());
      if (m.length < 2) m = "0" + m; if (day.length < 2) day = "0" + day;
      out.push(d.getFullYear() + "-" + m + "-" + day);
    }
    return out;
  }
  function formatDay(iso) {
    var parts = iso.split("-");
    var dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    try { return dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
    catch (e) { return iso; }
  }
  function dayLog(iso) {
    var log = state.weeklyLog[iso];
    if (!isPlainObject(log)) return blankDay();
    return {
      drills: asInt(log.drills, 0, 0, 100000), quizzes: asInt(log.quizzes, 0, 0, 100000),
      mirrorMinutes: asFloat(log.mirrorMinutes, 0, 0, 100000), score: asInt(log.score, 0, 0, 1000000),
      letters: asInt(log.letters, 0, 0, 100000), signs: asInt(log.signs, 0, 0, 100000),
      minutes: asFloat(log.minutes, 0, 0, 100000)
    };
  }
  function statCard(num, label) {
    var card = el("div", "stat");
    card.appendChild(el("div", "n", String(num)));
    card.appendChild(el("div", "l", label));
    return card;
  }
  function addLi(list, text) {
    if (!list) return;
    var li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  }
  function areaLine(label, key) {
    var a = (state.quizStats.byArea && state.quizStats.byArea[key]) || defaultQuizArea();
    var c = asInt(a.correct, 0, 0, 10000000), w = asInt(a.wrong, 0, 0, 10000000), t = c + w;
    if (!t) return label + ": no quizzes yet";
    return label + ": " + Math.round((100 * c) / t) + "% (" + c + " correct, " + w + " missed)";
  }
  function renderParent() {
    ensureSoftNote();
    var stats = $("parent-stats"), bars = $("parent-bars"), modules = $("parent-modules"), quiz = $("parent-quiz");
    clearChildren(stats); clearChildren(bars); clearChildren(modules); clearChildren(quiz);
    var days = lastNDays(7), weekMinutes = 0, maxMin = 1;
    days.forEach(function (d) {
      var log = dayLog(d); weekMinutes += log.minutes; if (log.minutes > maxMin) maxMin = log.minutes;
    });
    var lettersN = Object.keys(state.lettersLearned).length, signsN = Object.keys(state.signsLearned).length, signTotal = 0;
    allSignLists().forEach(function (l) { signTotal += l.length; });
    stats.appendChild(statCard(state.streak, "Day streak"));
    stats.appendChild(statCard(state.stars, "Stars"));
    stats.appendChild(statCard(state.xp, "XP"));
    stats.appendChild(statCard(state.gems, "Gems"));
    stats.appendChild(statCard(levelName(), "Level"));
    stats.appendChild(statCard(lettersN + "/26", "Letters practised"));
    stats.appendChild(statCard(signsN + "/" + signTotal, "Signs practised"));
    stats.appendChild(statCard(Math.round(weekMinutes), "Minutes this week"));
    days.forEach(function (d) {
      var log = dayLog(d), row = el("div", "bar-row");
      row.appendChild(el("div", "bar-label", formatDay(d)));
      var track = el("div", "bar-track"), fill = el("span", "bar-fill");
      fill.style.width = Math.max(0, Math.min(100, Math.round((log.minutes / maxMin) * 100))) + "%";
      track.appendChild(fill); row.appendChild(track);
      row.appendChild(el("div", "bar-value", (Math.round(log.minutes * 10) / 10) + " min · " + log.quizzes + " quiz · " + log.drills + " drill"));
      bars.appendChild(row);
    });
    var today = dayLog(todayKey());
    addLi(modules, "Alphabet: " + lettersN + "/26");
    addLi(modules, "All signs practised: " + signsN + "/" + signTotal);
    PACK_IDS.forEach(function (pid) {
      var list = data.packs[pid] || [], n = 0;
      list.forEach(function (s) { if (s && state.signsLearned[s.id]) n++; });
      addLi(modules, pid + ": " + n + "/" + list.length + (n >= list.length && list.length ? " ✓" : ""));
    });
    addLi(modules, "Fingerspelling drills today: " + today.drills);
    addLi(modules, "Mirror minutes today: " + (Math.round(today.mirrorMinutes * 10) / 10));
    addLi(modules, "Review due: " + dueReviewKeys().length + " · Leeches: " + leechKeys().length);
    Object.keys(state.quizStats.byArea || {}).forEach(function (area) { addLi(quiz, areaLine(area, area)); });
    addLi(quiz, "Best quiz streak: " + state.quizStats.bestStreak);
    addLi(quiz, "Overall: " + state.quizStats.correct + " correct, " + state.quizStats.wrong + " missed");
    var xpSum = $("parent-xp-summary");
    if (xpSum) xpSum.textContent = "Profile " + state.name + ": " + state.xp + " XP, " + state.gems + " gems, " + Object.keys(state.badges).length + " badges. Soft PIN is not security.";
    renderBadgesInto($("parent-badges"));
    var kid = $("parent-kid-mode");
    if (kid) kid.checked = !!store.kidMode;
  }
  function ensureSoftNote() {
    if ($("parent-soft-note")) return;
    var screen = $("screen-parent"), stats = $("parent-stats");
    if (!screen || !stats) return;
    var p = el("p", "note", "PIN is only a soft gate — not security.");
    p.id = "parent-soft-note";
    screen.insertBefore(p, stats);
  }
  function ensureGateNote() {
    if ($("parent-gate-note")) return;
    var card = document.querySelector("#screen-parent-gate .parent-gate");
    if (!card) return;
    var p = el("p", "note", "PIN is only a soft gate — not security.");
    p.id = "parent-gate-note";
    card.appendChild(p);
  }
  function setGateMsg(text) { var msg = $("parent-gate-msg"); if (msg) msg.textContent = text; }
  function openGate(action) {
    pendingGateAction = action || "parent";
    var pin = $("parent-pin");
    if (pin) pin.value = "";
    setGateMsg("Enter PIN " + (store.softPin || "1234") + ", or leave blank and confirm. Soft gate only — not security.");
    showScreen("parent-gate");
  }
  function openParent() {
    showScreen("parent"); renderParent();
    speak("Parent dashboard. Progress stays on this device. The PIN is only a soft gate, not security.");
  }
  function tryParentEnter() {
    var pinEl = $("parent-pin");
    var pin = pinEl ? String(pinEl.value || "").trim() : "";
    var expected = store.softPin || "1234";
    var okPin = pin === expected;
    if (!okPin && pin === "") {
      var ok = false;
      try { ok = window.confirm("Continue with a blank PIN? PIN is only a soft gate — not security."); } catch (e) { ok = false; }
      okPin = ok;
    }
    if (!okPin) {
      if (pinEl) pinEl.value = "";
      setGateMsg("That PIN did not match. Try again, or leave blank and confirm. Soft gate only — not security.");
      return;
    }
    var action = pendingGateAction || "parent";
    pendingGateAction = null;
    if (action === "parent") openParent();
    else if (action.indexOf("switch:") === 0) { doProfileSwitch(action.slice(7)); showScreen("home"); }
    else if (action === "reset") { doResetProgress(); openParent(); }
    else if (action === "exit-parent") showScreen("home");
    else openParent();
  }
  function requestProfileSwitch(pid) {
    if (pid === store.activeProfileId) return;
    if (store.kidMode) { openGate("switch:" + pid); return; }
    doProfileSwitch(pid);
  }
  function doProfileSwitch(pid) {
    if (!store.profiles[pid]) return;
    flushSessionMinutes();
    store.activeProfileId = pid;
    syncStateFromStore(); saveState(); renderHomeBits();
    speak("Switched to " + state.name);
  }
  function doResetProgress() {
    var audio = state.audioOn, id = state.id, name = state.name, avatar = state.avatar;
    store.profiles[id] = defaultProfile(id, name, avatar);
    store.profiles[id].audioOn = audio;
    syncStateFromStore(); saveState();
    speak("Progress reset for this profile.");
  }
  function resetProgress() {
    if (store.kidMode) { openGate("reset"); return; }
    var ok = false;
    try { ok = window.confirm("Reset all learning progress for " + state.name + " on this device?"); } catch (e) { ok = false; }
    if (!ok) return;
    doResetProgress(); renderParent();
  }
  function leaveParent() {
    if (store.kidMode) { openGate("exit-parent"); return; }
    showScreen("home");
  }
  function updateOfflineStatus() {
    var node = $("offline-status");
    if (!node) return;
    if (!("serviceWorker" in navigator)) { node.textContent = "Offline: SW unsupported"; return; }
    navigator.serviceWorker.getRegistration().then(function (reg) {
      node.textContent = reg ? "Offline: shell cached" : "Offline: not saved yet";
    }).catch(function () { node.textContent = "Offline: unknown"; });
  }
  function saveForOffline() {
    if (!("serviceWorker" in navigator)) { speak("Service worker not supported in this browser."); return; }
    navigator.serviceWorker.register("./sw.js").then(function () {
      updateOfflineStatus(); celebrate("Saved for offline");
      speak("App shell saved for offline. External Sign BSL videos still need the internet.");
    }).catch(function () {
      var node = $("offline-status");
      if (node) node.textContent = "Offline: register failed";
      speak("Could not register offline save.");
    });
  }
  function exportPack() {
    var payload = {
      exportedAt: new Date().toISOString(),
      disclaimer: data.disclaimer,
      profile: { id: state.id, name: state.name, avatar: state.avatar },
      progress: {
        xp: state.xp, gems: state.gems, stars: state.stars, streak: state.streak,
        lettersLearned: state.lettersLearned, signsLearned: state.signsLearned,
        favourites: state.favourites, badges: state.badges, srs: state.srs
      },
      packs: data.packs, beginnerSigns: data.beginnerSigns,
      note: "External dictionary videos are not included — only vocab metadata + local progress."
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bsl-learn-pack-" + (state.id || "learner") + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  function openRoute(spec) {
    var parts = String(spec || "").split(":");
    var mod = parts[0] || "alphabet";
    var mode = parts[1] || "learn";
    if (mod === "stories") {
      queueMode = null;
      storyCoachMode = (mode === "coach");
      showScreen("stories");
      renderStoriesList();
      speak(storyCoachMode
        ? "Conversation signing coach. Pick a dialogue, then practise each turn with spoken guidance."
        : "Signed stories.");
      return;
    }
    if (mod === "review") { queueMode = "review"; currentModule = "greetings"; }
    else if (mod === "leech") { queueMode = "leech"; currentModule = "greetings"; }
    else if (mod === "favourites") { queueMode = "favourites"; currentModule = "greetings"; }
    else {
      queueMode = null;
      if (mod === "greetings" || mod === "alphabet" || PACK_IDS.indexOf(mod) >= 0) currentModule = mod;
      else currentModule = "alphabet";
    }
    if (mode === "guide") { startGuide(); return; }
    if (mode === "learn") { learnIndex = 0; showScreen("learn"); renderLearn(true); return; }
    if (mode === "quiz") { showScreen("quiz"); newQuiz(); return; }
    if (mode === "match") { showScreen("match"); newMatch(); return; }
    if (mode === "mirror") { mirrorIndex = 0; showScreen("mirror"); renderMirror(); startMirror(); return; }
    if (mode === "drill-show") { startDrill("show"); return; }
    if (mode === "drill-timed") { startDrill("timed"); return; }
    if (mode === "drill-spell") { startDrill("spell"); return; }
    if (mode === "list") { storyCoachMode = false; showScreen("stories"); renderStoriesList(); return; }
    showScreen("home");
  }

  function init() {
    if (booted) return;
    booted = true;
    store = loadStore();
    syncStateFromStore();
    try {
      if (localStorage.getItem(STORAGE_KEY)) progressKeyKnownPresent = true;
    } catch (eInit) {}
    touchStreak();
    renderHeader();
    renderHomeBits();
    ensureGateNote();
    saveState();

    var openers = document.querySelectorAll("[data-open]");
    for (var i = 0; i < openers.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () { openRoute(btn.getAttribute("data-open")); });
      })(openers[i]);
    }

    $("btn-home").addEventListener("click", function () {
      if (currentScreen === "parent" && store.kidMode) { leaveParent(); return; }
      queueMode = null; stopGuidePlayAll(); showScreen("home"); speak("Home. Choose a UK BSL activity.");
    });
    $("btn-parent").addEventListener("click", function () { openGate("parent"); });
    $("btn-mute").addEventListener("click", function () {
      state.audioOn = !state.audioOn; saveState();
      if (state.audioOn) speak("Sound on. British English voice when this device has one.");
    });
    $("btn-replay").addEventListener("click", function () { speak(lastUtterance || "UK BSL Learn.", { force: true }); });
    $("btn-speak-card").addEventListener("click", function () {
      var list = items(); var vm = viewModel(list[learnIndex]);
      if (vm) speak(vm.speak, { force: true });
    });
    $("btn-fav-toggle").addEventListener("click", function () {
      var list = items();
      if (!list[learnIndex]) return;
      toggleFavourite(list[learnIndex]); renderLearn(false);
    });
    $("btn-prev").addEventListener("click", function () { learnIndex -= 1; renderLearn(true); });
    $("btn-next").addEventListener("click", function () {
      var list = items();
      if (list[learnIndex]) markLearned(list[learnIndex]);
      learnIndex += 1; renderLearn(true);
    });
    $("btn-quiz-skip").addEventListener("click", function () { speak("Skipped."); newQuiz(); });
    $("btn-match-reshuffle").addEventListener("click", newMatch);
    $("mirror-prev").addEventListener("click", function () { shiftMirror(-1); });
    $("mirror-next").addEventListener("click", function () { shiftMirror(1); });
    $("mirror-got-it").addEventListener("click", mirrorGotIt);
    $("btn-parent-enter").addEventListener("click", tryParentEnter);
    $("btn-parent-cancel").addEventListener("click", function () { pendingGateAction = null; showScreen("home"); });
    $("btn-parent-back").addEventListener("click", leaveParent);
    $("btn-reset-progress").addEventListener("click", resetProgress);
    var pin = $("parent-pin");
    if (pin) pin.addEventListener("keydown", function (e) { if (e.key === "Enter") tryParentEnter(); });

    var offlineBtn = $("btn-offline-save");
    if (offlineBtn) offlineBtn.addEventListener("click", saveForOffline);
    var parentOffline = $("btn-parent-offline");
    if (parentOffline) parentOffline.addEventListener("click", saveForOffline);
    var exportBtn = $("btn-export-pack");
    if (exportBtn) exportBtn.addEventListener("click", exportPack);
    var savePin = $("btn-save-pin");
    if (savePin) savePin.addEventListener("click", function () {
      var inp = $("parent-set-pin");
      var v = inp ? String(inp.value || "").trim() : "";
      if (!/^\d{4,8}$/.test(v)) { speak("Choose a PIN of 4 to 8 digits. Soft gate only."); return; }
      store.softPin = v; saveState();
      speak("PIN saved. Soft gate only — not security.");
    });
    var kidMode = $("parent-kid-mode");
    if (kidMode) kidMode.addEventListener("change", function () { store.kidMode = !!kidMode.checked; saveState(); });
    var addProf = $("btn-add-profile");
    if (addProf) addProf.addEventListener("click", function () {
      var nameEl = $("parent-new-name");
      var name = nameEl ? String(nameEl.value || "").trim().slice(0, 24) : "";
      if (!name) name = "Learner " + (Object.keys(store.profiles).length + 1);
      var id = "learner-" + Date.now().toString(36);
      var avatars = ["🌟", "🎈", "🦊", "🐸", "🦄", "🌈"];
      var av = avatars[Object.keys(store.profiles).length % avatars.length];
      store.profiles[id] = defaultProfile(id, name, av);
      saveState(); renderParent(); renderProfileSwitcher();
      if (nameEl) nameEl.value = "";
      speak("Added profile " + name);
    });

    $("btn-stories-back").addEventListener("click", function () { cancelSpeech(); showScreen("home"); });
    $("btn-story-prev").addEventListener("click", function () {
      storyStep -= 1; if (storyStep < 0) storyStep = 0; paintStory(true);
    });
    $("btn-story-next").addEventListener("click", function () { storyStep += 1; paintStory(true); });
    $("btn-story-speak").addEventListener("click", function () {
      var st = currentStory();
      if (!st) return;
      var step = st.steps[Math.min(storyStep, st.steps.length - 1)];
      if (storyCoachMode) coachSpeakForStep(step, true);
      else speak(step.english || "", { force: true });
    });
    var storyCoachBtn = $("btn-story-coach");
    if (storyCoachBtn) storyCoachBtn.addEventListener("click", function () {
      var st = currentStory();
      if (!st) return;
      var step = st.steps[Math.min(storyStep, st.steps.length - 1)];
      coachSpeakForStep(step, true);
    });

    var gHome = $("btn-guide-home");
    if (gHome) gHome.addEventListener("click", function () { stopGuidePlayAll(); showScreen("home"); });
    var gPrev = $("btn-guide-prev-step");
    if (gPrev) gPrev.addEventListener("click", guidePrevStep);
    var gNext = $("btn-guide-next-step");
    if (gNext) gNext.addEventListener("click", guideNextStep);
    var gPlay = $("btn-guide-play-all");
    if (gPlay) gPlay.addEventListener("click", guidePlayAllSteps);
    var gLetter = $("btn-guide-next-letter");
    if (gLetter) gLetter.addEventListener("click", guideNextLetter);
    var gSpeak = $("btn-guide-speak");
    if (gSpeak) gSpeak.addEventListener("click", function () {
      var item = guideLetter();
      var payload = guideStepPayload(item, guideStepIndex);
      speak(payload.speakLine, { force: true });
    });

    window.addEventListener("pagehide", function () {
      if (!skipProgressSave) flushSessionMinutes();
      stopMirror();
    });
    window.addEventListener("beforeunload", stopMirror);
    window.addEventListener("storage", function (ev) {
      if (!ev || ev.key !== STORAGE_KEY) return;
      if (ev.newValue == null || ev.newValue === "") {
        skipProgressSave = true;
        progressKeyKnownPresent = false;
      }
    });
    if (sessionFlushTimer) clearInterval(sessionFlushTimer);
    sessionFlushTimer = setInterval(flushSessionMinutes, 30000);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (reg) updateOfflineStatus();
      }).catch(function () {});
    }
    if (window.speechSynthesis && typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", function () {});
    }
    speak("Welcome to UK BSL Learn. British Sign Language for kids, not American Sign Language. Sound is " + (state.audioOn ? "on." : "off."));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
