/* ==========================================================================
   Vecode — state.js · virtual file system, project store, settings
   Everything persists to localStorage; the agent works on this state.
   ========================================================================== */
(function () {
  "use strict";

  const LS_PROJECT = "vecode.v1.project";
  const LS_SETTINGS = "vecode.v1.settings";
  const LS_SKILLS = "vecode.v1.skills";

  const DEFAULT_SETTINGS = {
    provider: "free", // provider id (see providers.js)
    providers: {}, // per-provider config: { key, model, baseUrl, extra }
    temperature: 0.6,
    review: true, // run the design-review pass after each build
    reviewDepth: 1,
    plugins: {}, // pluginId -> { enabled: bool, options: {...} }
    theme: "dark",
    analyticsDomain: "",
    typographyPreset: "warmth"
  };

  const DEFAULT_FILES = {
    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Site</title>
</head>
<body>
  <h1>Your site appears here</h1>
  <p>Describe what you want to build and Vecode will write the files.</p>
</body>
</html>`
  };

  const state = {
    name: "Untitled project",
    files: Object.assign({}, DEFAULT_FILES),
    messages: [],
    updatedAt: null,
    _listeners: [],
    _saveTimer: null
  };

  const settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  /* ---------------- persistence ---------------- */
  function load() {
    try {
      const p = JSON.parse(localStorage.getItem(LS_PROJECT) || "null");
      if (p && p.files && typeof p.files === "object") {
        state.name = p.name || "Untitled project";
        state.files = p.files;
        state.messages = Array.isArray(p.messages) ? p.messages : [];
        state.updatedAt = p.updatedAt || null;
      }
    } catch (e) { /* corrupted storage — start fresh */ }

    try {
      const s = JSON.parse(localStorage.getItem(LS_SETTINGS) || "null");
      if (s && typeof s === "object") {
        Object.assign(settings, s);
        settings.providers = Object.assign({}, s.providers || {});
        settings.plugins = Object.assign({}, s.plugins || {});
      }
    } catch (e) { /* ignore */ }
    if (!Object.prototype.hasOwnProperty.call(settings, "plugins")) settings.plugins = {};
    if (!Object.prototype.hasOwnProperty.call(settings, "providers")) settings.providers = {};
  }

  function save() {
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(LS_PROJECT, JSON.stringify({
        name: state.name, files: state.files, messages: state.messages, updatedAt: state.updatedAt
      }));
    } catch (e) {
      // Storage full — drop old messages, keep files
      try {
        state.messages = state.messages.slice(-20);
        localStorage.setItem(LS_PROJECT, JSON.stringify({
          name: state.name, files: state.files, messages: state.messages, updatedAt: state.updatedAt
        }));
      } catch (e2) { /* give up quietly */ }
    }
  }

  function saveSettings() {
    try { localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)); } catch (e) { /* ignore */ }
  }

  function saveSoon() {
    clearTimeout(state._saveTimer);
    state._saveTimer = setTimeout(save, 250);
  }

  /* ---------------- virtual file system ---------------- */
  function listFiles() {
    return Object.keys(state.files).sort((a, b) => {
      const ad = a.split("/").length, bd = b.split("/").length;
      return ad - bd || a.localeCompare(b);
    });
  }

  function readFile(path) {
    return Object.prototype.hasOwnProperty.call(state.files, path) ? state.files[path] : null;
  }

  function writeFile(path, content) {
    state.files[path] = content;
    saveSoon();
    emit("files");
  }

  function deleteFile(path) {
    if (!Object.prototype.hasOwnProperty.call(state.files, path)) return false;
    delete state.files[path];
    saveSoon();
    emit("files");
    return true;
  }

  function fileSize(path) {
    const c = state.files[path];
    if (!c) return 0;
    // Binary imports are persisted as base64 data URIs. Report the decoded
    // byte size rather than the larger storage representation.
    if (typeof c === "string") {
      const m = c.match(/^data:[^,]*;base64,([\s\S]*)$/i);
      if (m) {
        const b64 = m[1].replace(/\s/g, "");
        return Math.max(0, Math.floor(b64.length * 3 / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0));
      }
    }
    return new Blob([c]).size;
  }

  function totalSize() {
    return listFiles().reduce((a, p) => a + fileSize(p), 0);
  }

  function renameProject(name) {
    state.name = name || "Untitled project";
    saveSoon();
    emit("meta");
  }

  function resetProject(seedFiles, seedMessages, name) {
    state.files = seedFiles ? Object.assign({}, seedFiles) : Object.assign({}, DEFAULT_FILES);
    state.messages = seedMessages ? JSON.parse(JSON.stringify(seedMessages)) : [];
    state.name = name || "Untitled project";
    save();
    emit("files");
    emit("messages");
    emit("meta");
  }

  /* ---------------- messages ---------------- */
  function addMessage(msg) {
    state.messages.push(msg);
    saveSoon();
    emit("messages");
    return msg;
  }

  function updateLastMessage(patch) {
    const last = state.messages[state.messages.length - 1];
    if (last) Object.assign(last, patch);
    saveSoon();
    emit("messages");
  }

  function clearMessages() {
    state.messages = [];
    saveSoon();
    emit("messages");
  }

  /* ---------------- settings helpers ---------------- */
  function getPlugin(id) {
    if (!settings.plugins[id]) settings.plugins[id] = { enabled: false, options: {} };
    return settings.plugins[id];
  }
  function isPluginEnabled(id) { return !!getPlugin(id).enabled; }
  function setPlugin(id, enabled, options) {
    const p = getPlugin(id);
    p.enabled = enabled;
    if (options) p.options = Object.assign(p.options || {}, options);
    saveSettings();
    emit("settings");
  }
  function setProvider(id, cfg) {
    settings.providers[id] = Object.assign({}, settings.providers[id] || {}, cfg);
    saveSettings();
    emit("settings");
  }
  function getProvider(id) { return settings.providers[id] || {}; }
  function setActiveProvider(id) {
    settings.provider = id;
    saveSettings();
    emit("settings");
  }
  function setSetting(key, value) {
    settings[key] = value;
    saveSettings();
    emit("settings");
  }

  /* ---------------- custom skills (self-learning) ---------------- */
  function getSkills() {
    try { return JSON.parse(localStorage.getItem(LS_SKILLS) || "[]"); } catch (e) { return []; }
  }
  function addSkill(name, body) {
    const skills = getSkills();
    skills.push({ id: "s" + Date.now(), name, body, added: Date.now() });
    localStorage.setItem(LS_SKILLS, JSON.stringify(skills));
    emit("settings");
    return skills;
  }
  function removeSkill(id) {
    const skills = getSkills().filter((s) => s.id !== id);
    localStorage.setItem(LS_SKILLS, JSON.stringify(skills));
    emit("settings");
    return skills;
  }

  /* ---------------- events ---------------- */
  function on(fn) { state._listeners.push(fn); }
  function emit(type, detail) {
    for (const fn of state._listeners) { try { fn(type, detail); } catch (e) { console.error(e); } }
  }

  window.Vecode = window.Vecode || {};
  window.Vecode.State = {
    state, settings, load, save, saveSettings, saveSoon,
    listFiles, readFile, writeFile, deleteFile, fileSize, totalSize,
    renameProject, resetProject,
    addMessage, updateLastMessage, clearMessages,
    getPlugin, isPluginEnabled, setPlugin,
    setProvider, getProvider, setActiveProvider, setSetting,
    getSkills, addSkill, removeSkill,
    on, emit,
    DEFAULT_FILES
  };
})();
