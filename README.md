# Vecode

**A simple, clean AI website builder that runs entirely in your browser.**

Describe a site in one sentence. Vecode's built-in agent writes real HTML, CSS and JS — file by file, streamed live — into a virtual file system, renders it in a live preview, reviews its own design against an anti-slop checklist, and hands you a ZIP you can drop onto Netlify. No install, no build step, no server.

- **Free tier included** — poolside models through an OpenAI-compatible gateway, **no API key required** ([live model list](https://osaii.wyvernhub.net/api/v1/models), poolside only)
- **Bring your own key** — OpenAI, Anthropic, Google Gemini, OpenRouter, xAI Grok, **Codex (ChatGPT OAuth)** and any custom OpenAI-compatible endpoint (the OpenCode-style "just paste your key" flow)
- **Full agent harness** — streaming tool calls (`write_file`, `read_file`, `list_files`, `delete_file`, `finish`), a fenced-block file protocol as universal fallback, a design-review pass after every build, cancellation, token accounting
- **Design skill built in** — a working implementation of the *Minc Frontend Design Skill* (scientific humanism: one signal color, 3-role typography, two grid modes, quiet generative texture, human voice). Ships in [`skill/`](skill/) so you can drop it into any agent
- **10 plugins** — typography, dark mode, motion, Netlify Forms, SEO, analytics, accessibility, PWA, FAQ and performance; managed code injections are marked, reversible and idempotent
- **Live preview** — desktop/tablet/mobile, multi-page navigation, binary assets, console-error capture and open-in-new-tab, isolated in a sandbox that cannot read Vecode's saved keys
- **Deploy in two steps** — export ZIP → drop on [app.netlify.com/drop](https://app.netlify.com/drop). Full guide in-app and below

---

## Try it

1. **Open `index.html`** directly in a browser (works from `file://` — no server needed), or
2. Host it anywhere static — it's just files.

Everything saves to your browser's localStorage: project files (including imported binary assets), messages, keys and plugin settings. Text files can be edited in-app, and the project name and chat history can be managed independently.

## Quick start

1. **Pick a model** — the free Poolside tier is selected by default and needs nothing. For BYOK, open **Models & settings** (top-right) and paste a key.
2. **Describe the site** — "A landing page for a coffee roaster called Ember & Oak", or start from a template (Build screen, or Files → Start from a template).
3. **Watch it build** — press **Enter** to send (**Shift+Enter** adds a line); files stream into the workspace and the preview updates live. Follow up with plain sentences: "make the hero darker", "add a pricing section".
4. **Deploy** — Deploy tab → *Download ZIP* → drag it onto [Netlify Drop](https://app.netlify.com/drop). Live URL in seconds.

## Model providers

| Provider | How | Free? |
|---|---|---|
| **Poolside (free tier)** | OpenAI-compatible gateway, no key. Models: `poolside/laguna-s-2.1` (frontier-class reasoning), `poolside/laguna-xs-2.1` (light & fast). 262k context, tool use. Poolside models only — the list is filtered on the live `/models` endpoint. | ✅ |
| **OpenAI** | Paste `sk-…` key from [platform.openai.com](https://platform.openai.com/api-keys) | — |
| **Anthropic** | Paste `sk-ant-…` key from [console.anthropic.com](https://console.anthropic.com/settings/keys) | — |
| **Google Gemini** | Paste `AIza…` key from [aistudio.google.com](https://aistudio.google.com/apikey) (OpenAI-compatible endpoint) | — |
| **OpenRouter** | Paste `sk-or-…` key — hundreds of models | — |
| **xAI Grok** | Paste `xai-…` key from [console.x.ai](https://console.x.ai) | — |
| **Codex — ChatGPT** | **Sign in with ChatGPT** — device-code OAuth, the same flow as `codex login` (auth.openai.com device auth → token exchange). Bills your ChatGPT plan, not API credits. Or paste an access token from `~/.codex/auth.json`. | with ChatGPT plan |
| **Custom endpoint** | Any OpenAI-compatible base URL + optional key — the OpenCode-style "just paste your key" pattern. Works with local servers, gateways, proxies. | depends |

Keys live only in your browser's localStorage and are sent only to the provider you chose. Vecode has no backend.

## The agent harness

- **Streaming turns** over SSE (OpenAI-compatible and Anthropic wire formats), with reasoning-model support (temperature auto-dropped for `o1`/`o3`/`gpt-5`-family).
- **Tool loop** — up to 14 iterations of tool calls per turn: `write_file`, `read_file`, `list_files`, `delete_file`, `finish`. Malformed tool JSON is fed back to the model to self-correct.
- **File protocol fallback** — models can emit ` ```veccode:index.html ` fenced blocks instead of tool calls; the harness parses both 3- and 4-backtick fences, writes the files, and strips the fences from the chat message.
- **Design-review pass** — after each build (toggleable), the agent audits its own output against the anti-slop checklist and fixes what fails. That self-improvement loop is the same idea as the original Vecode's "self-learning skills".
- **Your skills** — Plugins → *Your skills* lets you teach the agent anything (tone, patterns, house style); saved on-browser and injected into every system prompt.
- Cancellation, live file-activity chips, per-turn token accounting.

## Plugins

Each plugin contributes real instructions to the agent prompt and, where it makes sense, injects working code into your project files. Toggle any of them before your next request:

- **Typography · 3-role type** — four pairing presets (Warmth, Precision, Editorial, Humanist); injects Google Fonts links and `--font-ui / --font-mono / --font-editorial` tokens
- **Dark mode** — token-remap dark theme guidance + `color-scheme` meta
- **Motion** — micro-interaction rules + a reveal-on-scroll helper that respects `prefers-reduced-motion`
- **Netlify Forms** — forms with `data-netlify="true"` + honeypot, so submissions land in your Netlify dashboard after deploy
- **SEO** — title/description/Open Graph/JSON-LD guidance and review checks; it deliberately does not inject fake placeholder metadata
- **Analytics** — privacy-friendly Plausible snippet with your domain
- **Accessibility** — semantic landmarks, labels, contrast, focus, reduced-motion rules + review checks
- **PWA / offline** — manifest + service worker guidance
- **FAQ** — useful answers, accessible disclosure UI and honest FAQPage schema checks
- **Performance** — image sizing/loading, script deferral and layout-shift guidance

Plugins marked `default: true` start enabled on first run. Any code a plugin injects is enclosed in `<!-- vecode:plugin:id -->` markers. Reapplying a plugin never duplicates its code, and switching it off removes only the code it manages.

## The design skill

Vecode's agent designs with the **Vecode Design Skill** — adapted from the [Minc Frontend Design Skill](https://github.com/morriszdweck/minc-frontend-design) (MIT, by Minc), itself inspired by the Kimi Visual Identity System ("scientific humanism"): precision and warmth held in deliberate tension. Six steps, enforced on every build:

1. Commit to a direction on the precision ↔ warmth axis
2. Set the token architecture — one signal color, neutrals do 90% of the work
3. Assign three type roles — UI sans, mono for data, editorial serif for warmth
4. Choose a grid mode per surface — base grid or expressive grid
5. Add texture, voice, motion — quiet generative glyph texture, human copy, motion as punctuation
6. Anti-slop review — the checklist the review pass runs

The full skill ships in [`skill/`](skill/) (`SKILL.md`, token preset, texture script, three reference docs) — drop that folder into any agent's skills directory (e.g. `.claude/skills/`) and it works outside Vecode too. The in-app **Design skill** panel shows the workflow, the token swatches and the full text.

## Deploying to Netlify

The app has a full step-by-step guide (Deploy tab). Short version:

**Fastest — Netlify Drop**
1. Deploy tab → **Download ZIP** (includes `netlify.toml` + `DEPLOY.md`).
2. Open [app.netlify.com/drop](https://app.netlify.com/drop) and drop the ZIP on the page.
3. Netlify gives you a live HTTPS URL. That's it.

**Or the CLI**

```bash
npm i -g netlify-cli
cd your-exported-folder
netlify deploy --prod
```

**Or from Git** — push the folder to GitHub/GitLab, then Netlify → *Add new site → Import an existing project*. Build command: none (static). Publish directory: `.`.

Notes: `netlify.toml` ships in every export with security headers and the publish directory. Forms built with the Netlify Forms plugin work out of the box. Custom domains under *Site settings → Domain management*.

## Deploying Vecode itself

Vecode is a static site — this whole repo. Drag it onto Netlify Drop or `netlify deploy`, or open `index.html` from disk. Nothing to build.

## Development

```bash
npm install
npm test             # agent/provider/plugin/ZIP integration suite
python3 -m http.server 4173 --bind 0.0.0.0
npm run test:smoke   # in another shell: full-app jsdom smoke suite
```

The tests spin up mock OpenAI-compatible and Anthropic servers and drive the real browser modules: streaming tool and block-protocol loops, review prompts, reversible plugin injection, binary ZIP output, app boot, onboarding, settings, file editing, sandboxed preview transforms, export and chat clearing.

## Layout

```
index.html            app shell
css/app.css           design system (Minc token preset)
js/state.js           virtual file system + persistence
js/providers.js       BYOK providers, free tier, Codex OAuth, streaming clients
js/agent.js           the agent harness (tools, file protocol, review pass)
js/plugins.js         plugin registry
js/templates.js       starter templates (hand-built with the design skill)
js/skill.js           embedded design skill
js/zip.js             dependency-free ZIP writer (data-URI aware)
js/app.js             UI, sandboxed preview, files/editor, panels, modals
skill/                the standalone design skill (drop into any agent)
netlify.toml          deploy config
test/agent.test.js    integration tests (no dependencies)
```

## License

MIT. The design skill in [`skill/`](skill/) is the Minc Frontend Design Skill (MIT, by Minc — github.com/morriszdweck/minc-frontend-design); Kimi trademarks belong to Moonshot AI.
