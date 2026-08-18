/* ==========================================================================
   Vecode — full-app boot smoke test (jsdom)
   Requires a static server on port 4173 serving the repository root.
   Exercises boot, onboarding, providers, plugins, files/editor, preview
   inlining/sandboxing, streaming agent flow, ZIP export and clear-chat.
   ========================================================================== */
"use strict";
const { JSDOM, ResourceLoader, VirtualConsole } = require("jsdom");
const fs = require("fs");
const path = require("path");
const http = require("http");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const errors = [];
const jsdomErrors = [];

class LocalOnlyLoader extends ResourceLoader {
  fetch(url, options) {
    if (String(url).startsWith("http://localhost:4173/")) return super.fetch(url, options);
    // Fonts and generated-site third-party assets are irrelevant to this test.
    return Promise.resolve(Buffer.from(""));
  }
}

const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => {
  if (!/Not implemented: HTMLCanvasElement/i.test(String(error && error.message))) jsdomErrors.push(String(error && error.stack || error));
});

const dom = new JSDOM(html, {
  url: "http://localhost:4173/",
  runScripts: "dangerously",
  resources: new LocalOnlyLoader(),
  virtualConsole,
  pretendToBeVisual: true,
  beforeParse(window) {
    const realFetch = global.fetch;
    window.Response = window.Response || global.Response;
    window.Headers = window.Headers || global.Headers;
    window.Request = window.Request || global.Request;
    window.fetch = (url, opts) => {
      // Free-tier discovery: include a non-Poolside model to verify filtering.
      if (String(url).includes("/models")) {
        return Promise.resolve(new window.Response(JSON.stringify({ object: "list", data: [
          { id: "poolside/laguna-s-2.1" },
          { id: "poolside/laguna-xs-2.1" },
          { id: "other/model-x" }
        ] }), { status: 200, headers: { "Content-Type": "application/json" } }));
      }
      return realFetch(url, opts);
    };
    window.confirm = () => true;
    window.alert = () => {};
    window.scrollTo = () => {};
    window.Element.prototype.scrollIntoView = () => {};
    window.matchMedia = window.matchMedia || ((query) => ({
      matches: false, media: query, addEventListener() {}, removeEventListener() {}
    }));
    window.HTMLCanvasElement.prototype.getContext = function () { return null; };
    window.URL.createObjectURL = () => "blob:mock";
    window.URL.revokeObjectURL = () => {};
    window.open = () => null;
    window.navigator.clipboard = { writeText: () => Promise.resolve() };
    const originalError = window.console.error;
    window.console.error = (...args) => {
      errors.push(args.map(String).join(" "));
      originalError.apply(window.console, args);
    };
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const $ = (selector) => dom.window.document.querySelector(selector);
const $$ = (selector) => Array.from(dom.window.document.querySelectorAll(selector));
const byText = (nodes, text) => Array.from(nodes).find((node) => node.textContent.trim().includes(text));
function change(input, value) {
  input.value = value;
  input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
}
function blobArrayBuffer(blob) {
  if (typeof blob.arrayBuffer === "function") return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new dom.window.FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

async function main() {
  for (let i = 0; i < 50 && (!dom.window.Vecode || !dom.window.Vecode.App || $$("#promptChips .prompt-chip").length < 5); i++) await sleep(100);
  const { State, Agent, Providers, App, Zip } = dom.window.Vecode;

  // 1. Boot, defaults, and the isolated preview.
  assert.ok($("#topbar") && $("#chatLog"), "app shell booted");
  assert.ok($$("#promptChips .prompt-chip").length >= 5, "prompt chips rendered");
  assert.ok($("#modelPill").textContent.includes("Poolside"), "free tier is selected by default");
  assert.strictEqual($("#previewFrame").getAttribute("sandbox"), "allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-pointer-lock", "preview sandbox excludes allow-same-origin");
  for (const id of ["typography", "darkmode", "motion", "forms", "seo", "a11y", "faq"]) {
    assert.strictEqual(State.isPluginEnabled(id), true, id + " defaults on");
  }
  assert.strictEqual(State.isPluginEnabled("analytics"), false, "analytics defaults off");
  console.log("  ✓ boot: free tier, plugin defaults, isolated preview sandbox");

  // Security errors caused by the intentionally opaque iframe must be ignored.
  dom.window.dispatchEvent(new dom.window.MessageEvent("message", { data: { vecode: "error", msg: "SecurityError: localStorage is unavailable in a sandboxed document without allow-same-origin" } }));
  assert.ok(!$("#errBadge").classList.contains("show"), "sandbox SecurityError is filtered");

  // 2. Fresh-storage onboarding and starter template.
  assert.ok($("#modalRoot .modal"), "onboarding modal opened on first run");
  $$("#modalRoot .template-tile")[0].click();
  await sleep(120);
  assert.strictEqual($("#modalRoot .modal"), null, "onboarding closes after template selection");
  assert.ok(State.listFiles().includes("index.html") && State.listFiles().includes("styles.css"), "template seeded files");
  assert.ok($("#previewFrame").srcdoc.includes("fieldnote"), "template rendered in preview");
  console.log("  ✓ onboarding: template seeds files and live preview");

  // 3. Settings: eight cards, Poolside-only list, and graceful custom failure.
  $("#settingsBtn").click();
  await sleep(80);
  assert.strictEqual($$("#modalRoot .provider-card").length, 8, "8 provider cards");
  await sleep(80);
  const freeOptions = Array.from($("#freeModelSelect").options).map((option) => option.value);
  assert.ok(freeOptions.length >= 2 && freeOptions.every((model) => model.startsWith("poolside/")), "free list is Poolside-only");

  $$("#modalRoot .provider-card")[7].click();
  await sleep(40);
  const custom = $$("#modalRoot .provider-card")[7];
  const customInputs = custom.querySelectorAll("input");
  change(customInputs[0], "http://127.0.0.1:1/v1");
  change(customInputs[1], "fake-key");
  change(customInputs[2], "fake-model");
  const testButton = byText(custom.querySelectorAll("button"), "Test connection");
  testButton.click();
  await sleep(250);
  assert.ok(testButton.textContent.startsWith("Failed:"), "custom connection failure is readable");
  assert.strictEqual(errors.length, 0, "failed connection caused no console error");

  $$("#modalRoot .provider-card")[0].click();
  await sleep(30);
  $("#modalRoot .modal-foot .btn-signal").click();
  console.log("  ✓ settings: 8 providers, Poolside-only models, graceful connection error");

  // 4. Ten plugins; Analytics injection is managed, reversible and idempotent.
  App.switchView("plugins");
  await sleep(40);
  assert.strictEqual($$("#view-plugins .plugin-card").length, 10, "10 plugin cards");
  let analyticsCard = byText($$("#view-plugins .plugin-card"), "Analytics");
  analyticsCard.querySelector('input[type="checkbox"]').click();
  await sleep(40);
  let projectHtml = State.readFile("index.html");
  assert.ok(projectHtml.includes("<!-- vecode:plugin:analytics -->") && projectHtml.includes("plausible.io"), "Analytics injects a marked snippet");
  assert.strictEqual((projectHtml.match(/plausible\.io/g) || []).length, 1, "Analytics injects once");
  analyticsCard = byText($$("#view-plugins .plugin-card"), "Analytics");
  analyticsCard.querySelector('input[type="checkbox"]').click();
  await sleep(40);
  projectHtml = State.readFile("index.html");
  assert.ok(!projectHtml.includes("plausible.io") && !projectHtml.includes("vecode:plugin:analytics"), "Analytics toggle-off removes snippet");
  console.log("  ✓ plugins: 10 cards; managed injection toggles cleanly");

  // 5. Skill and deploy panels.
  App.switchView("skill");
  await sleep(30);
  assert.ok($("#view-skill .markdown-body").textContent.includes("Anti-slop"), "skill markdown rendered");
  assert.strictEqual($$("#view-skill .swatch").length, 12, "12 skill swatches");
  App.switchView("deploy");
  await sleep(30);
  assert.ok($("#view-deploy").textContent.includes("Netlify Drop"), "deploy guide rendered");
  console.log("  ✓ skill + deploy: full skill and Netlify guide render");

  // 6. Files: add, edit, preview, and delete a nested page.
  App.switchView("files");
  await sleep(30);
  $("#newFileName").value = "pages/about.html";
  byText($$("#view-files button"), "Add").click();
  let row = byText($$("#view-files .file-row"), "pages/about.html");
  row.querySelector("button.fname").click();
  await sleep(20);
  $("#fileEditor").value = "<!doctype html><html><body><h1>Edited about page</h1></body></html>";
  byText($$("#modalRoot .modal-foot button"), "Save file").click();
  assert.ok(State.readFile("pages/about.html").includes("Edited about page"), "file editor saves content");
  row = byText($$("#view-files .file-row"), "pages/about.html");
  row.querySelector('button[title="Preview this page"]').click();
  assert.ok($("#previewFrame").srcdoc.includes("Edited about page"), "eye button previews nested page");
  App.switchView("files");
  row = byText($$("#view-files .file-row"), "pages/about.html");
  row.querySelector('button[title="Delete"]').click();
  assert.strictEqual(State.readFile("pages/about.html"), null, "file deleted");
  console.log("  ✓ files: nested page add → edit → preview → delete");

  // Project rename, device selection, and the complete theme cycle.
  $("#projectName").click();
  change($("#projectNameInput"), "Smoke Project");
  byText($$("#modalRoot .modal-foot button"), "Rename").click();
  assert.strictEqual(State.state.name, "Smoke Project", "project renamed");
  const mobile = byText($$("#deviceSeg button"), "Mobile");
  mobile.click();
  assert.ok(mobile.classList.contains("active") && !byText($$("#deviceSeg button"), "Desktop").classList.contains("active"), "correct device button is active");
  $("#themeToggle").click();
  assert.strictEqual(State.settings.theme, "light");
  $("#themeToggle").click();
  assert.strictEqual(State.settings.theme, "system");
  $("#themeToggle").click();
  assert.strictEqual(State.settings.theme, "dark");
  console.log("  ✓ workspace controls: rename, device switcher, theme cycle");

  // 7. Robust asset inlining: attribute order, query strings, raw-close tags,
  // and a binary data URI all survive the srcdoc transform.
  const png = "data:image/png;base64,iVBORw0KGgo=";
  State.resetProject({
    "index.html": "<!doctype html><html><head><link href='styles.css?v=2' media='all' rel='stylesheet'></head><body><img src='logo.png?v=2' alt='Logo'><script defer src='script.js#v2'></script></body></html>",
    "styles.css": "body::after{content:\"x</style>y\"}",
    "script.js": "window.assetWorked = \"x</script>y\";",
    "logo.png": png
  }, [], "Asset test");
  await sleep(430);
  const srcdoc = $("#previewFrame").srcdoc;
  assert.ok(!srcdoc.includes("styles.css?v=2") && srcdoc.includes("body::after"), "stylesheet matched with href before rel and query stripped");
  assert.ok(!srcdoc.includes("script.js#v2") && srcdoc.includes("window.assetWorked"), "script query/hash stripped and file inlined");
  assert.ok(srcdoc.includes("x<\\/style>y") && srcdoc.includes("x<\\/script>y"), "raw closing tags escaped inside user assets");
  assert.ok(srcdoc.includes(png), "binary image data URI restored despite src query");
  console.log("  ✓ preview assets: robust matching, escaping, queries, binary image");

  // 8. Full UI → provider → SSE → tools flow. TextDecoder is intentionally
  // absent from this Window in jsdom, exercising providers.js's fallback.
  State.resetProject(null, [], "Agent smoke");
  State.setProvider("custom", { baseUrl: "http://mock.local/v1", key: "", model: "mock-model" });
  State.setActiveProvider("custom");
  State.setSetting("review", false);

  let requestCount = 0;
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      JSON.parse(body); // request must be valid JSON
      requestCount++;
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      if (requestCount === 1) {
        res.write("data: " + JSON.stringify({ choices: [{ delta: { content: "Building. " }, finish_reason: null }] }) + "\n\n");
        setTimeout(() => {
          const chunks = [
            { choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", function: { name: "write_file", arguments: JSON.stringify({ path: "index.html", content: "<!doctype html><html><body><h1>Smoke</h1></body></html>" }) } }] }, finish_reason: null }] },
            { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
            { choices: [], usage: { prompt_tokens: 5, completion_tokens: 3 } }
          ];
          res.end(chunks.map((payload) => "data: " + JSON.stringify(payload) + "\n\n").join("") + "data: [DONE]\n\n");
        }, 140);
      } else {
        const chunks = [
          { choices: [{ delta: { tool_calls: [{ index: 0, id: "c2", function: { name: "finish", arguments: JSON.stringify({ message: "Smoke site built." }) } }] }, finish_reason: null }] },
          { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
          { choices: [], usage: { prompt_tokens: 4, completion_tokens: 2 } }
        ];
        res.end(chunks.map((payload) => "data: " + JSON.stringify(payload) + "\n\n").join("") + "data: [DONE]\n\n");
      }
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  State.setProvider("custom", { baseUrl: "http://127.0.0.1:" + server.address().port + "/v1" });
  App.switchView("build");
  const input = $("#chatInput");
  input.value = "Build a smoke site";
  input.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await sleep(60);
  assert.strictEqual(State.state.messages[0].role, "user", "Enter sends the prompt");
  assert.notStrictEqual($("#stopBtn").style.display, "none", "Build button becomes Stop while running");
  const streaming = $("#chatLog .msg.assistant .msg-body[data-raw]");
  assert.ok(streaming && !streaming.textContent.startsWith("null") && !streaming.getAttribute("data-raw").startsWith("null"), "streaming chat never renders literal null");
  await sleep(650);
  await new Promise((resolve) => server.close(resolve));
  assert.ok(State.readFile("index.html").includes("Smoke"), "agent wrote index.html through UI flow");
  const lastMessage = State.state.messages[State.state.messages.length - 1];
  assert.strictEqual(lastMessage.role, "assistant");
  assert.ok(lastMessage.content.includes("Smoke site built"), "finish message persisted");
  console.log("  ✓ full stack: Enter → stream → tools → file → final chat (no null)");

  // 9. ZIP export includes deploy files and raw project files.
  State.writeFile("styles.css", "body{color:#123}");
  let exported = null;
  const originalDownload = Zip.downloadBlob;
  Zip.downloadBlob = (blob, filename) => { exported = { blob, filename }; };
  App.switchView("deploy");
  byText($$("#view-deploy button"), "Download ZIP").click();
  assert.ok(exported && exported.filename.endsWith(".zip"), "ZIP download invoked");
  const zipText = Buffer.from(await blobArrayBuffer(exported.blob)).toString("latin1");
  for (const name of ["index.html", "styles.css", "netlify.toml", "DEPLOY.md"]) assert.ok(zipText.includes(name), name + " is in ZIP");
  Zip.downloadBlob = originalDownload;
  console.log("  ✓ deploy export: valid project + Netlify files included");

  // 10. Clear chat keeps files.
  App.switchView("build");
  $("#clearChatBtn").click();
  assert.strictEqual(State.state.messages.length, 0, "chat cleared");
  assert.ok(State.readFile("index.html").includes("Smoke") && State.readFile("styles.css"), "files kept after clear");
  assert.ok($("#chatLog .empty-hero"), "empty chat state rerendered");
  console.log("  ✓ clear chat: history removed, project files preserved");

  assert.strictEqual(errors.length, 0, "no console.error calls:\n" + errors.join("\n"));
  assert.strictEqual(jsdomErrors.length, 0, "no jsdom runtime errors:\n" + jsdomErrors.join("\n"));
  console.log("\nApp smoke test passed ✓ (console errors: 0, all benign)");
  dom.window.close();
  process.exit(0);
}

main().catch((error) => {
  console.error("\nSMOKE FAILURE:", error);
  dom.window.close();
  process.exit(1);
});
