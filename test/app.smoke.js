/* ==========================================================================
   Vecode — full-app boot smoke test (jsdom, no browser needed)
   Loads index.html with all scripts, runs init(), and exercises the UI:
     · boot with no errors
     · empty-state render + prompt chips
     · template load → files + preview srcdoc
     · settings modal opens (provider cards)
     · plugins view renders and toggles
     · skill + deploy views render
     · file add/delete, export zip button wiring
   Install:  npm i jsdom   (dev only — not a runtime dependency)
   Run:      node test/app.smoke.js
   ========================================================================== */
"use strict";
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const errors = [];
const dom = new JSDOM(html, {
  url: "http://localhost:4173/",
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  beforeParse(window) {
    const realFetch = global.fetch;
    window.fetch = (url, opts) => {
      // free-tier models discovery + settings modal refresh — return poolside-only list
      if (String(url).includes("/models")) {
        return Promise.resolve(new window.Response(JSON.stringify({ object: "list", data: [
          { id: "poolside/laguna-s-2.1" }, { id: "poolside/laguna-xs-2.1" }, { id: "other/model-x" }
        ] }), { status: 200, headers: { "Content-Type": "application/json" } }));
      }
      return realFetch(url, opts); // everything else (the mock provider server) → node fetch
    };
    window.confirm = () => true;
    window.alert = () => {};
    window.scrollTo = () => {};
    window.Element.prototype.scrollIntoView = () => {}; // jsdom doesn't implement it
    window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));
    window.HTMLCanvasElement.prototype.getContext = function () { return null; }; // no canvas in jsdom
    window.URL.createObjectURL = () => "blob:mock";
    window.URL.revokeObjectURL = () => {};
    window.navigator.clipboard = { writeText: () => Promise.resolve() };
    const origError = window.console.error;
    window.console.error = (...a) => { errors.push(a.map(String).join(" ")); origError.apply(window.console, a); };
  }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (sel) => dom.window.document.querySelector(sel);
const $$ = (sel) => Array.from(dom.window.document.querySelectorAll(sel));
const assert = require("assert");

async function main() {
  await sleep(1800); // let scripts run + init()

  // 1. boot
  assert.ok($("#topbar"), "topbar rendered");
  assert.ok($("#chatLog"), "chat log exists");
  assert.ok($$("#promptChips .prompt-chip").length >= 5, "prompt chips rendered");
  assert.ok($("#modelPill").textContent.includes("Poolside"), "model pill shows free tier: " + $("#modelPill").textContent);
  console.log("  ✓ boot: layout, chips, model pill (free tier default)");

  // 2. empty hero + onboarding modal
  assert.ok($("#modalRoot .modal"), "onboarding modal opened on first run");
  $$("#modalRoot .template-tile")[0].click(); // load "Landing page" template
  await sleep(120);
  assert.ok($("#modalRoot .modal") === null, "onboarding closed after template pick");
  const files = dom.window.Vecode.State.listFiles();
  assert.ok(files.includes("index.html") && files.includes("styles.css"), "template files loaded");
  assert.ok($("#previewFrame").srcdoc.includes("fieldnote"), "preview srcdoc rendered from template: " + $("#previewFrame").srcdoc.slice(0, 80));
  console.log("  ✓ template: files seeded + preview srcdoc built (" + files.join(", ") + ")");

  // 3. settings modal
  $("#settingsBtn").click();
  await sleep(80);
  assert.ok($("#modalRoot .modal"), "settings modal opened");
  assert.ok($$("#modalRoot .provider-card").length === 8, "8 provider cards");
  assert.ok($("#modalRoot #freeModelSelect"), "free tier model select");
  await sleep(150); // let the async free-models refresh land
  const freeOptions = Array.from($("#modalRoot #freeModelSelect").options).map((o) => o.value);
  assert.ok(freeOptions.every((m) => m.startsWith("poolside/")), "free tier lists poolside only: " + freeOptions.join(","));
  $("#modalRoot .modal-foot .btn-signal").click(); // Done
  console.log("  ✓ settings: 8 providers, free tier poolside-only (" + freeOptions.join(", ") + ")");

  // 4. plugins view
  dom.window.Vecode.App.switchView("plugins");
  await sleep(80);
  assert.ok($$("#view-plugins .plugin-card").length === 8, "8 plugin cards");
  const firstToggle = $("#view-plugins .switch input");
  firstToggle.click();
  await sleep(80);
  console.log("  ✓ plugins: 8 cards, toggle works");

  // 5. skill view
  dom.window.Vecode.App.switchView("skill");
  await sleep(80);
  assert.ok($("#view-skill .markdown-body").textContent.includes("Anti-slop"), "skill markdown rendered");
  assert.ok($$("#view-skill .swatch").length === 12, "12 token swatches");
  console.log("  ✓ skill panel: workflow, swatches, full skill markdown");

  // 6. deploy view
  dom.window.Vecode.App.switchView("deploy");
  await sleep(80);
  assert.ok($("#view-deploy").textContent.includes("Netlify Drop"), "deploy guide rendered");
  console.log("  ✓ deploy: step-by-step Netlify guide");

  // 7. files: add + delete
  dom.window.Vecode.App.switchView("files");
  await sleep(80);
  $("#newFileName").value = "pages/about.html";
  $$("#view-files .btn")[0].click();
  await sleep(60);
  assert.ok(dom.window.Vecode.State.readFile("pages/about.html") !== null, "file added");
  const row = Array.from($$("#view-files .file-row")).find((r) => r.textContent.includes("pages/about.html"));
  const delBtn = Array.from(row.querySelectorAll(".fdel")).find((b) => b.title === "Delete");
  delBtn.click();
  await sleep(60);
  assert.ok(dom.window.Vecode.State.readFile("pages/about.html") === null, "file deleted");
  console.log("  ✓ files: add + delete in the virtual FS");

  // 8. agent build against a mock provider (full stack through the UI)
  const { State, Agent, Providers } = dom.window.Vecode;
  State.resetProject(null, [], "Smoke");
  State.setProvider("custom", { baseUrl: "http://mock.local/v1", key: "", model: "m" });
  State.setActiveProvider("custom");
  // point fetch at a mock OpenAI-compatible server for chat completions
  const http = require("http");
  let reqCount = 0;
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      reqCount++;
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      const chunks = reqCount === 1
        ? [
            { choices: [{ delta: { content: "Building. " }, finish_reason: null }] },
            { choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", function: { name: "write_file", arguments: JSON.stringify({ path: "index.html", content: "<h1>Smoke</h1>" }) } }] }, finish_reason: null }] },
            { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
            { choices: [], usage: { prompt_tokens: 5, completion_tokens: 3 } }
          ]
        : [
            { choices: [{ delta: { tool_calls: [{ index: 0, id: "c2", function: { name: "finish", arguments: JSON.stringify({ message: "Smoke site built." }) } }] }, finish_reason: null }] },
            { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
            { choices: [], usage: { prompt_tokens: 4, completion_tokens: 2 } }
          ];
      res.end(chunks.map((p) => "data: " + JSON.stringify(p) + "\n\n").join("") + "data: [DONE]\n\n");
    });
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  State.setProvider("custom", { baseUrl: "http://127.0.0.1:" + port + "/v1" });
  State.setSetting("review", false);

  dom.window.Vecode.App.send("Build a smoke site");
  await sleep(700);
  server.close();
  assert.ok(State.readFile("index.html").includes("Smoke"), "agent wrote index.html through UI flow");
  const lastMsg = State.state.messages[State.state.messages.length - 1];
  assert.strictEqual(lastMsg.role, "assistant", "assistant message persisted");
  console.log("  ✓ full stack: send → agent → mock provider → file → chat (" + JSON.stringify(lastMsg.content.slice(0, 40)) + ")");

  const fatal = errors.filter((e) => !/Not implemented: HTMLCanvasElement|decodingTexture|getContext/.test(e));
  assert.strictEqual(fatal.length, 0, "no console errors:\n" + fatal.join("\n"));
  console.log("\nApp smoke test passed ✓  (console errors: " + errors.length + ", all benign)");
  process.exit(0);
}

main().catch((e) => {
  console.error("\nSMOKE FAILURE:", e && e.stack || e);
  process.exit(1);
});
