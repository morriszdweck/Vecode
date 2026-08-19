/* ==========================================================================
   Vecode — agent harness integration test (Node, no dependencies)
   Runs the real browser modules against a mock OpenAI-compatible server:
     · streaming tool-call loop (write_file → finish)
     · fenced-block fallback protocol
     · design-review pass
     · ZIP writer round-trip
   Run:  node test/agent.test.js
   ========================================================================== */
"use strict";
const http = require("http");
const assert = require("assert");
const path = require("path");
const fs = require("fs");

/* ---------------- browser shims ---------------- */
const storage = {};
global.window = global;
global.localStorage = {
  getItem: (k) => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};
global.location = { protocol: "http:", origin: "http://localhost" };
global.performance = global.performance || { now: () => Date.now() };
global.alert = () => {};
global.confirm = () => true;

const ROOT = path.join(__dirname, "..");
for (const f of ["js/state.js", "js/zip.js", "js/providers.js", "js/plugins.js", "js/templates.js", "js/skill.js", "js/agent.js"]) {
  require(path.join(ROOT, f));
}
const { State, Providers, Agent, Zip, Skill, Plugins, Templates } = global.window.Vecode;

State.load();

/* ---------------- mock server ---------------- */
const HTML = "<!DOCTYPE html><html><head><title>T</title></head><body><h1>hi</h1></body></html>";
const CSS = "body { color: #007CFF; }";

function sse(payloads) {
  return payloads.map((p) => "data: " + JSON.stringify(p) + "\n\n").join("") + "data: [DONE]\n\n";
}

function toolCallDelta(index, id, name, argsChunk) {
  return {
    choices: [{ delta: { tool_calls: [{ index, id, function: { name, arguments: argsChunk } }] }, finish_reason: null }]
  };
}
function finishChoice(reason) {
  return { choices: [{ delta: {}, finish_reason: reason }] };
}

let requestLog = [];

const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const parsed = JSON.parse(body);
    requestLog.push(parsed);
    const isReview = String(parsed.messages[0].content || "").includes("design reviewer");
    const turn = parsed._turn === undefined ? parsed.messages.length : parsed.messages.length;
    res.writeHead(200, { "Content-Type": "text/event-stream" });

    if (isReview) {
      // review pass: text-only verdict + one block edit
      const reviewText = "The hero was fine but the footer lacked contrast. Fixed the footer. Looks good now.";
      res.end(sse([
        { choices: [{ delta: { content: "The hero was fine but the footer lacked " }, finish_reason: null }] },
        { choices: [{ delta: { content: "contrast. Fixed the footer. Looks good now." }, finish_reason: null }] },
        finishChoice("stop"),
        { choices: [], usage: { prompt_tokens: 900, completion_tokens: 30 } }
      ]));
      return;
    }

    if (turn <= 3) {
      // build turn 1: write two files via tools (arguments streamed in chunks)
      const args1 = JSON.stringify({ path: "index.html", content: HTML });
      const args2 = JSON.stringify({ path: "styles.css", content: CSS });
      const chunk = (s, n = 24) => s.slice(0, n);
      res.end(sse([
        { choices: [{ delta: { content: "Let me build this. " }, finish_reason: null }] },
        toolCallDelta(0, "call_1", "write_file", chunk(args1)),
        toolCallDelta(0, "call_1", "write_file", chunk(args1.slice(24), 40)),
        toolCallDelta(0, "call_1", "write_file", args1.slice(64)),
        toolCallDelta(1, "call_2", "write_file", chunk(args2, 18)),
        toolCallDelta(1, "call_2", "write_file", args2.slice(18)),
        finishChoice("tool_calls"),
        { choices: [], usage: { prompt_tokens: 100, completion_tokens: 40 } }
      ]));
      return;
    }
    // build turn 2: finish
    res.end(sse([
      toolCallDelta(0, "call_3", "finish", JSON.stringify({ message: "Built it — a landing page with a signal-blue hero." })),
      finishChoice("tool_calls"),
      { choices: [], usage: { prompt_tokens: 50, completion_tokens: 10 } }
    ]));
  });
});

/* ---------------- anthropic mock ---------------- */
function anthropicSse() {
  return [
    'event: message_start\ndata: ' + JSON.stringify({ type: "message_start", message: { usage: { input_tokens: 77, output_tokens: 3 } } }) + '\n\n',
    'event: content_block_start\ndata: ' + JSON.stringify({ type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }) + '\n\n',
    'event: content_block_delta\ndata: ' + JSON.stringify({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Hello from Claude" } }) + '\n\n',
    'event: content_block_stop\ndata: ' + JSON.stringify({ type: "content_block_stop", index: 0 }) + '\n\n',
    'event: message_delta\ndata: ' + JSON.stringify({ type: "message_delta", delta: { stop_reason: "end_turn" } }) + '\n\n',
    'event: message_stop\ndata: ' + JSON.stringify({ type: "message_stop" }) + '\n\n'
  ].join("");
}

/* ---------------- tests ---------------- */
function testZip() {
  const png = "data:image/png;base64,iVBORw0KGgo=";
  const blob = Zip.makeZip({ "index.html": HTML, "dir/styles.css": CSS, "assets/logo.png": png, "netlify.toml": "[build]\n" });
  assert.ok(blob.size > 100, "zip has content");
  return blob.arrayBuffer().then((ab) => {
    const bytes = new Uint8Array(ab);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const text = Buffer.from(bytes).toString("latin1");
    assert.ok(text.includes("index.html"), "central dir lists index.html");
    assert.ok(text.includes("dir/styles.css"), "central dir lists nested file");
    assert.ok(text.includes("assets/logo.png"), "central dir lists binary file");
    assert.ok(text.includes("<h1>hi</h1>"), "stored text content is intact");

    // Read STORE entries from their local headers and verify data-URI decoding.
    const local = {};
    let offset = 0;
    while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
      const size = view.getUint32(offset + 18, true);
      const nameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      const name = Buffer.from(bytes.slice(offset + 30, offset + 30 + nameLen)).toString("utf8");
      const start = offset + 30 + nameLen + extraLen;
      local[name] = bytes.slice(start, start + size);
      offset = start + size;
    }
    assert.deepStrictEqual(Array.from(local["assets/logo.png"]), [137, 80, 78, 71, 13, 10, 26, 10], "data URI decoded to raw PNG bytes");

    // Every central-directory offset must point at its own local header.
    const eocd = bytes.length - 22;
    assert.strictEqual(view.getUint32(eocd, true), 0x06054b50, "EOCD signature present");
    const count = view.getUint16(eocd + 10, true);
    let central = view.getUint32(eocd + 16, true);
    for (let i = 0; i < count; i++) {
      assert.strictEqual(view.getUint32(central, true), 0x02014b50, "central record signature");
      const nameLen = view.getUint16(central + 28, true);
      const extraLen = view.getUint16(central + 30, true);
      const commentLen = view.getUint16(central + 32, true);
      const localOffset = view.getUint32(central + 42, true);
      assert.strictEqual(view.getUint32(localOffset, true), 0x04034b50, "central offset points to a local header");
      central += 46 + nameLen + extraLen + commentLen;
    }
    console.log("  ✓ zip writer: valid offsets + data-URI binary bytes");
  });
}

function testParseBlocks() {
  const text = "Here you go:\n```veccode:index.html\n<h1>a</h1>\n```\n\nand css:\n````veccode:styles.css\nbody{}\n````\n";
  const files = Agent.parseFileBlocks(text);
  assert.deepStrictEqual(Object.keys(files).sort(), ["index.html", "styles.css"]);
  assert.strictEqual(files["index.html"], "<h1>a</h1>\n");
  assert.strictEqual(files["styles.css"], "body{}\n");
  console.log("  ✓ file-block parser: 3- and 4-backtick fences");
}

async function testAgentLoop() {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;

  State.resetProject(null, [], "Test project");
  State.setProvider("custom", { baseUrl: "http://127.0.0.1:" + port + "/v1", key: "", model: "mock-model" });
  State.setActiveProvider("custom");
  State.setSetting("review", true);

  const deltas = [];
  const chips = [];
  Agent.on("delta", (d) => deltas.push(d.text));
  Agent.on("filesWritten", (f) => chips.push(f));

  await Agent.run("Build a landing page", "build");

  // files written by tools
  const writtenHtml = State.readFile("index.html");
  assert.ok(writtenHtml.includes("<h1>hi</h1>"), "index.html written by tool");
  assert.ok(!writtenHtml.includes("Describe what this site offers") && !writtenHtml.includes("your-site.netlify.app/og"), "SEO plugin never injects placeholder metadata");
  assert.strictEqual(State.readFile("styles.css"), CSS, "styles.css written by tool");
  assert.ok(State.listFiles().includes("index.html"));

  // finish message became the assistant message
  const last = State.state.messages[State.state.messages.length - 1];
  assert.strictEqual(last.role, "assistant");
  assert.ok(last.content.includes("Built it"), "finish message used: " + last.content);

  // streaming deltas arrived
  assert.ok(deltas.join("").includes("Let me build this."), "text streamed");

  // usage tracked
  assert.ok(Agent.usage.input > 0 && Agent.usage.output > 0, "usage tracked: " + JSON.stringify(Agent.usage));

  // review pass (app.js send() runs it after every build when settings.review is on)
  await Agent.reviewPass();
  const reviewMsg = State.state.messages.find((m) => m.mode === "review");
  assert.ok(reviewMsg, "review pass produced a message");
  assert.ok(reviewMsg.content.includes("footer"), "review text: " + reviewMsg.content);

  // request log sanity: build turn had tools, review had tools
  const buildReqs = requestLog.filter((r) => !String(r.messages[0].content || "").includes("design reviewer"));
  assert.ok(buildReqs.length >= 2, "at least 2 build turns");
  assert.ok(buildReqs[0].tools && buildReqs[0].tools.length === 5, "5 tools sent");
  assert.ok(buildReqs[0].stream === true, "streaming on");

  console.log("  ✓ agent loop: tools, finish, review pass, usage, streaming");
  server.close();
}

async function testCodexOAuthHelpers() {
  // the endpoints/constants we rely on must be stable
  assert.strictEqual(Providers.CODEX_CLIENT_ID, "app_EMoamEEZ73f0CkXaXp7hrann");
  assert.ok(Providers.FREE_BASE.includes("osaii.wyvernhub.net"));
  assert.ok(Providers.FREE_MODELS_FALLBACK.every((m) => m.startsWith("poolside/")), "free tier is poolside-only");
  const meta = Providers.getProviderMeta("free");
  assert.strictEqual(meta.needsKey, false);
  console.log("  ✓ free tier is poolside-only; codex client id set");
}

async function testAnthropicAdapter() {
  let captured = null;
  const srv = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      captured = JSON.parse(body);
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      res.end(anthropicSse());
    });
  });
  await new Promise((r) => srv.listen(0, r));
  try {
    const out = await Providers.stream(
      {
        cfg: { id: "anthropic", kind: "anthropic", baseUrl: "http://127.0.0.1:" + srv.address().port + "/v1", key: "sk-ant-test", model: "claude-x" },
        messages: [
          { role: "system", content: "sys" },
          { role: "user", content: "build" },
          { role: "assistant", content: "", tool_calls: [{ id: "tu_1", name: "write_file", args: { path: "a.html", content: "x" } }] },
          { role: "tool", tool_call_id: "tu_1", content: "Wrote 1 bytes to a.html." },
          { role: "user", content: "continue" }
        ],
        tools: [{ type: "function", function: { name: "write_file", description: "d", parameters: { type: "object", properties: {} } } }],
        temperature: 0.5
      },
      { onText: () => {} }
    );
    assert.strictEqual(captured.system, "sys", "system extracted");
    assert.strictEqual(captured.messages.length, 4, "alternating roles");
    assert.deepStrictEqual(captured.messages.map((m) => m.role), ["user", "assistant", "user", "user"]);
    assert.strictEqual(captured.messages[1].content[0].type, "tool_use");
    assert.strictEqual(captured.messages[1].content[0].name, "write_file");
    assert.strictEqual(captured.messages[2].content[0].type, "tool_result");
    assert.strictEqual(captured.tools[0].input_schema.type, "object", "tools converted to input_schema");
    assert.ok(captured.messages[3].content.includes("continue"), "text merged after tool result");
    assert.strictEqual(out.text, "Hello from Claude");
  } finally {
    srv.close();
  }
  console.log("  ✓ anthropic adapter: alternation, tool_use/tool_result, system, schema");
}

async function testBlockFallbackLoop() {
  const BLOCK_HTML = "<!DOCTYPE html><html><body><p>block-built</p></body></html>";
  const srv = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const parsed = JSON.parse(body);
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      const isReview = String(parsed.messages[0].content || "").includes("design reviewer");
      if (isReview) {
        res.end(sse([
          { choices: [{ delta: { content: "No changes needed." }, finish_reason: null }] },
          finishChoice("stop")
        ]));
      } else if (parsed.messages.length <= 2) {
        // first build request: reply with fenced blocks, no tools
        res.end(sse([
          { choices: [{ delta: { content: "Here are the files:\n```veccode:index.html\n" }, finish_reason: null }] },
          { choices: [{ delta: { content: BLOCK_HTML + "\n```" }, finish_reason: null }] },
          finishChoice("stop")
        ]));
      } else {
        res.end(sse([
          toolCallDelta(0, "call_f", "finish", JSON.stringify({ message: "Built via blocks." })),
          finishChoice("tool_calls")
        ]));
      }
    });
  });
  await new Promise((r) => srv.listen(0, r));
  try {
    State.resetProject(null, [], "Block test");
    State.setProvider("custom", { baseUrl: "http://127.0.0.1:" + srv.address().port + "/v1", key: "", model: "m" });
    State.setActiveProvider("custom");
    State.setSetting("review", false);
    await Agent.run("build", "build");
    const html = State.readFile("index.html") || "";
    assert.ok(html.includes("block-built"), "file written via fallback protocol");
    const last = State.state.messages[State.state.messages.length - 1];
    assert.ok(last.content.includes("Here are the files"), "prose kept: " + last.content);
    assert.ok(!last.content.includes("```"), "fence markers stripped from chat message");
  } finally {
    srv.close();
  }
  console.log("  ✓ fallback protocol: veccode blocks → files → finish");
}

async function testSystemPrompt() {
  State.setPlugin("seo", true);
  State.setPlugin("a11y", true);
  State.addSkill("Tone", "Write like a librarian.");
  const sp = Agent.buildSystemPrompt(true);
  assert.ok(sp.includes("Vecode Design Skill"), "design skill embedded");
  assert.ok(sp.includes("anti-slop"), "anti-slop checklist embedded");
  assert.ok(sp.includes("SEO plugin is ON"), "plugin prompt injected");
  assert.ok(sp.includes("Write like a librarian."), "custom skill injected");
  assert.ok(sp.includes("veccode:index.html"), "file protocol documented");
  const noTools = Agent.buildSystemPrompt(false);
  assert.ok(noTools.includes("TOOLS ARE DISABLED") && noTools.includes("MUST write ALL complete text files"), "no-tools build protocol is mandatory");
  const noToolsReview = Agent.buildReviewSystemPrompt(false);
  assert.ok(noToolsReview.includes("MUST write ALL complete text files") && noToolsReview.includes("FULL CURRENT PROJECT"), "no-tools review protocol is mandatory");
  console.log("  ✓ system prompts: tools + mandatory block-protocol fallback");
}

function testPluginInjections() {
  assert.strictEqual(Plugins.PLUGINS.length, 10, "10 plugins registered");
  const defaults = Plugins.PLUGINS.filter((p) => p.default).map((p) => p.id);
  for (const id of ["typography", "darkmode", "motion", "forms", "seo", "a11y", "faq"]) {
    assert.ok(defaults.includes(id), id + " defaults on");
  }

  const base = { "index.html": "<!doctype html><html><head><title>Real site</title></head><body><h1>Real site</h1></body></html>" };
  const enabled = Plugins.applyInjections(base, ["analytics"], { analytics: { domain: "real.example" } });
  assert.ok(enabled["index.html"].includes("<!-- vecode:plugin:analytics -->"), "analytics start marker");
  assert.ok(enabled["index.html"].includes("<!-- /vecode:plugin:analytics -->"), "analytics end marker");
  assert.ok(enabled["index.html"].includes('data-domain="real.example"'), "analytics option injected");

  const repeated = Plugins.applyInjections(enabled, ["analytics"], { analytics: { domain: "real.example" } });
  assert.strictEqual((repeated["index.html"].match(/plausible\.io/g) || []).length, 1, "reapplying never duplicates");
  const disabled = Plugins.applyInjections(repeated, [], {});
  assert.ok(!disabled["index.html"].includes("plausible.io") && !disabled["index.html"].includes("vecode:plugin:analytics"), "toggle off removes managed code");

  const seo = Plugins.applyInjections(base, ["seo"], {});
  assert.strictEqual(seo["index.html"], base["index.html"], "SEO is prompt/review only and injects no fake metadata");
  assert.ok(!seo["index.html"].includes("Describe what this site offers") && !seo["index.html"].includes("your-site.netlify.app/og"), "no placeholder SEO values");
  console.log("  ✓ plugin injects: 10 defaults, marked, reversible, idempotent, no fake SEO");
}

async function testCompletionMessageOnEmptyFinish() {
  let turn = 0;
  const srv = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      turn++;
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      if (turn === 1) {
        // pure tool call, no text
        res.end(sse([
          toolCallDelta(0, "call_w1", "write_file", JSON.stringify({ path: "index.html", content: HTML })),
          toolCallDelta(1, "call_w2", "write_file", JSON.stringify({ path: "styles.css", content: CSS })),
          finishChoice("tool_calls"),
          { choices: [], usage: { prompt_tokens: 40, completion_tokens: 20 } }
        ]));
      } else {
        // finish with empty arguments and no text
        res.end(sse([
          toolCallDelta(0, "call_done", "finish", JSON.stringify({})),
          finishChoice("tool_calls"),
          { choices: [], usage: { prompt_tokens: 30, completion_tokens: 5 } }
        ]));
      }
    });
  });
  await new Promise((r) => srv.listen(0, r));
  try {
    State.resetProject(null, [], "Summary test");
    State.setProvider("custom", { baseUrl: "http://127.0.0.1:" + srv.address().port + "/v1", key: "", model: "m" });
    State.setActiveProvider("custom");
    State.setSetting("review", false);

    await Agent.run("Build a photographer portfolio", "build");
    const last = State.state.messages[State.state.messages.length - 1];
    assert.strictEqual(last.role, "assistant");
    assert.ok(last.content && last.content.trim().length > 0, "assistant message is not blank");
    assert.ok(last.content.includes("index.html") && last.content.includes("styles.css"), "summary lists created files: " + last.content);

    // review pass with no changes produced a clean verdict
    const reviewSummary = Agent.summarizeAgentAction("review", [], []);
    assert.ok(reviewSummary.includes("Design review complete"), "review summary produced: " + reviewSummary);
  } finally {
    srv.close();
  }
  console.log("  ✓ completion summary: agent synthesizes clear summary when finish message is empty");
}

(async () => {
  console.log("Vecode harness tests");
  await testZip();
  testParseBlocks();
  await testCodexOAuthHelpers();
  await testSystemPrompt();
  testPluginInjections();
  await testAnthropicAdapter();
  await testBlockFallbackLoop();
  await testAgentLoop();
  await testCompletionMessageOnEmptyFinish();
  console.log("\nAll tests passed ✓");
  process.exit(0);
})().catch((e) => {
  console.error("\nTEST FAILURE:", e);
  process.exit(1);
});
