/* ==========================================================================
   Vecode — app.js · UI, preview, panels, modals (v3 rebuild)
   Ground-up rebuild: hardened file:// localStorage, clearer modals,
   deterministic preview, storage-quota banner. Same IDs, same UX.
   ========================================================================== */
(function () {
  "use strict";
  const S = () => window.Vecode.State;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ================= tiny DOM helpers ================= */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      for (const c of Array.isArray(children) ? children : [children]) {
        if (c === null || c === undefined) continue;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ================= lightweight markdown ================= */
  function mdLight(src) {
    const blocks = [];
    const lines = String(src).replace(/\r\n/g, "\n").split("\n");
    let i = 0;
    const inTable = () => lines[i] && lines[i].trim().startsWith("|");

    while (i < lines.length) {
      const line = lines[i];
      const fence = line.match(/^```(\S*)\s*$/);
      if (fence) {
        const lang = fence[1];
        const buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        blocks.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
        continue;
      }
      if (inTable()) {
        const rows = [];
        while (i < lines.length && inTable()) { rows.push(lines[i]); i++; }
        blocks.push(renderTable(rows));
        continue;
      }
      if (/^\s*[-*] /.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*] /.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*] /, "")); i++; }
        blocks.push("<ul>" + items.map((it) => `<li>${inlineMd(it)}</li>`).join("") + "</ul>");
        continue;
      }
      if (/^\s*\d+\. /.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\. /, "")); i++; }
        blocks.push("<ol>" + items.map((it) => `<li>${inlineMd(it)}</li>`).join("") + "</ol>");
        continue;
      }
      if (line.trim() === "") { i++; continue; }
      const buf = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== "" && !/^```/.test(lines[i]) && !inTable() && !/^\s*[-*] /.test(lines[i]) && !/^\s*\d+\. /.test(lines[i])) {
        buf.push(lines[i]); i++;
      }
      blocks.push(`<p>${buf.map(inlineMd).join("<br>")}</p>`);
    }
    return blocks.join("");
  }

  function renderTable(rows) {
    const cells = rows.map((r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    const head = cells[0] || [];
    const body = cells.slice(2); // skip separator row
    let h = "<table><thead><tr>" + head.map((c) => `<th>${inlineMd(c)}</th>`).join("") + "</tr></thead><tbody>";
    for (const row of body) {
      h += "<tr>" + row.map((c) => `<td>${inlineMd(c)}</td>`).join("") + "</tr>";
    }
    return h + "</tbody></table>";
  }

  function inlineMd(s) {
    let out = esc(s);
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    out = out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return out;
  }

  /* ================= toasts ================= */
  function toast(msg, type) {
    const root = $("#toastRoot");
    const t = el("div", { class: "toast " + (type || ""), text: msg });
    root.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity 300ms"; }, 4200);
    setTimeout(() => t.remove(), 4600);
  }

  /* ================= modal helpers ================= */
  let modalCloseFn = null;
  function openModal(title, bodyNode, footNodes, wide) {
    closeModal();
    const overlay = el("div", { class: "modal-overlay" });
    const head = el("div", { class: "modal-head" }, [
      el("h3", { class: "modal-title", text: title }),
      el("button", { class: "icon-btn", html: closeIcon(), title: "Close", onclick: closeModal })
    ]);
    const body = el("div", { class: "modal-body" }, bodyNode);
    const modal = el("div", { class: "modal" + (wide ? " wide" : "") }, [head, body]);
    if (footNodes && footNodes.length) modal.appendChild(el("div", { class: "modal-foot" }, footNodes));
    overlay.appendChild(modal);
    overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", escKey);
    $("#modalRoot").appendChild(overlay);
    modalCloseFn = () => { overlay.remove(); document.removeEventListener("keydown", escKey); modalCloseFn = null; };
    return { overlay, body };
  }
  function escKey(e) { if (e.key === "Escape") closeModal(); }
  function closeModal() { if (modalCloseFn) modalCloseFn(); }
  function closeIcon() {
    return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="m3 3 10 10M13 3 3 13"/></svg>';
  }

  /* ================= view switching ================= */
  let currentView = "build";
  function switchView(view) {
    currentView = view;
    $$(".rail-item").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
    if (view === "files") renderFiles();
    if (view === "plugins") renderPlugins();
    if (view === "skill") renderSkill();
    if (view === "deploy") renderDeploy();
  }

  /* ================= preview ================= */
  function tagAttr(tag, name) {
    const source = String(tag);
    const quoted = source.match(new RegExp("\\b" + name + "\\s*=\\s*([\\\"'])([\\s\\S]*?)\\1", "i"));
    if (quoted) return quoted[2];
    const bare = source.match(new RegExp("\\b" + name + "\\s*=\\s*([^\\s\\\"'=<>`]+)", "i"));
    return bare ? bare[1] : null;
  }

  function cleanAssetRef(ref) {
    const raw = String(ref || "").trim().split(/[?#]/)[0].replace(/\\/g, "/");
    try { return decodeURIComponent(raw); } catch (e) { return raw; }
  }

  function normalizeAssetPath(ref, page) {
    let clean = cleanAssetRef(ref);
    if (!clean || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(clean)) return null;
    if (clean.startsWith("/")) clean = clean.slice(1);
    const base = cleanAssetRef(page || "index.html").split("/").slice(0, -1);
    const parts = (String(ref).trim().startsWith("/") ? [] : base).concat(clean.split("/"));
    const normalized = [];
    for (const part of parts) {
      if (!part || part === ".") continue;
      if (part === "..") normalized.pop();
      else normalized.push(part);
    }
    return normalized.join("/");
  }

  function escapeRawClose(content, tag) {
    return String(content).replace(new RegExp("<\\/" + tag, "gi"), "<\\/" + tag);
  }

  function mimeForPath(path) {
    const ext = (cleanAssetRef(path).split(".").pop() || "").toLowerCase();
    return ext === "svg" ? "image/svg+xml"
      : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
      : ext === "png" ? "image/png"
      : ext === "gif" ? "image/gif"
      : ext === "webp" ? "image/webp"
      : ext === "avif" ? "image/avif"
      : ext === "ico" ? "image/x-icon"
      : "application/octet-stream";
  }

  function textDataUri(content, path) {
    if (/^data:[^,]*,/i.test(content)) return content;
    try { return "data:" + mimeForPath(path) + ";base64," + btoa(unescape(encodeURIComponent(content))); }
    catch (e) { return null; }
  }

  const PREVIEW_BRIDGE =  "<script>(function(){" +
    "function blocked(m,e){var n=e&&e.name||'';return n==='SecurityError'||/SecurityError|sandboxed.+allow-same-origin|access is denied|operation is insecure|denied access to property|blocked a frame with origin ['\\\"]?null/i.test(String(m||''));}" +
    "function report(m,e){if(!blocked(m,e))parent.postMessage({vecode:'error',msg:String(m||'Unknown preview error')},'*');}" +
    "document.addEventListener('click',function(e){var a=e.target.closest?e.target.closest('a'):null;if(!a)return;var h=(a.getAttribute('href')||'').split('#')[0];if(!h||/^(https?:|mailto:|tel:|javascript:|\/\/)/i.test(h))return;if(/\\.html(?:[?#].*)?$/i.test(h)){e.preventDefault();parent.postMessage({vecode:'nav',href:h},'*');}},true);" +
    "window.addEventListener('error',function(ev){report(ev.message||'',ev.error);});" +
    "window.addEventListener('unhandledrejection',function(ev){var r=ev.reason;report(r&&r.message||r||'unhandled rejection',r);});" +
    "})();</" + "script>";

  const preview = {
    page: "index.html",
    device: "desktop",
    errors: [],
    timer: null,
    refreshSoon() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.render(), 320);
    },
    render() {
      const frame = $("#previewFrame");
      const S = () => window.Vecode.State;
      let html = S().readFile(this.page);
      if (html === null) {
        // fall back to index
        const candidates = ["index.html"].concat(S().listFiles().filter((p) => p.endsWith(".html") && p !== "index.html"));
        this.page = candidates[0] || "index.html";
        html = S().readFile(this.page);
      }
      if (html === null) {
        frame.srcdoc = "<html><body style='font-family:system-ui;padding:40px;color:#888'>No pages yet — ask the agent to build one.</body></html>";
        return;
      }
      html = this.inlineAssets(html);
      html = html.replace(/<\/body>/i, PREVIEW_BRIDGE + "\n</body>");
      frame.srcdoc = html;
      this.errors = [];
      this.updateErrors();
      $("#previewUrl").textContent = "preview://" + this.page;
    },
    inlineAssets(html) {
      const store = window.Vecode.State;
      const readAsset = (ref) => {
        const path = normalizeAssetPath(ref, this.page);
        if (!path) return null;
        const content = store.readFile(path);
        return content === null ? null : { path, content };
      };

      // Match the whole tag first, then inspect attributes. This works whether
      // href/src comes before or after rel, async, type, crossorigin, etc.
      html = html.replace(/<link\b[^>]*>/gi, (tag) => {
        const rel = tagAttr(tag, "rel");
        const href = tagAttr(tag, "href");
        if (!href || !rel || !rel.toLowerCase().split(/\s+/).includes("stylesheet")) return tag;
        const asset = readAsset(href);
        if (!asset || /^data:/i.test(asset.content)) return tag;
        return "<style>\n" + escapeRawClose(asset.content, "style") + "\n</style>";
      });

      html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, (tag) => {
        const src = tagAttr(tag.slice(0, tag.indexOf(">") + 1), "src");
        if (!src) return tag;
        const asset = readAsset(src);
        if (!asset || /^data:/i.test(asset.content)) return tag;
        return "<script>\n" + escapeRawClose(asset.content, "script") + "\n</scr" + "ipt>";
      });

      html = html.replace(/<(?:img|source)\b[^>]*>/gi, (tag) => {
        const src = tagAttr(tag, "src");
        if (!src || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(src)) return tag;
        const asset = readAsset(src);
        if (!asset) return tag;
        const uri = textDataUri(asset.content, asset.path);
        if (!uri) return tag;
        const quoted = /(\bsrc\s*=\s*)(["'])([\s\S]*?)\2/i;
        if (quoted.test(tag)) return tag.replace(quoted, (m, before, quote) => before + quote + uri + quote);
        return tag.replace(/(\bsrc\s*=\s*)[^\s>]+/i, "$1\"" + uri + "\"");
      });
      return html;
    },
    updateErrors() {
      const badge = $("#errBadge");
      if (this.errors.length) {
        badge.classList.add("show");
        badge.textContent = this.errors.length + " error" + (this.errors.length > 1 ? "s" : "");
      } else {
        badge.classList.remove("show");
      }
    },
    showErrors() {
      if (!this.errors.length) return;
      openModal("Preview console errors", el("div", {}, this.errors.map((er) =>
        el("div", { class: "card", style: "margin-bottom:8px;padding:10px 14px;font-family:var(--font-mono);font-size:12px" }, er)
      )));
    }
  };

  window.addEventListener("message", (e) => {
    const d = e.data;
    if (!d || d.vecode !== "nav" && d.vecode !== "error") return;
    const frame = $("#previewFrame");
    if (e.source && frame && frame.contentWindow && e.source !== frame.contentWindow) return;
    if (d.vecode === "nav") {
      const target = normalizeAssetPath(d.href, preview.page);
      if (target && S().readFile(target) !== null) { preview.page = target; preview.render(); }
      else toast("No page named " + (target || d.href) + " in the project yet", "err");
    } else if (d.vecode === "error") {
      const msg = String(d.msg || "Unknown preview error");
      if (/SecurityError|sandboxed.+allow-same-origin|access is denied|operation is insecure|denied access to property/i.test(msg)) return;
      preview.errors.push(msg);
      if (preview.errors.length <= 20) preview.updateErrors();
    }
  });

  /* ================= chat ================= */
  const chat = {
    streamingEl: null,
    streamingMode: null,
    workingEl: null,

    render() {
      const log = $("#chatLog");
      const S = () => window.Vecode.State;
      log.innerHTML = "";
      if (!S().state.messages.length) { this.renderEmpty(); return; }
      for (const m of S().state.messages) this.appendMessage(m, false);
      log.scrollTop = log.scrollHeight;
    },

    renderEmpty() {
      const log = $("#chatLog");
      log.innerHTML = "";
      const hero = el("div", { class: "empty-hero" }, [
        el("span", { class: "big-glyph serif", text: "V" }),
        el("h2", { text: "Describe the site. Vecode builds it." }),
        el("p", { text: "One sentence is enough — the agent turns it into real HTML, CSS and JS, file by file, right in your browser. Start from a template or type anything." }),
        el("div", { class: "template-grid", style: "text-align:left" }, window.Vecode.Templates.map((t) =>
          el("button", { class: "template-tile", onclick: () => { loadTemplate(t.id); } }, [
            el("div", { class: "t-name", text: t.name }),
            el("div", { class: "t-desc", text: t.tagline })
          ])
        ))
      ]);
      log.appendChild(hero);
      window.setTimeout(() => { try { if (window.decodingTexture) window.decodingTexture(hero, { opacity: 0.05, cell: 20, animated: true }); } catch (e) { /* texture is decorative */ } }, 0);
    },

    appendMessage(m, streaming) {
      const log = $("#chatLog");
      const wrap = el("div", { class: "msg " + m.role + (m.mode ? " " + m.mode : "") });
      const roleLabel = m.role === "user" ? "You" : (m.mode === "review" ? "Design review" : "Vecode");
      wrap.appendChild(el("div", { class: "msg-role", text: roleLabel }));
      const body = el("div", { class: "msg-body" });
      if (streaming) {
        body.setAttribute("data-raw", m.content || "");
        const working = el("div", { class: "agent-working" }, [
          el("div", { class: "working-header" }, [
            el("div", { class: "working-dots" }, [
              el("span", { class: "working-dot" }),
              el("span", { class: "working-dot" }),
              el("span", { class: "working-dot" })
            ]),
            el("span", { class: "working-label", text: m.mode === "review" ? "Reviewing design…" : "Building your site…" })
          ]),
          el("div", { class: "working-bar" })
        ]);
        body.appendChild(working);
        this.streamingEl = body;
        this.workingEl = working;
      } else {
        body.innerHTML = mdLight(m.content || "");
      }
      wrap.appendChild(body);
      log.appendChild(wrap);
      log.scrollTop = log.scrollHeight;
      return body;
    },

    addStreaming(mode) {
      if (this.streamingEl) {
        const cursor = this.streamingEl.querySelector(".cursor-blink");
        if (cursor) cursor.remove();
      }
      this.streamingMode = mode;
      this.appendMessage({ role: "assistant", content: "", mode }, true);
      this.streamingEl.parentElement.scrollIntoView({ block: "end" });
    },

    setWorkingStatus(text) {
      if (this.workingEl) {
        const label = this.workingEl.querySelector(".working-label");
        if (label && text) label.textContent = text;
      }
    },

    streamDelta(text) {
      if (!this.streamingEl) return;
      const raw = (this.streamingEl.getAttribute("data-raw") || "") + text;
      this.streamingEl.setAttribute("data-raw", raw);
      this.streamingEl.innerHTML = mdLight(raw);
      this.streamingEl.appendChild(el("span", { class: "cursor-blink" }));
      const log = $("#chatLog");
      log.scrollTop = log.scrollHeight;
    },

    finalize() {
      this.streamingEl = null;
      this.workingEl = null;
      this.render();
    }
  };

  /* ================= templates ================= */
  function loadTemplate(id) {
    const t = window.Vecode.Templates.find((x) => x.id === id);
    if (!t) return;
    const files = Object.assign({}, t.files);
    const msg = {
      role: "user", ts: Date.now(),
      content: "Start from the " + t.name + " template. Take it further: make it a complete, polished site following the Vecode design skill."
    };
    S().resetProject(files, [msg], t.name + " — " + S().state.name.replace(/ — .*/, ""));
    preview.page = "index.html";
    preview.render();
    chat.render();
    switchView("build");
    toast("Template loaded — tell the agent what to change", "ok");
  }

  /* ================= send / stop ================= */
  async function send(text) {
    text = (text || "").trim();
    if (!text || window.Vecode.Agent.running) return;
    const cfg = window.Vecode.Providers.activeConfig();
    if (!cfg.model) { toast("Pick a model first — use the Models button up top.", "err"); return; }
    if (cfg.needsKey && !cfg.key && !cfg.token) {
      toast("Add an API key for " + cfg.id + " in Models, or switch to the free tier.", "err"); return;
    }

    S().addMessage({ role: "user", content: text, ts: Date.now() });
    chat.render();
    setConn("busy", "building");
    setRunningUI(true);

    chat.addStreaming("build");
    try {
      await window.Vecode.Agent.run(text, "build");
      if (S().settings.review && !window.Vecode.Agent._abort.aborted) {
        chat.finalize();
        chat.addStreaming("review");
        await window.Vecode.Agent.run("", "review");
      }
      setConn("ok", "done");
    } catch (e) {
      console.error(e);
      setConn("err", "error");
      const isNet = e instanceof TypeError || (e && e.name === "TypeError");
      const hint = (window.Vecode.State.settings.provider === "free" && isNet)
        ? " — couldn't reach the free gateway (it may be down or blocking browser requests). Try a BYOK provider for now."
        : "";
      toast(((e && e.message) ? e.message : String(e)).slice(0, 240) + hint, "err");
    } finally {
      chat.finalize();
      setRunningUI(false);
      $("#statusAction").textContent = "ready";
    }
  }

  function setRunningUI(running) {
    $("#sendBtn").style.display = running ? "none" : "";
    $("#stopBtn").style.display = running ? "" : "none";
    $("#chatInput").disabled = running;
  }

  function setConn(state, label) {
    const dot = $("#connDot");
    dot.className = "conn-dot " + state;
    $("#connLabel").textContent = label || "";
  }

  /* ================= agent event wiring ================= */
  function wireAgent() {
    const A = window.Vecode.Agent;
    A.on("delta", (d) => { if (d.mode === "build" || d.mode === "review") chat.streamDelta(d.text); });
    A.on("status", (s) => {
      if (s.label) {
        $("#statusAction").textContent = s.label;
        chat.setWorkingStatus(s.label);
      }
    });
    A.on("iteration", (n) => {
      $("#statusAction").textContent = "step " + n;
      chat.setWorkingStatus(chat.streamingMode === "review" ? "Reviewing… (step " + n + ")" : "Building… (step " + n + ")");
    });
    A.on("usage", (u) => {
      $("#statusTokens").textContent = "≈" + Math.round((u.input + u.output) / 1000) + "k tok";
    });
    A.on("error", () => { setConn("err", "error"); });
    A.on("stopped", () => { setConn("ok", "stopped"); });
  }

  /* ================= composer ================= */
  const PROMPT_IDEAS = [
    "A landing page for a coffee roaster called Ember & Oak",
    "A personal portfolio for a photographer",
    "A three-tier pricing page for my SaaS",
    "A docs site for a small API",
    "A warm editorial blog about slow living",
    "A café website with menu and opening hours"
  ];

  function renderPromptChips() {
    const box = $("#promptChips");
    box.innerHTML = "";
    for (const idea of PROMPT_IDEAS) {
      box.appendChild(el("button", { class: "prompt-chip", text: idea, onclick: () => { $("#chatInput").value = idea; $("#chatInput").focus(); } }));
    }
  }

  /* ================= preview toolbar ================= */
  function renderPreviewToolbar() {
    const seg = $("#deviceSeg");
    seg.innerHTML = "";
    for (const d of [["desktop", "Desktop"], ["tablet", "Tablet"], ["mobile", "Mobile"]]) {
      seg.appendChild(el("button", { class: d[0] === preview.device ? "active" : "", text: d[1], onclick: (e) => { preview.device = d[0]; $("#previewFrame").dataset.device = d[0]; $$("#deviceSeg button").forEach((b) => b.classList.remove("active")); e.currentTarget.classList.add("active"); } }));
    }
  }

  /* ================= files view ================= */
  function renderFiles() {
    const box = $("#view-files");
    const S = () => window.Vecode.State;
    box.innerHTML = "";
    box.appendChild(el("div", { class: "panel panel-narrow" }, buildFilesPanel()));
  }

  function buildFilesPanel() {
    const S = () => window.Vecode.State;
    const head = el("div", { class: "panel-head" }, [
      el("h2", { class: "panel-title", text: "Files" }),
      el("p", { class: "panel-sub", text: "Every file the agent writes lives here, in your browser. Drag in your own HTML, CSS or JS to add it to the project." })
    ]);

    const tree = el("div", { class: "card" }, [el("div", { class: "card-title", text: "Project files" })]);
    const list = el("div", { style: "margin-top:8px" });
    tree.appendChild(list);
    renderTree(list);

    const addRow = el("div", { class: "input-row", style: "margin-top:12px" }, [
      el("input", { class: "text-input", placeholder: "new-file.html", id: "newFileName" }),
      el("button", { class: "btn btn-sm", text: "Add", onclick: () => {
        const name = $("#newFileName").value.trim();
        if (!name) return;
        if (!/^[a-zA-Z0-9_\-./]+$/.test(name) || name.includes("..")) { toast("Use a simple relative name like pages/about.html", "err"); return; }
        if (S().readFile(name) !== null) { toast("That file already exists", "err"); return; }
        const ext = name.split(".").pop();
        const starter = ext === "html" ? "<!DOCTYPE html>\n<html>\n<head><title>New page</title></head>\n<body></body>\n</html>"
          : ext === "css" ? "/* " + name + " */\n"
          : ext === "js" ? "// " + name + "\n"
          : "";
        S().writeFile(name, starter);
        renderTree(list);
        toast("Created " + name, "ok");
      } })
    ]);
    tree.appendChild(addRow);

    const drop = el("div", { class: "dropzone", style: "margin-top:16px" }, [
      el("p", { style: "margin:0 0 4px", html: "<b>Drop files here</b> — HTML, CSS, JS, SVG, images" }),
      el("p", { class: "small muted", style: "margin:0", text: "They are added to the project and the agent can use them." })
    ]);
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("drag"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("drag");
      importDroppedFiles(e.dataTransfer.files);
    });

    const exportRow = el("div", { class: "card", style: "margin-top:16px" }, [
      el("div", { class: "card-title", text: "Export & backup" }),
      el("p", { class: "card-sub", text: "Grab your work: a ready-to-deploy ZIP (with netlify.toml), a single self-contained HTML file, or a project backup you can import later." }),
      el("div", { class: "input-row", style: "flex-wrap:wrap" }, [
        el("button", { class: "btn btn-signal btn-sm", text: "Download ZIP", onclick: exportZip }),
        el("button", { class: "btn btn-sm", text: "Single HTML", onclick: exportSingleHtml }),
        el("button", { class: "btn btn-sm", text: "Backup project", onclick: exportProjectJson }),
        el("button", { class: "btn btn-sm", text: "Import backup", onclick: importProjectJson })
      ])
    ]);

    const starters = el("div", { class: "card", style: "margin-top:16px" }, [
      el("div", { class: "card-title", text: "Start from a template" }),
      el("p", { class: "card-sub", text: "Hand-built with the design skill — pick one and the agent takes it further." }),
      el("div", { class: "template-grid" }, window.Vecode.Templates.map((t) =>
        el("button", { class: "template-tile", onclick: () => loadTemplate(t.id) }, [
          el("div", { class: "t-name", text: t.name }),
          el("div", { class: "t-desc", text: t.tagline })
        ])
      )),
      el("button", { class: "btn btn-sm", style: "margin-top:12px", text: "New empty project", onclick: newProject })
    ]);

    return [head, tree, drop, exportRow, starters];
  }

  function renderTree(list) {
    const S = () => window.Vecode.State;
    list.innerHTML = "";
    for (const p of S().listFiles()) {
      const bytes = S().fileSize(p);
      const row = el("div", { class: "file-row" }, [
        el("button", { class: "fname", type: "button", title: "Edit " + p, text: p, onclick: () => openFileEditor(p, list) }),
        el("span", { class: "fsize", text: bytes > 1024 ? (bytes / 1024).toFixed(1) + " KB" : bytes + " B" }),
        el("button", { class: "icon-btn fdel", title: "Delete", html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.8 9.5h6.4L12 4"/></svg>', onclick: () => {
          if (S().state.files["index.html"] && p === "index.html" && Object.keys(S().state.files).length === 1) { toast("Keep at least one file — try adding a page first", "err"); return; }
          if (confirm("Delete " + p + "?")) { S().deleteFile(p); renderTree(list); }
        } }),
        el("button", { class: "icon-btn fdel", title: "Preview this page", html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z"/><circle cx="8" cy="8" r="1.8"/></svg>', onclick: () => { if (p.endsWith(".html")) { preview.page = p; preview.render(); switchView("build"); } else toast("Only HTML pages can be previewed directly", "err"); } })
      ]);
      list.appendChild(row);
    }
    if (!list.children.length) list.appendChild(el("p", { class: "small muted", text: "No files yet." }));
  }

  function openFileEditor(path, list) {
    const content = S().readFile(path);
    if (content === null) { toast("That file no longer exists", "err"); return; }
    if (/^data:[^,]*;base64,/i.test(content)) {
      toast("Binary assets can be previewed and exported, but not edited as text.", "err");
      return;
    }
    const editor = el("textarea", {
      class: "text-input file-editor",
      id: "fileEditor",
      spellcheck: "false",
      "aria-label": "Contents of " + path
    });
    editor.value = content;
    const saveButton = el("button", { class: "btn btn-signal", text: "Save file", onclick: () => {
      S().writeFile(path, editor.value);
      if (list && document.body.contains(list)) renderTree(list);
      closeModal();
      preview.refreshSoon();
      toast("Saved " + path, "ok");
    } });
    openModal("Edit " + path, editor, [
      el("button", { class: "btn", text: "Cancel", onclick: closeModal }),
      saveButton
    ], true);
    setTimeout(() => editor.focus(), 0);
  }

  function readFileAsDataUri(file) {
    return new Promise((resolve, reject) => {
      if (typeof FileReader !== "undefined") {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error || new Error("Could not read file"));
        reader.readAsDataURL(file);
        return;
      }
      if (file.arrayBuffer) {
        file.arrayBuffer().then((buffer) => {
          const bytes = new Uint8Array(buffer);
          let binary = "";
          for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
          resolve("data:" + (file.type || "application/octet-stream") + ";base64," + btoa(binary));
        }, reject);
        return;
      }
      reject(new Error("Binary file reading is not supported in this browser"));
    });
  }

  async function importDroppedFiles(fileList) {
    const files = Array.from(fileList || []);
    let imported = 0;
    for (const file of files) {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const textLike = /^text\//i.test(file.type || "")
        || /^(?:application\/(?:json|javascript|xml)|image\/svg\+xml)$/i.test(file.type || "")
        || /^(?:html?|css|js|mjs|cjs|json|md|txt|csv|xml|svg|toml|ya?ml)$/i.test(ext);
      try {
        const content = textLike ? await file.text() : await readFileAsDataUri(file);
        S().writeFile(file.name, content);
        imported++;
      } catch (e) {
        toast("Could not read " + file.name + ": " + (e.message || e), "err");
      }
    }
    toast("Imported " + imported + " file(s)", imported ? "ok" : "err");
    renderFiles();
    preview.refreshSoon();
  }

  function exportZip() {
    const S = () => window.Vecode.State;
    const files = Object.assign({}, S().state.files);
    files["netlify.toml"] = NETLIFY_TOML;
    files["DEPLOY.md"] = DEPLOY_MD;
    const blob = window.Vecode.Zip.makeZip(files);
    window.Vecode.Zip.downloadBlob(blob, slug(S().state.name) + ".zip");
    toast("ZIP exported — drop it on app.netlify.com/drop to go live", "ok");
  }

  function exportSingleHtml() {
    const S = () => window.Vecode.State;
    const html = preview.inlineAssets(S().readFile("index.html") || "");
    const blob = new Blob([html], { type: "text/html" });
    window.Vecode.Zip.downloadBlob(blob, slug(S().state.name) + ".html");
    toast("Single-file HTML downloaded", "ok");
  }

  function exportProjectJson() {
    const S = () => window.Vecode.State;
    const blob = new Blob([JSON.stringify({ app: "vecode", version: 1, name: S().state.name, files: S().state.files, messages: S().state.messages }, null, 2)], { type: "application/json" });
    window.Vecode.Zip.downloadBlob(blob, slug(S().state.name) + ".vecode.json");
  }

  function importProjectJson() {
    const input = el("input", { type: "file", accept: ".json,application/json", style: "display:none" });
    document.body.appendChild(input);
    input.onchange = async () => {
      const f = input.files && input.files[0];
      input.remove();
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data || data.app !== "vecode" || !data.files) throw new Error("Not a Vecode backup");
        S().resetProject(data.files, data.messages || [], data.name || "Imported project");
        preview.page = "index.html";
        preview.render();
        chat.render();
        toast("Backup imported", "ok");
      } catch (e) { toast("Could not read that backup: " + e.message, "err"); }
    };
    input.click();
  }

  function newProject() {
    if (!confirm("Start a new empty project? Your current files stay on this browser until overwritten.")) return;
    S().resetProject(null, [], "Untitled project");
    preview.page = "index.html";
    preview.render();
    chat.render();
  }

  function slug(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "vecode-site";
  }

  const NETLIFY_TOML = `# Generated by Vecode — static site, no build step
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-Frame-Options = "SAMEORIGIN"
`;

  const DEPLOY_MD = `# Deploying this site to Netlify

## Fastest: Netlify Drop
1. Keep this ZIP.
2. Go to https://app.netlify.com/drop in your browser.
3. Drag this folder (or the ZIP) onto the page.
4. Netlify uploads it and gives you a live URL in seconds.

## With the CLI
    npm i -g netlify-cli
    unzip <this file>
    cd <folder>
    netlify deploy --prod

## With Git
1. Push this folder to a GitHub/GitLab repo.
2. In Netlify: Add new site → Import an existing project → pick the repo.
3. Build command: (none — static)   Publish directory: .

Notes
- netlify.toml is included: it sets security headers and the publish directory.
- If the site has forms, they use Netlify Forms — submissions appear in the Netlify dashboard.
- Custom domains: Site settings → Domain management → Add custom domain.
`;

  /* ================= plugins view ================= */
  function renderPlugins() {
    const box = $("#view-plugins");
    box.innerHTML = "";
    const S = () => window.Vecode.State;
    const wrap = el("div", { class: "panel panel-narrow" });

    wrap.appendChild(el("div", { class: "panel-head" }, [
      el("h2", { class: "panel-title", text: "Plugins" }),
      el("p", { class: "panel-sub", text: "Plugins change what the agent builds and inject real code into your project. Toggle them before you ask for something new." })
    ]));

    for (const p of window.Vecode.Plugins.PLUGINS) {
      const cfg = S().getPlugin(p.id);
      const card = el("div", { class: "card plugin-card" }, [
        el("div", { class: "plugin-ico", html: p.icon }),
        el("div", { class: "plugin-body" }, [
          el("div", { class: "card-title" }, [
            el("span", { text: p.name }),
            el("span", { class: "plugin-tag", text: p.id })
          ]),
          el("p", { class: "plugin-desc", text: p.tagline }),
          el("label", { class: "switch", title: "Toggle" }, [
            el("input", { type: "checkbox", checked: cfg.enabled ? "checked" : null, onchange: (e) => { S().setPlugin(p.id, e.target.checked); applyPluginInjectionsNow(); renderPlugins(); } }),
            el("span", { class: "track" })
          ])
        ])
      ]);
      if (cfg.enabled && p.hasOptions) {
        const opts = el("div", { class: "plugin-opt" }, [el("span", { text: p.optionLabel })]);
        if (p.getOptions) {
          opts.appendChild(el("select", { class: "text-input", style: "width:auto", onchange: (e) => {
            S().setPlugin(p.id, true, Object.assign({}, S().getPlugin(p.id).options, { preset: e.target.value }));
            applyPluginInjectionsNow();
          } }, p.getOptions().map((o) =>
            el("option", { value: o.value, selected: (S().getPlugin(p.id).options && S().getPlugin(p.id).options.preset) === o.value ? "selected" : null, text: o.label })
          )));
        }
        if (p.id === "analytics") {
          opts.appendChild(el("input", { class: "text-input", style: "width:200px", placeholder: "your-site.netlify.app", value: S().getPlugin(p.id).options.domain || "", onchange: (e) => {
            S().setPlugin(p.id, true, Object.assign({}, S().getPlugin(p.id).options, { domain: e.target.value.trim() }));
            applyPluginInjectionsNow();
          } }));
        }
        card.querySelector(".plugin-body").appendChild(opts);
      }
      wrap.appendChild(card);
    }

    // custom skills (self-learning)
    const skillsCard = el("div", { class: "card", style: "margin-top:16px" }, [
      el("div", { class: "card-title", text: "Your skills" }),
      el("p", { class: "card-sub", text: "Teach the agent anything — a tone of voice, a component pattern, a house style. Saved on this browser and injected into every build." })
    ]);
    const skillsList = el("div", { style: "margin-bottom:12px" });
    const renderSkills = () => {
      skillsList.innerHTML = "";
      const skills = S().getSkills();
      if (!skills.length) skillsList.appendChild(el("p", { class: "small muted", text: "No custom skills yet." }));
      for (const s of skills) {
        skillsList.appendChild(el("div", { class: "file-row" }, [
          el("span", { class: "fname", html: "<b>" + esc(s.name) + "</b> — " + esc(s.body.slice(0, 80)) + (s.body.length > 80 ? "…" : "") }),
          el("button", { class: "icon-btn fdel", html: closeIcon(), onclick: () => { S().removeSkill(s.id); renderSkills(); } })
        ]));
      }
    };
    renderSkills();
    skillsCard.appendChild(skillsList);
    skillsCard.appendChild(el("div", { class: "input-row", style: "align-items:flex-start" }, [
      el("div", { style: "flex:1;display:flex;flex-direction:column;gap:8px" }, [
        el("input", { class: "text-input", placeholder: "Skill name — e.g. “Minimal Swiss style”", id: "skillName" }),
        el("textarea", { class: "text-input", placeholder: "Instructions the agent must follow…", id: "skillBody", style: "min-height:70px" })
      ]),
      el("button", { class: "btn btn-sm", text: "Add skill", onclick: () => {
        const name = $("#skillName").value.trim();
        const body = $("#skillBody").value.trim();
        if (!name || !body) { toast("Give the skill a name and instructions", "err"); return; }
        S().addSkill(name, body);
        $("#skillName").value = ""; $("#skillBody").value = "";
        renderSkills();
        toast("Skill added — it applies to the next build", "ok");
      } })
    ]));
    wrap.appendChild(skillsCard);
    box.appendChild(wrap);
  }

  function applyPluginInjectionsNow() {
    // when toggling a plugin mid-project, apply its code injections
    window.Vecode.Agent.applyPluginInjections();
    preview.refreshSoon();
  }

  /* ================= skill view ================= */
  function renderSkill() {
    const box = $("#view-skill");
    box.innerHTML = "";
    const wrap = el("div", { class: "panel panel-narrow" });

    const hero = el("div", { class: "card skill-hero", style: "position:relative" }, [
      el("div", { style: "flex:1;min-width:260px" }, [
        el("p", { class: "mono", style: "font-size:11px;letter-spacing:0.12em;color:var(--signal);margin:0 0 8px", text: "VECODE DESIGN SKILL — V1" }),
        el("h2", { class: "panel-title", style: "font-size:34px", text: "Scientific humanism, codified." }),
        el("p", { class: "panel-sub", html: "The agent designs with this skill on every build. Adapted from the <b>Minc Frontend Design Skill</b> (MIT, by Minc), inspired by the Kimi Visual Identity System: precision and warmth held in tension — one signal color, three type roles, two grid modes, quiet texture, human voice." })
      ]),
      el("div", { style: "flex:none" }, [
        el("div", { class: "swatch-row" }, window.Vecode.Skill.SWATCHES.map((s) =>
          el("div", { class: "swatch", style: "background:" + s.hex, title: s.name + " " + s.hex })
        )),
        el("p", { class: "small muted mono", style: "margin:0", text: "the token preset — one signal family, neutrals do the work" })
      ])
    ]);

    wrap.appendChild(hero);
    wrap.appendChild(el("h3", { class: "rail-label", text: "THE SIX-STEP WORKFLOW" }));
    for (const st of window.Vecode.Skill.STEPS) {
      wrap.appendChild(el("div", { class: "step-card" }, [
        el("div", { class: "step-kicker mono", text: "STEP " + st.n }),
        el("div", {}, [el("h4", { style: "margin:0 0 4px", text: st.title }), el("p", { class: "small muted", style: "margin:0", text: st.body })])
      ]));
    }

    wrap.appendChild(el("h3", { class: "rail-label", style: "margin-top:24px", text: "THE FULL SKILL" }));
    wrap.appendChild(el("div", { class: "card markdown-body" }));
    const mdCard = wrap.querySelector(".markdown-body");
    mdCard.innerHTML = mdLight(window.Vecode.Skill.SKILL_MD);
    mdCard.querySelectorAll("pre").forEach((pre) => {
      pre.style.maxHeight = "360px"; pre.style.overflow = "auto";
    });

    wrap.appendChild(el("p", { class: "small muted", style: "margin-top:16px", html: "The skill also ships in this repo under <code>skill/</code> — drop that folder into any agent's skills directory (e.g. <code>.claude/skills/</code>) and it works outside Vecode too. Source: <a href=\"https://github.com/morriszdweck/minc-frontend-design\" target=\"_blank\" rel=\"noopener\">github.com/morriszdweck/minc-frontend-design</a>." }));
    box.appendChild(wrap);

    window.setTimeout(() => {
      try { if (window.decodingTexture) window.decodingTexture(hero, { opacity: 0.045, cell: 22, animated: true }); } catch (e) { /* texture is decorative */ }
    }, 0);
  }

  /* ================= deploy view ================= */
  function renderDeploy() {
    const box = $("#view-deploy");
    box.innerHTML = "";
    const wrap = el("div", { class: "panel panel-narrow" });
    wrap.appendChild(el("div", { class: "panel-head" }, [
      el("h2", { class: "panel-title", text: "Deploy to Netlify" }),
      el("p", { class: "panel-sub", text: "Free static hosting, HTTPS and a live URL in under a minute. The export already includes netlify.toml with sensible defaults — no build step needed." })
    ]));

    const steps = [
      {
        title: "Download your site as a ZIP",
        body: "Everything the agent built, plus netlify.toml and a deploy cheat-sheet.",
        action: el("button", { class: "btn btn-signal btn-sm", text: "Download ZIP", onclick: exportZip })
      },
      {
        title: "Drag it onto Netlify Drop",
        body: "Open app.netlify.com/drop in a new tab and drop the ZIP (or the extracted folder) onto the page. Netlify uploads and gives you a live URL — usually in seconds. That's the whole deploy.",
        action: el("a", { class: "btn btn-sm", href: "https://app.netlify.com/drop", target: "_blank", rel: "noopener", text: "Open Netlify Drop ↗" })
      },
      {
        title: "Alternative: the Netlify CLI",
        body: "Prefer the terminal? One command deploys the exported folder.",
        cmd: "npm i -g netlify-cli\ncd <your-exported-folder>\nnetlify deploy --prod",
        action: null
      },
      {
        title: "Alternative: import from Git",
        body: "Push the folder to GitHub or GitLab, then in Netlify choose “Add new site → Import an existing project”. Publish directory: ., build command: none.",
        action: null
      },
      {
        title: "Make it yours",
        body: "Netlify → Site settings → Domain management lets you add a custom domain and enable HTTPS. Forms you built with the Netlify Forms plugin receive submissions in the Netlify dashboard — no backend needed.",
        action: null
      }
    ];

    for (const [i, st] of steps.entries()) {
      const row = el("div", { class: "deploy-step" }, [
        el("div", { class: "deploy-num", text: String(i + 1) }),
        el("div", { style: "flex:1" }, [
          el("h3", { style: "margin:0 0 4px;font-size:15px", text: st.title }),
          el("p", { class: "small muted", style: "margin:0 0 8px", text: st.body }),
          st.cmd ? el("div", { class: "cmd-block" }, [
            el("code", { text: st.cmd }),
            el("button", { class: "btn btn-sm", text: "Copy", onclick: (e) => { navigator.clipboard.writeText(st.cmd); e.target.textContent = "Copied"; setTimeout(() => (e.target.textContent = "Copy"), 1400); } })
          ]) : null,
          st.action || null
        ])
      ]);
      wrap.appendChild(row);
    }

    wrap.appendChild(el("div", { class: "card", style: "margin-top:8px" }, [
      el("div", { class: "card-title", text: "Already deployed?" }),
      el("p", { class: "small muted", style: "margin:4px 0 0", html: "Share the URL. Every new build is a fresh ZIP — redeploying is the same two steps. Vecode itself is a static site too: <code>index.html</code> + <code>css/</code> + <code>js/</code> + <code>skill/</code>, with this <code>netlify.toml</code> — drag this repo onto Netlify Drop and Vecode runs anywhere." })
    ]));
    box.appendChild(wrap);
  }

  /* ================= settings / providers modal ================= */
  function renderSettingsModal() {
    const S = () => window.Vecode.State;
    const body = el("div", {});

    body.appendChild(el("h3", { class: "rail-label", text: "MODEL PROVIDER — BRING YOUR OWN KEY, OR BUILD FREE" }));
    for (const p of window.Vecode.Providers.REGISTRY) {
      body.appendChild(buildProviderCard(p));
    }

    body.appendChild(el("h3", { class: "rail-label", style: "margin-top:20px", text: "GENERAL" }));

    // temperature
    const tempRow = el("div", { class: "field" }, [
      el("label", { text: "Creativity (temperature): " + S().settings.temperature.toFixed(1) }),
      el("input", { type: "range", min: "0", max: "1.2", step: "0.1", value: String(S().settings.temperature), oninput: (e) => { S().setSetting("temperature", parseFloat(e.target.value)); tempRow.querySelector("label").textContent = "Creativity (temperature): " + parseFloat(e.target.value).toFixed(1); } })
    ]);
    body.appendChild(tempRow);

    // review toggle
    body.appendChild(el("div", { class: "card", style: "display:flex;gap:12px;align-items:flex-start;margin-bottom:12px" }, [
      el("label", { class: "switch", style: "margin-top:2px" }, [
        el("input", { type: "checkbox", checked: S().settings.review ? "checked" : null, onchange: (e) => S().setSetting("review", e.target.checked) }),
        el("span", { class: "track" })
      ]),
      el("div", {}, [
        el("div", { class: "card-title", text: "Design review pass" }),
        el("p", { class: "small muted", style: "margin:2px 0 0", text: "After each build, the agent re-reads its own work against the anti-slop checklist and fixes what fails. This is the self-improvement loop — leave it on." })
      ])
    ]));

    // theme
    const themeRow = el("div", { class: "input-row", style: "margin-bottom:12px" }, [
      el("label", { class: "small", text: "Appearance", style: "font-weight:600" }),
      el("select", { class: "text-input", style: "width:auto", onchange: (e) => applyTheme(e.target.value) },
        [["dark", "Dark"], ["light", "Light"], ["system", "System"]].map(([v, l]) => el("option", { value: v, selected: S().settings.theme === v ? "selected" : null, text: l })))
    ]);
    body.appendChild(themeRow);

    body.appendChild(el("p", { class: "small muted", html: "<b>Privacy note.</b> Keys and tokens stay in your browser's localStorage — they are sent only to the provider you chose. Vecode has no server. The free tier calls the osaii gateway directly with no key, poolside models only." }));

    openModal("Models & settings", body, [el("button", { class: "btn btn-signal", text: "Done", onclick: closeModal })], true);
  }

  function buildProviderCard(meta) {
    const S = () => window.Vecode.State;
    const active = S().settings.provider === meta.id;
    const saved = S().getProvider(meta.id);
    const card = el("div", { class: "provider-card" + (active ? " active" : ""), onclick: (e) => {
      if (e.target.closest("input, select, button, a")) return;
      S().setActiveProvider(meta.id);
      renderSettingsModal();
    } }, [
      el("span", { class: "p-radio", html: active ? '<svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="var(--signal)"/><circle cx="8" cy="8" r="2.6" fill="#fff"/></svg>' : '<svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="var(--border-strong)" stroke-width="1.5"/></svg>' }),
      el("div", { class: "provider-logo", text: meta.logo }),
      el("div", { class: "provider-main" }, [
        el("div", { class: "provider-name" }, [
          el("span", { text: meta.name }),
          meta.badge ? el("span", { class: meta.badgeClass || "oauth-badge", text: meta.badge }) : null
        ]),
        el("p", { class: "provider-desc", text: meta.desc })
      ])
    ]);

    if (active) {
      const cfg = el("div", { class: "provider-config" });
      if (meta.id === "free") {
        const modelSelect = el("select", { class: "text-input", id: "freeModelSelect", onchange: (e) => S().setProvider("free", { model: e.target.value }) });
        const refresh = el("button", { class: "btn btn-sm", text: "Refresh list", onclick: async (e) => {
          e.target.textContent = "Loading…";
          const models = await window.Vecode.Providers.fetchFreeModels();
          fillFreeModels(modelSelect, models);
          e.target.textContent = "Refreshed";
          setTimeout(() => (e.target.textContent = "Refresh list"), 1600);
        } });
        const fillFreeModels = (sel, models) => {
          sel.innerHTML = "";
          for (const m of models) {
            sel.appendChild(el("option", { value: m, selected: (saved.model || meta.defaultModel) === m ? "selected" : null, text: m }));
          }
        };
        fillFreeModels(modelSelect, window.Vecode.Providers.FREE_MODELS_FALLBACK);
        window.Vecode.Providers.fetchFreeModels().then((models) => { if (document.body.contains(modelSelect)) fillFreeModels(modelSelect, models); });
        cfg.appendChild(el("div", { class: "input-row" }, [
          el("label", { class: "small", text: "Model", style: "font-weight:600" }),
          modelSelect, refresh
        ]));
        cfg.appendChild(el("p", { class: "small muted", style: "margin-top:8px", html: "Free and keyless via the osaii gateway — poolside Laguna models only (frontier-class reasoning and a light fast model). No signup, no card, works right now. <a href=\"https://osaii.wyvernhub.net/api/v1/models\" target=\"_blank\" rel=\"noopener\">See the live model list ↗</a>" }));
      } else if (meta.id === "codex") {
        const status = el("div", {});
        const connected = saved.token || saved.key;
        const renderStatus = () => {
          status.innerHTML = "";
          if (connected) {
            status.appendChild(el("p", { class: "small", html: "<span class=\"conn-dot ok\"></span>Connected — requests bill to your ChatGPT plan." }));
            status.appendChild(el("button", { class: "btn btn-sm", style: "margin-top:6px", text: "Disconnect", onclick: () => { window.Vecode.Providers.codexDisconnect(); renderSettingsModal(); } }));
          } else {
            status.appendChild(el("button", { class: "btn btn-signal btn-sm", text: "Sign in with ChatGPT", onclick: startCodexOAuth }));
          }
        };
        renderStatus();
        cfg.appendChild(status);
        cfg.appendChild(el("div", { class: "field", style: "margin-top:10px" }, [
          el("label", { text: "…or paste an access token (from `codex login` — ~/.codex/auth.json)" }),
          el("div", { class: "input-row" }, [
            el("input", { class: "text-input", type: "password", id: "codexTokenInput", placeholder: "paste token", value: saved.key || "", onchange: (e) => S().setProvider("codex", { key: e.target.value.trim() }) }),
            el("button", { class: "btn btn-sm", text: "Save", onclick: () => { S().setProvider("codex", { key: $("#codexTokenInput").value.trim() }); toast("Saved", "ok"); } })
          ])
        ]));
        cfg.appendChild(el("div", { class: "field" }, [
          el("label", { text: "Model" }),
          el("input", { class: "text-input", list: "dl-codex", value: saved.model || meta.defaultModel, onchange: (e) => S().setProvider("codex", { model: e.target.value }) })
        ]));
        cfg.appendChild(el("p", { class: "small muted", html: "Uses the same device-code OAuth flow as <code>codex login</code>. Tip: if your ChatGPT account's “Device code authorization for Codex” setting is off, the sign-in will be rejected — enable it under ChatGPT → Settings → Security." }));
        appendDatalist("dl-codex", meta.models);
      } else {
        if (meta.needsKey) {
          cfg.appendChild(el("div", { class: "field" }, [
            el("label", { text: meta.keyLabel }),
            el("input", { class: "text-input", type: "password", placeholder: meta.keyHint, value: saved.key || "", onchange: (e) => S().setProvider(meta.id, { key: e.target.value.trim() }) })
          ]));
        }
        if (meta.id === "custom") {
          cfg.appendChild(el("div", { class: "field" }, [
            el("label", { text: "Base URL (OpenAI-compatible)" }),
            el("input", { class: "text-input", placeholder: "https://your-endpoint.example/v1", value: saved.baseUrl || "", onchange: (e) => S().setProvider("custom", { baseUrl: e.target.value.trim() }) })
          ]));
          cfg.appendChild(el("div", { class: "field" }, [
            el("label", { text: "API key (optional)" }),
            el("input", { class: "text-input", type: "password", placeholder: "paste your key — the opencode way", value: saved.key || "", onchange: (e) => S().setProvider("custom", { key: e.target.value.trim() }) })
          ]));
        }
        cfg.appendChild(el("div", { class: "field" }, [
          el("label", { text: "Model" }),
          el("input", { class: "text-input", list: "dl-" + meta.id, value: saved.model || meta.defaultModel, onchange: (e) => S().setProvider(meta.id, { model: e.target.value }) })
        ]));
        appendDatalist("dl-" + meta.id, meta.models);
        if (meta.link) cfg.appendChild(el("p", { class: "small muted", html: "Get a key: <a href=\"" + meta.link + "\" target=\"_blank\" rel=\"noopener\">" + meta.link.replace("https://", "") + " ↗</a>" }));
      }
      cfg.appendChild(el("button", { class: "btn btn-sm", style: "margin-top:4px", text: "Test connection", onclick: async (e) => {
        e.target.disabled = true;
        e.target.textContent = "Testing…";
        try {
          const r = await window.Vecode.Providers.testConnection(meta.id);
          e.target.textContent = "OK — " + r.ms + " ms · “" + r.reply + "”";
          setConn("ok", "connected");
        } catch (err) {
          e.target.textContent = "Failed: " + (err && err.message ? err.message : String(err)).slice(0, 90);
          setConn("err", "error");
        }
        setTimeout(() => { e.target.disabled = false; }, 2500);
      } }));
      card.appendChild(cfg);
    }
    return card;
  }

  function appendDatalist(id, models) {
    let dl = $("#" + id);
    if (!dl) {
      dl = el("datalist", { id });
      document.body.appendChild(dl);
    }
    dl.innerHTML = "";
    for (const m of models || []) dl.appendChild(el("option", { value: m }));
  }

  /* ---------------- Codex OAuth modal ---------------- */
  async function startCodexOAuth() {
    let flow;
    try {
      flow = await window.Vecode.Providers.codexStartDeviceFlow();
    } catch (e) {
      toast("Could not start Codex sign-in: " + (e.message || e) + " — if this is a browser/CORS block, use the paste-token option instead.", "err");
      return;
    }
    const codeDisplay = el("div", { class: "cmd-block", style: "justify-content:center;font-size:26px;letter-spacing:0.2em;padding:16px", text: flow.userCode });
    const link = el("a", { href: flow.verificationUrl, target: "_blank", rel: "noopener", text: "Open " + flow.verificationUrl + " ↗", style: "display:block;text-align:center;margin:8px 0 4px" });
    const status = el("p", { class: "small muted", style: "text-align:center", text: "Waiting for you to authorize…" });
    const btn = el("button", { class: "btn btn-sm", text: "Cancel", onclick: () => { if (ac) ac.abort(); closeModal(); } });
    const ac = new AbortController();

    openModal("Sign in with ChatGPT", el("div", {}, [
      el("p", { class: "small muted", html: "On the device where you're signed into ChatGPT:" }),
      el("ol", { style: "padding-left:20px;font-size:14px;line-height:2" }, [
        el("li", { html: "Open the link below and enter this one-time code" }),
        el("li", { text: "Approve the sign-in — the page here connects automatically" })
      ]),
      codeDisplay, link, status
    ]), [btn]);

    try {
      const tokens = await window.Vecode.Providers.codexPollAndExchange(flow, ac.signal, (s) => { status.textContent = s.message; });
      window.Vecode.State.setProvider("codex", tokens);
      window.Vecode.State.setActiveProvider("codex");
      status.textContent = "Connected ✓";
      toast("ChatGPT connected — Codex will bill your plan", "ok");
      setTimeout(closeModal, 900);
      renderSettingsModal();
    } catch (e) {
      status.textContent = e.message || String(e);
      status.classList.add("toast", "err");
      if (!ac.signal.aborted) {
        const retry = el("button", { class: "btn btn-sm", style: "margin-top:8px", text: "Try again", onclick: () => { closeModal(); startCodexOAuth(); } });
        status.parentElement.appendChild(retry);
      }
    }
  }

  /* ================= theme ================= */
  function applyTheme(theme) {
    S().setSetting("theme", theme);
    document.documentElement.dataset.theme = theme === "system" ? "system" : theme;
  }

  /* ================= onboarding ================= */
  function maybeOnboard() {
    try {
      if (localStorage.getItem("vecode.v1.onboarded")) return;
      localStorage.setItem("vecode.v1.onboarded", "1");
    } catch (e) { /* file:// opaque origin — skip persistence, still show onboarding */ }
    const body = el("div", {}, [
      el("p", { class: "small muted", html: "Vecode is a website builder that runs an AI coding agent entirely in your browser. The free tier needs no key — pick a template or just describe your site." }),
      el("div", { class: "onboard-steps", style: "margin:16px 0" }, [
        el("div", { class: "step" }, [el("div", { class: "step-num", text: "1" }), el("div", {}, [el("h4", { text: "Describe the site" }), el("p", { text: "One sentence is plenty — “a landing page for my pottery studio”. The agent writes real HTML, CSS and JS." })])]),
        el("div", { class: "step" }, [el("div", { class: "step-num", text: "2" }), el("div", {}, [el("h4", { text: "Watch it build in the preview" }), el("p", { text: "Files stream in live. Tell it to go darker, add a pricing section, anything — it edits the same files." })])]),
        el("div", { class: "step" }, [el("div", { class: "step-num", text: "3" }), el("div", {}, [el("h4", { text: "Deploy to Netlify in two steps" }), el("p", { text: "Download the ZIP, drop it on app.netlify.com/drop. Live URL, HTTPS, done." })])])
      ]),
      el("h3", { class: "rail-label", text: "START FROM A TEMPLATE — OR BLANK" }),
      el("div", { class: "template-grid" }, window.Vecode.Templates.map((t) =>
        el("button", { class: "template-tile", onclick: () => { loadTemplate(t.id); closeModal(); } }, [
          el("div", { class: "t-name", text: t.name }),
          el("div", { class: "t-desc", text: t.tagline })
        ])
      ))
    ]);
    openModal("Welcome to Vecode", body, [el("button", { class: "btn btn-signal", text: "Start blank", onclick: closeModal })], true);
  }

  /* ================= topbar ================= */
  function renameProjectModal() {
    const input = el("input", {
      class: "text-input",
      id: "projectNameInput",
      value: S().state.name,
      maxlength: "80",
      "aria-label": "Project name"
    });
    const save = () => {
      const name = input.value.trim();
      if (!name) { toast("Give the project a name", "err"); input.focus(); return; }
      S().renameProject(name);
      closeModal();
      toast("Project renamed", "ok");
    };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); save(); } });
    openModal("Rename project", el("div", { class: "field" }, [
      el("label", { for: "projectNameInput", text: "Project name" }),
      input
    ]), [
      el("button", { class: "btn", text: "Cancel", onclick: closeModal }),
      el("button", { class: "btn btn-signal", text: "Rename", onclick: save })
    ]);
    setTimeout(() => { input.focus(); input.select(); }, 0);
  }

  function seedPluginDefaults() {
    let changed = false;
    for (const plugin of window.Vecode.Plugins.PLUGINS) {
      if (Object.prototype.hasOwnProperty.call(S().settings.plugins, plugin.id)) continue;
      S().settings.plugins[plugin.id] = { enabled: !!plugin.default, options: {} };
      changed = true;
    }
    if (changed) S().saveSettings();
  }

  function renderTopbar() {
    const cfg = window.Vecode.Providers.activeConfig();
    const meta = window.Vecode.Providers.getProviderMeta(cfg.id);
    $("#modelPill").innerHTML = "";
    $("#modelPill").appendChild(el("span", { class: "conn-dot", style: "background:var(--signal-action)" }));
    $("#modelPill").appendChild(document.createTextNode(meta.name + " · " + (cfg.model || "pick a model")));
    $("#projectName").textContent = S().state.name;
  }

  /* ================= init ================= */
  function init() {
    S().load();
    // file:// or private-mode may have opaque localStorage — banner + memory fallback already active in state.js
    if (!S().storageOk || !S().storageOk()) {
      setTimeout(() => toast("This browser is blocking localStorage (file:// or private mode). Your work will stay for this session but won't persist after close — host on Netlify or use http:// to enable saving.", "err"), 600);
    }
    seedPluginDefaults();
    wireAgent();
    applyTheme(S().settings.theme);

    // topbar
    $("#themeToggle").addEventListener("click", () => {
      const cur = S().settings.theme;
      applyTheme(cur === "dark" ? "light" : cur === "light" ? "system" : "dark");
      renderTopbar();
    });
    $("#modelPill").addEventListener("click", renderSettingsModal);
    $("#settingsBtn").addEventListener("click", renderSettingsModal);
    $("#projectName").addEventListener("click", renameProjectModal);
    $("#deployBtn").addEventListener("click", () => switchView("deploy"));

    // rail
    $$(".rail-item").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));

    // composer
    const input = $("#chatInput");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        send(input.value);
        input.value = "";
        input.style.height = "auto";
      }
    });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 160) + "px";
    });
    $("#sendBtn").addEventListener("click", () => { send(input.value); input.value = ""; input.style.height = "auto"; });
    $("#stopBtn").addEventListener("click", () => window.Vecode.Agent.stop());
    $("#clearChatBtn").addEventListener("click", () => {
      if (!S().state.messages.length) return;
      if (!confirm("Clear the chat history? Your project files will be kept.")) return;
      S().clearMessages();
      chat.render();
      setConn("idle", "chat cleared · files kept");
      toast("Chat cleared — project files kept", "ok");
    });

    // preview toolbar
    renderPreviewToolbar();
    $("#refreshPreview").addEventListener("click", () => preview.render());
    $("#openPreview").addEventListener("click", () => {
      const html = preview.inlineAssets(S().readFile(preview.page) || "");
      const blob = new Blob([html], { type: "text/html" });
      window.open(URL.createObjectURL(blob), "_blank");
    });
    $("#errBadge").addEventListener("click", () => preview.showErrors());

    // state events
    S().on((type) => {
      if (type === "files") { preview.refreshSoon(); renderTopbar(); }
      if (type === "messages") { renderTopbar(); }
      if (type === "settings") renderTopbar();
      if (type === "meta") renderTopbar();
    });

    // restore preview
    preview.render();
    renderTopbar();
    renderPromptChips();
    setConn(S().state.messages.length ? "ok" : "idle", S().state.messages.length ? "ready" : "describe a site to begin");
    chat.render();

    maybeOnboard();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.Vecode = window.Vecode || {};
  window.Vecode.App = { init, send, switchView, renderTopbar, toast };
})();
