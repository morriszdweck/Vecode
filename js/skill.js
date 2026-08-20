/* ==========================================================================
   Vecode — skill.js · Vecode Design Skill (v3 rebuild)
   Scientific humanism — precision + warmth. Ground-up rewrite keeps the
   exact design language but removes redundancy and tightens wording.
   ========================================================================== */
(function () {
  "use strict";

  const SKILL_MD = `# Vecode Design Skill

A frontend design skill for the Vecode agent, adapted from the Minc Frontend Design Skill (github.com/morriszdweck/minc-frontend-design) and inspired by the Kimi Visual Identity System — *scientific humanism*: precision and warmth held in deliberate tension.

The skill replaces generic AI slop (purple gradients, Inter-everything, emoji bullets, centered heroes, glassmorphism abuse) with intentional design: one signal color, three type roles, a deliberate grid, a quiet generative texture, and copy that sounds human.

## Workflow — six steps, in order, for every build

### 1. Commit to a direction
Place the project on the **precision ↔ warmth** axis in one sentence.
- **Precision** (devtools, dashboards, infra): strict grid, mono-forward, cool neutrals, restrained motion.
- **Warmth** (editorial, portfolio, consumer): expressive grid, serif headlines, warm whites, generous whitespace.
- Most products sit at 60/40, never 50/50. Pick the leading pole; the other enters only as contrast.

### 2. Set the token architecture
Palette: 5-step neutral ramp + ONE signal family + 3–4 pastel accents.
- Signal is a budget — one saturated hue for all CTAs, active states, focus rings, key metrics. If >5% of pixels use it, pull back.
- Pastels categorize only (tags, soft fills), low-saturation, never for CTAs. The two budgets never compete.
- Warm white (#FCFCFA) over cold gray (#F5F5F5) for light surfaces.
- Dark mode is a token remap, never ad-hoc overrides.
- Preset (signal blue): deep #002F5B · signal #007CFF · bright #00A1FF · ice #A0DAF7 · cyan #00F6FF · ink #121212 · gray-70 #707070 · gray-40 #C3C3C3 · line #E1E3E6 · paper #FFFFFF · warm #FCFCFA. Pastels: lilac #DFC8F5, pink #FFD1D4, green #B3F4A8, yellow #F4F9A7. Dark: base #0A1622, raised #101F30, sunken #060D16, text #F2F4F6.
- Spacing: base-8 (4,8,12,16,24,32,48,64,96,128). Margins clamp(24px,6vw,96px). Section rhythm 96–128px desktop.

### 3. Assign type roles — the triad
Exactly three faces, never a fourth without a named role.
1. **UI sans** — body, controls, surfaces. Inter (alt: Public Sans, IBM Plex Sans).
2. **Mono** — code, data, metrics, IDs, eyebrows (11–12px, tracked). Geist Mono / JetBrains Mono / IBM Plex Mono.
3. **Editorial serif** — headlines, pull quotes, empty states. Source Serif 4 / Newsreader / Lora.
- Serif headline + sans body = warmth. Sans headline + mono eyebrow = precision. Mono and serif never share a line. Numerals in data contexts are mono tabular.

### 4. Choose the grid mode — per surface
- **Base grid** (dense: dashboards, docs): 12 columns, 24px gutters, left-aligned, cards only when genuinely modular.
- **Expressive grid** (sparse: heroes, launches): asymmetry, oversized numerals, unexpected spans, whitespace as structure. One oversized element per composition.
- Declare mode per section. Never mix within one section.

### 5. Add texture, voice, motion
- **Texture:** one quiet device — code-glyph matrix in signal palette (opacity 0.03–0.08 light / 0.05–0.12 dark), aria-hidden, never behind body copy. One device per product.
- **Voice:** copy is a design token. Warm, plain, second-person, benefit-first, concrete, short sentences, no exclamation marks, no hype ("revolutionary", "seamless" — delete). Empty states get best copy.
- **Motion:** pulse/blink, 150–250ms ease, one breathing cue max, no scroll-jacking, respects prefers-reduced-motion. Flat by default, glass only for sticky chrome.

### 6. Anti-slop review — run before finish
| Slop pattern | Corrective |
|---|---|
| Purple-blue gradient hero | Flat warm-white or near-black; one signal color flat |
| One sans for everything | Enforce 3-role triad; mono for data |
| Emoji bullets | Real sentences; mono/serif numerals as markers |
| Centered headline + 2 CTAs + screenshot | Expressive grid: asymmetry, oversized numeral, off-center |
| Glassmorphism everywhere | Flat 1px borders; blur only for sticky chrome |
| Centered everything | Left-align by default; center only as expressive moment |
| Rainbow accents | One signal hue; pastels only for categorization |
| Equal-weight bento grid | Hierarchy via scale and whitespace |
| Stock 3D shapes | One generative texture, repeated |
| Hype copy | Plain, benefit-first, no exclamation marks |
| Parallax / scroll-jack | Motion as punctuation only |
| Gradient 3D charts | Gray context + one signal highlight |

## Quality bar
Passing design: stated axis commitment, one signal color, three type roles, one grid per surface, quiet texture, human voice, zero anti-slop hits. Comments must match code — delete any claiming unbuilt features. If an element could be swapped into a random template unnoticed, redesign it.

*Adapted from the Minc Frontend Design Skill — MIT — github.com/morriszdweck/minc-frontend-design. Kimi trademarks belong to Moonshot AI.*`;

  const SWATCHES = [
    { name: "signal-deep", hex: "#002F5B" }, { name: "signal", hex: "#007CFF" },
    { name: "signal-bright", hex: "#00A1FF" }, { name: "signal-ice", hex: "#A0DAF7" },
    { name: "signal-cyan", hex: "#00F6FF" }, { name: "ink", hex: "#121212" },
    { name: "gray-70", hex: "#707070" }, { name: "paper-warm", hex: "#FCFCFA" },
    { name: "pastel-lilac", hex: "#DFC8F5" }, { name: "pastel-pink", hex: "#FFD1D4" },
    { name: "pastel-green", hex: "#B3F4A8" }, { name: "pastel-yellow", hex: "#F4F9A7" }
  ];

  const STEPS = [
    { n: "01", title: "Commit to a direction", body: "Place the project on the precision ↔ warmth axis in one sentence. 60/40, never 50/50 — the choice kills slop." },
    { n: "02", title: "Set the token architecture", body: "5-step neutral ramp, one signal family, 3–4 pastels. Signal carries attention; pastels categorize. Dark mode is a token remap." },
    { n: "03", title: "Assign type roles", body: "Three faces: UI sans for body, mono for data, serif for warmth. Serif+sans = warmth; sans+mono = precision." },
    { n: "04", title: "Choose the grid mode", body: "Base grid for dense UI, expressive grid for narrative moments. Declare per section; alternate deliberately." },
    { n: "05", title: "Add texture, voice, motion", body: "One quiet texture, human copy, motion as punctuation — 150–250ms ease, respects reduced motion." },
    { n: "06", title: "Anti-slop review", body: "Run the checklist before finishing: one signal, three roles, a declared grid, quiet texture, human voice, zero slop." }
  ];

  window.Vecode = window.Vecode || {};
  window.Vecode.Skill = { SKILL_MD, SWATCHES, STEPS };
})();
