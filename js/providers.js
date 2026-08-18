/* ==========================================================================
   Vecode — providers.js · BYOK model providers + free tier
   --------------------------------------------------------------------------
   Free tier   : poolside models via the osaii OpenAI-compatible gateway
                 (https://osaii.wyvernhub.net/api/v1) — no API key required.
                 ONLY poolside/* models are offered here.
   BYOK        : OpenAI · Anthropic · Google Gemini · OpenRouter · xAI ·
                 Codex (ChatGPT OAuth device flow or pasted access token) ·
                 any custom OpenAI-compatible endpoint (OpenCode-style).
   ========================================================================== */
(function () {
  "use strict";

  const FREE_BASE = "https://osaii.wyvernhub.net/api/v1";
  const FREE_MODELS_FALLBACK = ["poolside/laguna-s-2.1", "poolside/laguna-xs-2.1"];
  const CODEX_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
  const CODEX_ISSUER = "https://auth.openai.com";
  const CODEX_API_BASE = "https://chatgpt.com/backend-api/codex";

  /* ---------------- registry ---------------- */
  const REGISTRY = [
    {
      id: "free", name: "Poolside — free tier", logo: "▲",
      badge: "free", badgeClass: "free-badge", needsKey: false,
      desc: "OpenAI-compatible gateway with no API key. Poolside Laguna models only — free, 262k context, tool use supported.",
      baseUrl: FREE_BASE, kind: "openai", tools: true,
      models: FREE_MODELS_FALLBACK, defaultModel: "poolside/laguna-s-2.1",
      keyLabel: null, keyHint: null, link: "https://osaii.wyvernhub.net/api/v1/models"
    },
    {
      id: "openai", name: "OpenAI", logo: "OA", badge: "BYOK", badgeClass: "oauth-badge",
      needsKey: true, desc: "Paste an API key from platform.openai.com — or connect ChatGPT via the Codex card below.",
      baseUrl: "https://api.openai.com/v1", kind: "openai", tools: true,
      models: ["gpt-5", "gpt-5-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4o", "o3"],
      defaultModel: "gpt-5-mini",
      keyLabel: "OpenAI API key", keyHint: "sk-…  ·  platform.openai.com/api-keys",
      link: "https://platform.openai.com/api-keys"
    },
    {
      id: "anthropic", name: "Anthropic", logo: "AN", badge: "BYOK", badgeClass: "oauth-badge",
      needsKey: true, desc: "Claude models. Paste a key from console.anthropic.com.",
      baseUrl: "https://api.anthropic.com/v1", kind: "anthropic", tools: true,
      models: ["claude-sonnet-4-5", "claude-opus-4-1", "claude-3-7-sonnet", "claude-3-5-haiku"],
      defaultModel: "claude-sonnet-4-5",
      keyLabel: "Anthropic API key", keyHint: "sk-ant-…  ·  console.anthropic.com/settings/keys",
      link: "https://console.anthropic.com/settings/keys"
    },
    {
      id: "gemini", name: "Google Gemini", logo: "GE", badge: "BYOK", badgeClass: "oauth-badge",
      needsKey: true, desc: "Gemini via Google's OpenAI-compatible endpoint. Key from aistudio.google.com.",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", kind: "openai", tools: true,
      models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
      defaultModel: "gemini-2.5-flash",
      keyLabel: "Gemini API key", keyHint: "AIza…  ·  aistudio.google.com/apikey",
      link: "https://aistudio.google.com/apikey"
    },
    {
      id: "openrouter", name: "OpenRouter", logo: "OR", badge: "BYOK", badgeClass: "oauth-badge",
      needsKey: true, desc: "One key for hundreds of models. Paste a key from openrouter.ai.",
      baseUrl: "https://openrouter.ai/api/v1", kind: "openai", tools: true,
      models: ["deepseek/deepseek-chat-v3-0324", "anthropic/claude-sonnet-4.5", "openai/gpt-4o", "meta-llama/llama-3.3-70b-instruct", "mistralai/mistral-small-3.1"],
      defaultModel: "deepseek/deepseek-chat-v3-0324",
      keyLabel: "OpenRouter API key", keyHint: "sk-or-…  ·  openrouter.ai/settings/keys",
      link: "https://openrouter.ai/settings/keys"
    },
    {
      id: "xai", name: "xAI Grok", logo: "xAI", badge: "BYOK", badgeClass: "oauth-badge",
      needsKey: true, desc: "Grok models for fast, capable builds. Key from console.x.ai.",
      baseUrl: "https://api.x.ai/v1", kind: "openai", tools: true,
      models: ["grok-code-fast-1", "grok-4", "grok-3"],
      defaultModel: "grok-code-fast-1",
      keyLabel: "xAI API key", keyHint: "xai-…  ·  console.x.ai",
      link: "https://console.x.ai"
    },
    {
      id: "codex", name: "Codex — ChatGPT", logo: "CX", badge: "OAuth", badgeClass: "oauth-badge",
      needsKey: false, desc: "Sign in with your ChatGPT account (device-code OAuth, same flow as codex login) — or paste an access token from the Codex CLI. Uses your ChatGPT plan, not API billing.",
      baseUrl: CODEX_API_BASE, kind: "responses", tools: false,
      models: ["gpt-5.1-codex", "gpt-5.5-codex-fast", "gpt-5-codex"],
      defaultModel: "gpt-5.1-codex",
      keyLabel: "Codex access token", keyHint: "from `codex login` → ~/.codex/auth.json, or via OAuth below",
      link: null, oauth: true
    },
    {
      id: "custom", name: "Custom endpoint", logo: "{}", badge: "OpenCode-style", badgeClass: "oauth-badge",
      needsKey: false, desc: "Any OpenAI-compatible API — the same bring-your-own-key pattern OpenCode uses. Paste a base URL and (optionally) a key.",
      baseUrl: "https://", kind: "openai", tools: true,
      models: [], defaultModel: "",
      keyLabel: "API key (optional)", keyHint: "leave empty for keyless endpoints",
      link: null
    }
  ];

  function getProviderMeta(id) {
    return REGISTRY.find((p) => p.id === id) || REGISTRY[0];
  }

  function resolveProvider(id) {
    const meta = getProviderMeta(id);
    const saved = window.Vecode.State.getProvider(id);
    const cfg = {
      id: meta.id,
      kind: meta.kind,
      tools: meta.tools,
      needsKey: !!meta.needsKey,
      baseUrl: (saved.baseUrl || meta.baseUrl).replace(/\/+$/, ""),
      key: saved.key || "",
      model: saved.model || meta.defaultModel || "",
      token: saved.token || null, // codex OAuth tokens
      refreshToken: saved.refreshToken || null,
      expiresAt: saved.expiresAt || 0,
      extraHeaders: saved.extraHeaders || {}
    };
    return cfg;
  }

  function activeConfig() {
    return resolveProvider(window.Vecode.State.settings.provider);
  }

  /* ---------------- free-tier model discovery ---------------- */
  async function fetchFreeModels() {
    try {
      const res = await fetch(FREE_BASE + "/models");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const list = (data.data || [])
        .filter((m) => String(m.id).startsWith("poolside/"))
        .map((m) => m.id);
      return list.length ? list : FREE_MODELS_FALLBACK;
    } catch (e) {
      return FREE_MODELS_FALLBACK;
    }
  }

  /* ---------------- SSE parsing ---------------- */
  async function readSSE(res, onEvent) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).replace(/\r$/, "");
        buf = buf.slice(idx + 1);
        if (line.startsWith("data:")) {
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") return;
          try { onEvent(JSON.parse(payload)); } catch (e) { /* ignore malformed */ }
        }
      }
    }
  }

  function extractApiError(body, fallback) {
    try {
      const j = JSON.parse(body);
      return (j.error && (j.error.message || j.error)) || j.message || fallback;
    } catch (e) { return fallback; }
  }

  /* ================================================================
     Unified streaming call.
     req = { messages:[{role,content}], tools?, temperature?, model?, baseUrl?, key?, kind? }
     handlers = { onText(t), onToolStart({index,id,name}), onToolDelta({index,args}), onStatus(s) }
     Returns Promise<{ text, toolCalls:[{id,name,args}], usage, stopReason }>
     ================================================================ */
  async function stream(req, handlers, signal) {
    const cfg = req.cfg || activeConfig();
    const kind = req.kind || cfg.kind;
    if (kind === "anthropic") return streamAnthropic(req, cfg, handlers, signal);
    if (kind === "responses") return streamCodexResponses(req, cfg, handlers, signal);
    return streamOpenAICompat(req, cfg, handlers, signal);
  }

  /* ---------------- OpenAI-compatible (free, openai, gemini, openrouter, xai, custom) ---------------- */
  async function streamOpenAICompat(req, cfg, handlers, signal) {
    const url = (req.baseUrl || cfg.baseUrl) + "/chat/completions";
    const body = {
      model: req.model || cfg.model,
      messages: req.messages,
      temperature: typeof req.temperature === "number" ? req.temperature : undefined,
      stream: true,
      stream_options: { include_usage: true }
    };
    if (req.tools && req.tools.length) { body.tools = req.tools; body.tool_choice = "auto"; }
    // o-series / gpt-5 style reasoning models reject temperature
    const m = String(body.model);
    if (/^(o1|o3|gpt-5)/i.test(m)) { delete body.temperature; }

    const headers = { "Content-Type": "application/json" };
    if (cfg.key) headers["Authorization"] = "Bearer " + cfg.key;
    if (cfg.id === "openrouter") {
      const origin = (typeof location !== "undefined" && location.protocol.startsWith("http")) ? location.origin : "https://vecode.app";
      headers["HTTP-Referer"] = origin;
    }

    let res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // some strict OpenAI-compatible gateways reject stream_options — retry without it
      if (body.stream_options && (res.status === 400 || res.status === 404) && /stream_options|include_usage/i.test(text)) {
        delete body.stream_options;
        res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
        if (res.ok) return readOpenAIStream(res, handlers);
      }
      throw new Error(extractApiError(text, "Request failed (" + res.status + ")" + (text ? " — " + text.slice(0, 220) : "")));
    }

    return readOpenAIStream(res, handlers);
  }

  async function readOpenAIStream(res, handlers) {
    const out = { text: "", toolCalls: [], usage: null, stopReason: null };
    const toolMap = new Map();
    await readSSE(res, (ev) => {
      if (!ev.choices || !ev.choices.length) {
        if (ev.usage) out.usage = ev.usage;
        return;
      }
      const choice = ev.choices[0];
      if (choice.finish_reason) out.stopReason = choice.finish_reason;
      const delta = choice.delta || {};
      if (delta.content) { out.text += delta.content; handlers.onText && handlers.onText(delta.content); }
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (tc.index === undefined) continue;
          if (!toolMap.has(tc.index)) {
            const entry = { index: tc.index, id: tc.id || "", name: tc.function && tc.function.name || "", args: "" };
            toolMap.set(tc.index, entry);
            handlers.onToolStart && handlers.onToolStart({ index: entry.index, id: entry.id, name: entry.name });
          }
          const entry = toolMap.get(tc.index);
          if (tc.id) entry.id = tc.id;
          if (tc.function) {
            if (tc.function.name) entry.name = tc.function.name;
            if (tc.function.arguments) { entry.args += tc.function.arguments; handlers.onToolDelta && handlers.onToolDelta({ index: entry.index, args: entry.args }); }
          }
        }
      }
      if (ev.usage && out.usage === null) out.usage = ev.usage;
    });
    for (const entry of toolMap.values()) {
      let args = {};
      try { args = entry.args ? JSON.parse(entry.args) : {}; } catch (e) { args = { _raw: entry.args }; }
      out.toolCalls.push({ id: entry.id || ("call_" + Math.random().toString(36).slice(2, 10)), name: entry.name, args });
    }
    return out;
  }

  /* ---------------- Anthropic Messages API ---------------- */
  async function streamAnthropic(req, cfg, handlers, signal) {
    const url = (req.baseUrl || cfg.baseUrl) + "/messages";
    const system = req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const msgs = [];
    for (const m of req.messages) {
      if (m.role === "system") continue;
      if (m.role === "tool") {
        msgs.push({ role: "user", content: [{ type: "tool_result", tool_use_id: m.tool_call_id, content: String(m.content) }] });
      } else if (m.role === "assistant" && m.tool_calls && m.tool_calls.length) {
        const blocks = [];
        if (m.content) blocks.push({ type: "text", text: m.content });
        for (const tc of m.tool_calls) {
          blocks.push({ type: "tool_use", id: tc.id, name: tc.name, input: tc.args || {} });
        }
        msgs.push({ role: "assistant", content: blocks });
      } else {
        const last = msgs[msgs.length - 1];
        const text = m.content || "";
        if (last && last.role === m.role && typeof last.content === "string") {
          last.content += "\n\n" + text; // merge consecutive same-role text messages
        } else {
          msgs.push({ role: m.role === "assistant" ? "assistant" : "user", content: text });
        }
      }
    }
    const body = {
      model: req.model || cfg.model,
      max_tokens: 8192,
      stream: true,
      messages: msgs.length ? msgs : [{ role: "user", content: "…" }]
    };
    if (system) body.system = system;
    if (typeof req.temperature === "number") body.temperature = req.temperature;
    if (req.tools && req.tools.length) {
      body.tools = req.tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters
      }));
    }

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": cfg.key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    };
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(extractApiError(text, "Request failed (" + res.status + ")"));
    }

    const out = { text: "", toolCalls: [], usage: null, stopReason: null };
    const toolMap = new Map();
    let currentBlock = null;
    await readSSE(res, (ev) => {
      if (ev.type === "content_block_start") {
        currentBlock = ev.index;
        if (ev.content_block.type === "tool_use") {
          toolMap.set(ev.index, { index: ev.index, id: ev.content_block.id, name: ev.content_block.name, args: "" });
          handlers.onToolStart && handlers.onToolStart({ index: ev.index, id: ev.content_block.id, name: ev.content_block.name });
        }
      } else if (ev.type === "content_block_delta") {
        if (ev.delta.type === "text_delta") { out.text += ev.delta.text; handlers.onText && handlers.onText(ev.delta.text); }
        if (ev.delta.type === "input_json_delta") {
          const entry = toolMap.get(ev.index);
          if (entry) { entry.args += ev.delta.partial_json; handlers.onToolDelta && handlers.onToolDelta({ index: ev.index, args: entry.args }); }
        }
      } else if (ev.type === "message_delta") {
        if (ev.delta.stop_reason) out.stopReason = ev.delta.stop_reason;
      } else if (ev.type === "message_start") {
        if (ev.message && ev.message.usage) out.usage = ev.message.usage;
      } else if (ev.type === "error") {
        throw new Error((ev.error && (ev.error.message || ev.error.type)) || "Anthropic stream error");
      }
    });
    for (const entry of toolMap.values()) {
      let args = {};
      try { args = entry.args ? JSON.parse(entry.args) : {}; } catch (e) { args = { _raw: entry.args }; }
      out.toolCalls.push({ id: entry.id, name: entry.name, args });
    }
    return out;
  }

  /* ---------------- Codex (Responses API) — OAuth or pasted token ---------------- */
  async function ensureCodexToken(cfg) {
    if (!cfg.key && !cfg.token) throw new Error("Codex is not connected. Sign in with ChatGPT or paste an access token.");
    let token = cfg.token || cfg.key;
    if (cfg.expiresAt && Date.now() > cfg.expiresAt - 60000 && cfg.refreshToken) {
      token = await refreshCodexToken(cfg);
    }
    return token;
  }

  async function refreshCodexToken(cfg) {
    const res = await fetch(CODEX_ISSUER + "/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: cfg.refreshToken,
        client_id: CODEX_CLIENT_ID
      })
    });
    if (!res.ok) throw new Error("Codex token refresh failed (" + res.status + "). Reconnect via OAuth.");
    const data = await res.json();
    const saved = Object.assign({}, window.Vecode.State.getProvider("codex"), {
      token: data.access_token,
      refreshToken: data.refresh_token || cfg.refreshToken,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000
    });
    window.Vecode.State.setProvider("codex", saved);
    return data.access_token;
  }

  async function streamCodexResponses(req, cfg, handlers, signal) {
    const token = await ensureCodexToken(cfg);
    const base = (req.baseUrl || cfg.baseUrl).replace(/\/+$/, "");
    const url = base + "/responses";

    const input = [];
    for (const m of req.messages) {
      if (m.role === "system") input.push({ role: "system", content: [{ type: "input_text", text: m.content }] });
      else if (m.role === "tool") input.push({ type: "function_call_output", call_id: m.tool_call_id, output: String(m.content) });
      else if (m.role === "assistant" && m.tool_calls && m.tool_calls.length) {
        input.push({ role: "assistant", content: [{ type: "output_text", text: m.content || "" }] });
        for (const tc of m.tool_calls) {
          input.push({ type: "function_call", call_id: tc.id, name: tc.name, arguments: JSON.stringify(tc.args || {}) });
        }
      } else {
        input.push({ role: m.role === "assistant" ? "assistant" : "user", content: [{ type: "input_text", text: m.content }] });
      }
    }

    const body = {
      model: req.model || cfg.model,
      input,
      stream: true
    };
    if (typeof req.temperature === "number") body.temperature = req.temperature;

    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
      "OpenAI-Beta": "responses"
    };

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
    if (res.status === 401 && cfg.refreshToken) {
      const fresh = await refreshCodexToken(cfg);
      headers["Authorization"] = "Bearer " + fresh;
      const retry = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
      if (!retry.ok) {
        const t = await retry.text().catch(() => "");
        throw new Error(extractApiError(t, "Codex request failed (" + retry.status + ")"));
      }
      return parseResponsesStream(retry, handlers);
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(extractApiError(text, "Codex request failed (" + res.status + ")" + (text ? " — " + text.slice(0, 220) : "")));
    }
    return parseResponsesStream(res, handlers);
  }

  async function parseResponsesStream(res, handlers) {
    const out = { text: "", toolCalls: [], usage: null, stopReason: null };
    const toolMap = new Map();
    await readSSE(res, (ev) => {
      if (ev.type === "response.output_text.delta") {
        out.text += ev.delta;
        handlers.onText && handlers.onText(ev.delta);
      } else if (ev.type === "response.function_call_arguments.delta") {
        const key = ev.item_id;
        if (!toolMap.has(key)) {
          toolMap.set(key, { index: toolMap.size, id: ev.item_id, name: "", args: "" });
          handlers.onToolStart && handlers.onToolStart({ index: toolMap.get(key).index, id: ev.item_id, name: "" });
        }
        const entry = toolMap.get(key);
        entry.args += ev.delta;
        handlers.onToolDelta && handlers.onToolDelta({ index: entry.index, args: entry.args });
      } else if (ev.type === "response.function_call_arguments.done") {
        const entry = toolMap.get(ev.item_id);
        if (entry) entry.name = ev.name || entry.name;
      } else if (ev.type === "response.completed") {
        if (ev.response && ev.response.usage) {
          out.usage = { input_tokens: ev.response.usage.input_tokens, output_tokens: ev.response.usage.output_tokens };
        }
        if (ev.response && ev.response.status === "incomplete") {
          out.stopReason = "max_tokens";
        }
      } else if (ev.type === "error") {
        throw new Error((ev.error && (ev.error.message || ev.error.code)) || "Codex stream error");
      }
    });
    for (const entry of toolMap.values()) {
      let args = {};
      try { args = entry.args ? JSON.parse(entry.args) : {}; } catch (e) { args = { _raw: entry.args }; }
      out.toolCalls.push({ id: entry.id, name: entry.name, args });
    }
    return out;
  }

  /* ---------------- Codex OAuth device flow ---------------- */
  async function codexStartDeviceFlow() {
    const res = await fetch(CODEX_ISSUER + "/api/accounts/deviceauth/usercode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: CODEX_CLIENT_ID })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(extractApiError(text, "Could not start Codex sign-in (" + res.status + ")."));
    }
    const data = await res.json();
    return {
      deviceAuthId: data.device_auth_id,
      userCode: data.user_code,
      interval: Math.max(Number(data.interval) || 5, 3),
      verificationUrl: CODEX_ISSUER + "/codex/device",
      expiresAt: Date.now() + 15 * 60 * 1000
    };
  }

  /** Polls until authorized. onStatus({state, message}) for UI updates. */
  async function codexPollAndExchange(flow, signal, onStatus) {
    while (Date.now() < flow.expiresAt) {
      if (signal && signal.aborted) throw new Error("Sign-in cancelled.");
      const res = await fetch(CODEX_ISSUER + "/api/accounts/deviceauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_auth_id: flow.deviceAuthId, user_code: flow.userCode })
      });
      if (res.ok) {
        const data = await res.json();
        onStatus && onStatus({ state: "exchanging", message: "Authorized — exchanging for tokens…" });
        return await codexExchange(data.authorization_code, data.code_challenge, data.code_verifier);
      }
      if (res.status === 403 || res.status === 404) {
        // still pending (or device auth disabled for the account)
        const body = await res.text().catch(() => "");
        if (/disabled|not enabled|forbidden/i.test(body + res.statusText)) {
          throw new Error("Device-code authorization appears to be disabled for your ChatGPT account. Enable it in ChatGPT → Settings → Security → “Device code authorization for Codex”, then try again.");
        }
        onStatus && onStatus({ state: "waiting", message: "Waiting for you to authorize…" });
        await sleep(flow.interval * 1000);
        continue;
      }
      throw new Error("Codex sign-in failed (" + res.status + ").");
    }
    throw new Error("Sign-in expired. Start again.");
  }

  async function codexExchange(code, codeChallenge, codeVerifier) {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: CODEX_ISSUER + "/deviceauth/callback",
      client_id: CODEX_CLIENT_ID,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      code_verifier: codeVerifier
    });
    const res = await fetch(CODEX_ISSUER + "/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(extractApiError(text, "Token exchange failed (" + res.status + ")."));
    }
    const data = await res.json();
    return {
      token: data.access_token,
      refreshToken: data.refresh_token || null,
      expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000
    };
  }

  function codexDisconnect() {
    window.Vecode.State.setProvider("codex", { token: null, refreshToken: null, expiresAt: 0, key: "" });
  }

  /* ---------------- connection test ---------------- */
  async function testConnection(providerId) {
    const cfg = resolveProvider(providerId);
    const t0 = performance.now();
    const result = await stream(
      {
        cfg,
        messages: [{ role: "user", content: "Reply with exactly: pong" }],
        temperature: 0,
        tools: []
      },
      {},
      AbortSignal.timeout(45000)
    );
    const ms = Math.round(performance.now() - t0);
    return { ok: true, ms, model: cfg.model, reply: (result.text || "(empty reply)").slice(0, 80) };
  }

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  window.Vecode = window.Vecode || {};
  window.Vecode.Providers = {
    REGISTRY, getProviderMeta, resolveProvider, activeConfig,
    fetchFreeModels, stream, testConnection,
    codexStartDeviceFlow, codexPollAndExchange, codexDisconnect,
    FREE_BASE, FREE_MODELS_FALLBACK, CODEX_CLIENT_ID
  };
})();
