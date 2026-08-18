/* ==========================================================================
   Vecode — agent.js · the agent harness
   --------------------------------------------------------------------------
   A real agent loop, entirely in the browser:
     · streaming LLM turns (any provider in providers.js)
     · tool calling: write_file / read_file / list_files / delete_file / finish
     · a fenced-block file protocol (```veccode:path) as universal fallback
     · a design-review pass (anti-slop checklist) after every build
     · cancellation, token accounting, activity events for the UI
   ========================================================================== */
(function () {
  "use strict";

  const MAX_TOOL_ITERATIONS = 14;

  const TOOL_DEFS = [
    {
      type: "function",
      function: {
        name: "write_file",
        description: "Create or overwrite a file in the project. path is relative, e.g. 'index.html', 'styles.css', 'script.js', 'pages/about.html'. Content is the full file text.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Relative file path" },
            content: { type: "string", description: "Full file content" }
          },
          required: ["path", "content"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "read_file",
        description: "Read a file from the project to see its current content.",
        parameters: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "list_files",
        description: "List all files in the project with their sizes.",
        parameters: { type: "object", properties: {} }
      }
    },
    {
      type: "function",
      function: {
        name: "delete_file",
        description: "Delete a file from the project.",
        parameters: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "finish",
        description: "Call when the site is complete. Provide a short message to the user describing what was built and what to try next.",
        parameters: {
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"]
        }
      }
    }
  ];

  /* ---------------- system prompt ---------------- */
  function buildSystemPrompt() {
    const S = window.Vecode.State;
    const files = S.listFiles().map((p) => `  · ${p} (${S.fileSize(p)} bytes)`).join("\n");
    const indexHtml = S.readFile("index.html") || "";
    const indexSnippet = indexHtml.length > 6000 ? indexHtml.slice(0, 6000) + "\n… (truncated)" : indexHtml;

    // enabled plugins
    const enabledIds = window.Vecode.Plugins.PLUGINS.filter((p) => S.isPluginEnabled(p.id)).map((p) => p.id);
    const pluginOptions = {};
    for (const id of enabledIds) pluginOptions[id] = S.getPlugin(id).options || {};
    const pluginCtx = window.Vecode.Plugins.collect(enabledIds, pluginOptions);

    // user-added skills
    const skills = S.getSkills();
    const skillsCtx = skills.length
      ? "\nUSER-ADDED SKILLS (follow these as hard requirements):\n" + skills.map((s) => `### ${s.name}\n${s.body}`).join("\n\n")
      : "";

    return `You are the Vecode builder agent — a senior front-end engineer and art director who builds complete, polished static websites in a browser-based builder.

PROJECT — "${S.state.name}"
Files currently in the project:
${files}

Current index.html (truncated to first 6000 chars — use read_file for the rest):
\`\`\`html
${indexSnippet}
\`\`\`

HOW TO WORK
1. Build complete sites: index.html + styles.css (+ script.js when behavior is needed, + pages/*.html for multi-page). Everything must actually work — no placeholder copy, no lorem ipsum, no dead links, no features the code does not implement.
2. Vanilla HTML/CSS/JS and Google Fonts only. No CDN frameworks (Bootstrap, Tailwind, jQuery) unless the user explicitly asks.
3. Responsive from 360px up. Semantic, accessible HTML. Dark mode when it fits the design.
4. Use the write_file tool to save files, read_file/list_files to inspect, delete_file to remove. After the final write, call finish() with a short message to the user.
5. If tools are somehow unavailable, you may instead output files as fenced code blocks tagged with the file path, e.g.:
   \`\`\`veccode:index.html
   <!DOCTYPE html>…
   \`\`\`
   Use a four-backtick fence ( \`\`\`\`veccode:index.html ) if the file contains three backticks.
6. Reply conversationally between tool calls. Keep the user informed in plain, warm language — no hype, no exclamation marks.

DESIGN SKILL — follow it for every build:
${window.Vecode.Skill.SKILL_MD}${pluginCtx.prompt}${skillsCtx}

FINAL CHECK — before calling finish(), self-review the build against the anti-slop table above${pluginCtx.review.length ? " plus these plugin checks:\n" + pluginCtx.review.map((r) => " · " + r).join("\n") : ""}. Fix anything that fails.`;
  }

  function buildReviewSystemPrompt() {
    const S = window.Vecode.State;
    const enabledIds = window.Vecode.Plugins.PLUGINS.filter((p) => S.isPluginEnabled(p.id)).map((p) => p.id);
    const pluginOptions = {};
    for (const id of enabledIds) pluginOptions[id] = S.getPlugin(id).options || {};
    const pluginCtx = window.Vecode.Plugins.collect(enabledIds, pluginOptions);
    const skills = S.getSkills();
    const skillsCtx = skills.length ? "\nUser-added skills also apply:\n" + skills.map((s) => `### ${s.name}\n${s.body}`).join("\n\n") : "";

    return `You are Vecode's design reviewer. You audit the site the builder agent just produced and fix what does not pass the bar. You work with the same tools: read_file, write_file, list_files, delete_file, finish.

Be ruthless but surgical. Run this checklist:
${window.Vecode.Skill.SKILL_MD}${pluginCtx.review.length ? "\nPlugin-specific checks:\n" + pluginCtx.review.map((r) => " · " + r).join("\n") : ""}${skillsCtx}

Rules:
· Only rewrite files that actually need changes. Do not rewrite everything "just to be safe".
· Verify code matches comments; delete comments claiming features that do not exist.
· If the site is already good, call finish() with a one-line verdict and change nothing.
· After applying fixes, call finish() with a short summary of what you changed and why.`;
  }

  /* ---------------- file block parsing (fallback protocol) ---------------- */
  const FENCE_RE = /(`{3,})\s*veccode:([^\n`]+)\n([\s\S]*?)\1/g;

  function parseFileBlocks(text) {
    const files = {};
    FENCE_RE.lastIndex = 0;
    let m;
    while ((m = FENCE_RE.exec(text))) {
      const path = m[2].trim();
      if (path && !path.includes("..") && !path.startsWith("/")) files[path] = m[3];
    }
    return files;
  }

  function stripFileBlocks(text) {
    FENCE_RE.lastIndex = 0;
    return text.replace(FENCE_RE, "").replace(/\n{3,}/g, "\n\n").trim();
  }

  /* ---------------- tool execution ---------------- */
  function safePath(path) {
    if (typeof path !== "string") return null;
    const p = path.trim();
    if (!p || p.startsWith("/") || p.includes("..") || p.includes("\\")) return null;
    return p;
  }

  async function executeTool(name, args) {
    const S = window.Vecode.State;
    try {
      switch (name) {
        case "write_file": {
          const path = safePath(args.path);
          if (!path) return "Error: invalid path. Use a relative path like 'index.html' or 'pages/about.html'.";
          const content = typeof args.content === "string" ? args.content : JSON.stringify(args.content);
          S.writeFile(path, content);
          return `Wrote ${content.length} bytes to ${path}.`;
        }
        case "read_file": {
          const path = safePath(args.path);
          if (!path) return "Error: invalid path.";
          const content = S.readFile(path);
          if (content === null) return `Error: file not found: ${path}`;
          if (content.length > 24000) return content.slice(0, 24000) + `\n… (truncated, ${content.length} bytes total)`;
          return content;
        }
        case "list_files": {
          const list = S.listFiles().map((p) => ({ path: p, bytes: S.fileSize(p) }));
          return JSON.stringify(list, null, 2);
        }
        case "delete_file": {
          const path = safePath(args.path);
          if (!path) return "Error: invalid path.";
          return S.deleteFile(path) ? `Deleted ${path}.` : `Error: file not found: ${path}`;
        }
        case "finish":
          return "OK — the build is complete.";
        default:
          return `Error: unknown tool ${name}`;
      }
    } catch (e) {
      return "Error: " + (e && e.message ? e.message : String(e));
    }
  }

  /* ---------------- the harness ---------------- */
  const harness = {
    running: false,
    _abort: null,
    usage: { input: 0, output: 0 },
    events: {},

    on(ev, fn) { this.events[ev] = fn; },
    emit(ev, payload) { const fn = this.events[ev]; if (fn) { try { fn(payload); } catch (e) { console.error(e); } } },

    stop() {
      if (this._abort) { this._abort.abort(); }
      this.running = false;
      this.emit("stopped");
    },

    _freshAbort() {
      this._abort = new AbortController();
      return this._abort.signal;
    },

    _trackUsage(u) {
      if (!u) return;
      if (u.input_tokens) this.usage.input += u.input_tokens;
      if (u.output_tokens) this.usage.output += u.output_tokens;
      if (u.prompt_tokens) this.usage.input += u.prompt_tokens;
      if (u.completion_tokens) this.usage.output += u.completion_tokens;
      this.emit("usage", this.usage);
    },

    /**
     * Run one full agent turn (tool loop + optional file-block protocol).
     * userText — the user's message; mode: "build" | "review"
     */
    async run(userText, mode) {
      if (this.running) throw new Error("The agent is already running.");
      this.running = true;
      const S = window.Vecode.State;
      const cfg = window.Vecode.Providers.activeConfig();
      const useTools = cfg.tools !== false;
      const signal = this._freshAbort();

      try {
        const system = mode === "review" ? buildReviewSystemPrompt() : buildSystemPrompt();
        let messages;
        if (mode === "review") {
          messages = [{ role: "user", content: "Audit the current project and apply fixes now. Files: " + S.listFiles().map((p) => p + " (" + S.fileSize(p) + " bytes)").join(", ") }];
        } else {
          // carry recent conversation history (the files are the real state, but
          // the last few exchanges keep follow-ups like "make it darker" coherent)
          const history = S.state.messages.slice(0, -1).slice(-8)
            .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content || "" }));
          messages = history.concat([{ role: "user", content: userText }]);
        }
        messages.unshift({ role: "system", content: system });

        this.emit("status", { mode: mode === "review" ? "review" : "build", label: mode === "review" ? "Reviewing the design…" : "Building…" });
        let finalText = "";
        let finishMessage = null;

        for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
          if (signal.aborted) break;
          this.emit("iteration", iter + 1);

          const result = await window.Vecode.Providers.stream(
            { cfg, messages, tools: useTools ? TOOL_DEFS : [], temperature: S.settings.temperature },
            {
              onText: (t) => { finalText += t; this.emit("delta", { mode, text: t }); },
              onToolStart: (tc) => this.emit("toolStart", tc),
              onToolDelta: (tc) => this.emit("toolDelta", tc)
            },
            signal
          );
          this._trackUsage(result.usage);

          // fallback protocol: apply any veccode: blocks in the text
          const blocks = parseFileBlocks(result.text);
          const blockPaths = Object.keys(blocks);
          if (blockPaths.length) {
            for (const p of blockPaths) S.writeFile(p, blocks[p]);
            this.emit("filesWritten", blockPaths.map((p) => ({ path: p, bytes: blocks[p].length, via: "block" })));
            result.text = stripFileBlocks(result.text); // keep only the prose
          }

          if (result.toolCalls && result.toolCalls.length) {
            const assistantMsg = {
              role: "assistant",
              content: result.text || "",
              tool_calls: result.toolCalls.map((tc) => ({ id: tc.id, name: tc.name, args: tc.args }))
            };
            messages.push(assistantMsg);

            const writtenByTools = [];
            for (const tc of result.toolCalls) {
              if (signal.aborted) break;
              this.emit("toolStart", { id: tc.id, name: tc.name, args: tc.args });
              let out;
              if (tc.args && tc.args._raw !== undefined) {
                out = "Error: could not parse the tool arguments as JSON. Retry with valid JSON.";
              } else {
                out = await executeTool(tc.name, tc.args || {});
              }
              this.emit("toolResult", { name: tc.name, out });
              if (tc.name === "write_file" && typeof tc.args.path === "string") {
                writtenByTools.push({ path: tc.args.path, bytes: String(tc.args.content || "").length, via: "tool" });
              }
              if (tc.name === "finish") finishMessage = (tc.args && tc.args.message) || result.text || "";
              messages.push({ role: "tool", tool_call_id: tc.id, name: tc.name, content: out });
            }
            if (writtenByTools.length) this.emit("filesWritten", writtenByTools);
            if (finishMessage !== null || signal.aborted) break;
            continue; // keep looping
          }

          // no tool calls — plain text response
          if (result.text.trim()) finishMessage = null;
          finalText = result.text || finalText;
          break;
        }

        if (finishMessage !== null && finishMessage !== undefined) {
          finalText = finishMessage;
        } else if (signal.aborted && !finalText.trim()) {
          finalText = "Build stopped.";
        }
        finalText = finalText.trim();

        // persist the assistant message
        if (finalText) {
          S.addMessage({ role: "assistant", content: finalText, ts: Date.now(), mode });
        }

        // apply plugin injections to whatever the agent produced
        this.applyPluginInjections();

        this.emit("done", { mode, text: finalText, finishMessage });
        return { text: finalText };
      } catch (e) {
        if (e.name === "AbortError" || signal.aborted) {
          this.emit("done", { mode, text: "", aborted: true });
          return { aborted: true };
        }
        this.emit("error", e);
        throw e;
      } finally {
        this.running = false;
        this.emit("idle");
      }
    },

    applyPluginInjections() {
      const S = window.Vecode.State;
      const enabledIds = window.Vecode.Plugins.PLUGINS.filter((p) => S.isPluginEnabled(p.id)).map((p) => p.id);
      const options = {};
      for (const id of enabledIds) options[id] = S.getPlugin(id).options || {};
      const next = window.Vecode.Plugins.applyInjections(S.state.files, enabledIds, options);
      const changed = [];
      for (const p of Object.keys(next)) {
        if (next[p] !== S.state.files[p]) changed.push(p);
      }
      if (changed.length) {
        S.state.files = next;
        S.saveSoon();
        this.emit("filesWritten", changed.map((p) => ({ path: p, via: "plugin" })));
      }
    },

    /** Run the design-review pass after a build. */
    async reviewPass() {
      if (this.running) return;
      return this.run("", "review");
    }
  };

  window.Vecode = window.Vecode || {};
  window.Vecode.Agent = harness;
  window.Vecode.Agent.buildSystemPrompt = buildSystemPrompt;
  window.Vecode.Agent.parseFileBlocks = parseFileBlocks;
})();
