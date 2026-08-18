/* ==========================================================================
   Vecode — skill.js · the Vecode Design Skill
   --------------------------------------------------------------------------
   Adapted from the Minc Frontend Design Skill
   (github.com/morriszdweck/minc-frontend-design, MIT, author: Minc),
   inspired by the Kimi Visual Identity System ("scientific humanism").
   This is the design brain of the agent and the content of the Skill panel.
   ========================================================================== */
(function () {
  "use strict";

  const SKILL_MD = `# Vecode Design Skill

A frontend design skill for the Vecode agent, adapted from the Minc Frontend Design Skill (github.com/morriszdweck/minc-frontend-design) and inspired by the Kimi Visual Identity System — *scientific humanism*: precision and warmth held in deliberate tension.

The skill's job is to stop generic AI-slop output (purple-blue gradients, Inter-everything, emoji bullets, cookie-cutter centered heroes, glassmorphism abuse) and replace it with committed, intentional design: one signal color, three typefaces with named roles, a deliberate grid mode, a quiet generative texture, and copy that sounds human.

## Workflow — six steps, in order, for every build

### 1. Commit to a direction
Place the project on the **precision ↔ warmth** axis and write the commitment down in one sentence.
- **Precision pole** (developer tools, dashboards, infra, fintech): strict grid, mono-forward, cool neutrals, restrained motion.
- **Warmth pole** (editorial, portfolio, consumer, storytelling): expressive grid, serif headlines, warm whites, generous whitespace.
- **Most products sit at 60/40, never 50/50.** Pick which pole leads; the other pole enters only as contrast moments.
Every later decision answers to this commitment. If a choice fits neither pole, cut it.

### 2. Set the token architecture
Palette shape is fixed: a 5-step neutral ramp + ONE signal color family + 3–4 pastel accents.
- **Signal color is a budget.** Exactly one saturated hue carries all attention and actions — primary CTAs, active states, alerts, focus rings, key metrics. Neutrals do 90% of the work. If a screen uses the signal in more than ~5% of its pixels, it is decoration — pull it back.
- **Pastel accents are a separate budget.** Categorization only (tags, soft fills), always low-saturation — never CTAs, alerts, or focus states. The two budgets never compete in the same component.
- **Warm white beats cold gray** for light surfaces (#FCFCFA over #F5F5F5).
- Define dark mode as a token remap (via [data-theme] or prefers-color-scheme), never ad-hoc overrides.
- Default preset (signal blue): deep #002F5B · signal #007CFF · bright #00A1FF · ice #A0DAF7 · cyan #00F6FF · ink #121212 · gray-70 #707070 · gray-40 #C3C3C3 · line #E1E3E6 · paper #FFFFFF · warm #FCFCFA. Pastels: lilac #DFC8F5, pink #FFD1D4, green #B3F4A8, yellow #F4F9A7. Dark surfaces: base #0A1622, raised #101F30, sunken #060D16, text #F2F4F6.
- Spacing: base-8 scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Page margins clamp(24px, 6vw, 96px). Section rhythm 3–5× the in-component spacing (96–128px on desktop). Inconsistent section rhythm is a top slop tell.

### 3. Assign type roles — the triad
Exactly three faces, assigned by semantic role. Never a fourth without a named role.
1. **UI sans** — body, controls, product surfaces. Default Inter; free alternatives IBM Plex Sans, Public Sans, system-ui.
2. **Mono** — code, data, metrics, IDs, technical labels, timestamps, eyebrows/labels at 11–12px with tracking. Default Geist Mono; free alternatives JetBrains Mono, IBM Plex Mono, Space Mono.
3. **Editorial serif** — headlines, pull quotes, warmth moments, empty states. Default Sentient; free alternatives Source Serif 4, Newsreader, Lora, Instrument Serif.
- Serif headline + sans body = warmth-leaning. Sans headline + mono eyebrow = precision-leaning. Mono and serif never share a line. Numerals in data contexts are always mono with tabular figures.
- Scale (1.25 ratio on 16px): 12 / 14 / 16 / 20 / 28 / 40 / 56–96 (display only). Line-height 1.5–1.65 body, 1.1–1.2 headings, 1.0 display numerals. Measure 60–75 characters. Weights 400/500/600 only.

### 4. Choose the grid mode — per surface
- **Base grid** (dense, interactive: dashboards, forms, docs): 12 columns, base-8 gutters (24px), left-aligned, cards only when content is genuinely modular. Should feel invisible.
- **Expressive grid** (sparse, narrative: heroes, launch pages, empty states): deliberate asymmetry, oversized numerals, elements spanning unexpected column ranges, whitespace as structure. One oversized element per composition, not five.
- Declare the mode per section; a landing page typically alternates B (hero) → A (details) → B (closing). Never mix modes within one section.

### 5. Add texture, voice, motion
- **Texture:** one generative device — a quiet code-glyph matrix in the signal palette ("De-coding" texture), background-level only (opacity 0.03–0.08 light / 0.05–0.12 dark), aria-hidden, never behind body text. One texture device per product. Pure-CSS fallback: repeating inline-SVG glyph data-URI at 4–8% opacity.
- **Voice:** copy is a design token. Warm, plain, second-person ("you"), benefit-first, concrete metaphors, before→after framing, short sentences, no exclamation marks, no hype ("revolutionary", "supercharge", "seamless" — delete on sight). Empty states get the best copy. "Nothing here yet — ask your first question" beats "No results found".
- **Motion:** conversational micro-interactions — pulse/blink on interaction, instant feedback, 150–250ms ease transitions, one gentle "breathing" cue per screen max. No scroll-jacking, no parallax mazes, no theatrical reveals. Respect prefers-reduced-motion. Flat by default, glass by exception (sticky chrome and mobile overlays only).

### 6. Anti-slop review — run it before you finish
| Slop pattern | Corrective |
|---|---|
| Purple-blue gradient hero, gradient text | Flat warm-white or near-black surface; ONE signal color used flat |
| One sans for everything, mono nowhere | Enforce the 3-role type triad; give data/code to the mono |
| Emoji bullets and icon-per-line feature lists | Real sentences; mono or serif numerals as markers |
| Cookie-cutter hero: centered headline + subhead + two CTAs + screenshot | Expressive grid: asymmetry, oversized numeral, off-center composition |
| Glassmorphism on every card | Flat surfaces with 1px borders; blur only for sticky/fixed chrome |
| Centered-everything layouts | Left-align by default; center only deliberate expressive moments |
| Rainbow of accent colors | Signal-color budget: one hue, pastels only for categorization |
| Bento-grid-of-everything with equal-weight cards | Hierarchy through scale and whitespace |
| Generic stock 3D shapes / illustration packs | One generative texture device, repeated consistently |
| Hype copy | Benefit-first plain language, before→after framing, no exclamation marks |
| Gratuitous parallax / scroll-jacking | Motion as punctuation: pulse, blink, 150–250ms ease transitions |
| Charts dressed up with gradients and 3D | Gray context + one signal highlight; reduce ink, never distort |

## Quality bar
A passing design has: a stated axis commitment; exactly one signal color used sparingly; three typefaces with named roles; one grid mode per surface; texture that stays quiet; copy that reads like a person wrote it; zero anti-slop hits. After generating code, self-verify that every code comment matches actual behavior — delete any comment claiming a feature the code does not implement. If any element could be swapped into a random template without anyone noticing, redesign it.

*Adapted from the Minc Frontend Design Skill — MIT — github.com/morriszdweck/minc-frontend-design. Kimi trademarks belong to Moonshot AI.*`;

  /* Swatches for the Skill panel */
  const SWATCHES = [
    { name: "signal-deep", hex: "#002F5B" }, { name: "signal", hex: "#007CFF" },
    { name: "signal-bright", hex: "#00A1FF" }, { name: "signal-ice", hex: "#A0DAF7" },
    { name: "signal-cyan", hex: "#00F6FF" }, { name: "ink", hex: "#121212" },
    { name: "gray-70", hex: "#707070" }, { name: "paper-warm", hex: "#FCFCFA" },
    { name: "pastel-lilac", hex: "#DFC8F5" }, { name: "pastel-pink", hex: "#FFD1D4" },
    { name: "pastel-green", hex: "#B3F4A8" }, { name: "pastel-yellow", hex: "#F4F9A7" }
  ];

  const STEPS = [
    { n: "01", title: "Commit to a direction", body: "Place the project on the precision ↔ warmth axis in one sentence. Most products sit at 60/40, never 50/50 — the choice is what kills slop." },
    { n: "02", title: "Set the token architecture", body: "A 5-step neutral ramp, ONE signal color family and 3–4 pastel accents. Signal carries attention; pastels categorize. Dark mode is a token remap, never ad-hoc overrides." },
    { n: "03", title: "Assign type roles", body: "Exactly three faces: UI sans for body, mono for data, editorial serif for warmth. Serif + sans = warmth; sans + mono eyebrow = precision." },
    { n: "04", title: "Choose the grid mode", body: "Base grid for dense product UI, expressive grid for visual-first moments. Declare the mode per section; alternate them deliberately." },
    { n: "05", title: "Add texture, voice, motion", body: "One quiet generative texture, copy that sounds human, motion as punctuation — pulse, blink, 150–250ms ease. Flat by default, glass by exception." },
    { n: "06", title: "Anti-slop review", body: "Run the checklist before finishing: one signal color, three type roles, a declared grid, quiet texture, human voice, zero slop hits." }
  ];

  window.Vecode = window.Vecode || {};
  window.Vecode.Skill = { SKILL_MD, SWATCHES, STEPS };
})();
