---
name: minc-frontend-design
description: Design system guidance for building distinctive, intentional frontend UIs. Use whenever building or redesigning any web UI — landing pages, marketing sites, dashboards, SaaS apps, portfolios, admin panels, or component libraries — and whenever output risks looking like generic AI-generated slop (purple gradients, Inter-everything, cookie-cutter heroes). Applies a scientific-humanism design philosophy (precision + warmth held in tension) with a ready-to-use token preset, 3-role typography, two-mode grid, generative texture, and voice rules.
---

# Minc Frontend Design

## Overview

Produce frontend designs that feel intentionally art-directed instead of AI-default. The method: commit to one strong direction per project on the **precision ↔ warmth** axis, then execute it with disciplined tokens, role-based type, a deliberate grid mode, quiet texture, and human voice. A complete default preset ships in `assets/tokens.css` — use it as-is or as a template for a custom palette.

## Workflow

Follow these six steps in order for every project. Do not skip step 1 — an uncommitted direction is how slop happens.

### 1. Commit to a direction

Place the project on the precision ↔ warmth axis and write the commitment down in one sentence:

- **Precision pole** (developer tools, dashboards, infra, fintech): strict grid, mono-forward, cool neutrals, restrained motion.
- **Warmth pole** (editorial, portfolio, consumer, storytelling): expressive grid, serif headlines, warm whites, generous whitespace.
- **Most products sit at 60/40, never 50/50.** Pick which pole leads; the other pole enters as contrast moments only.

Every later decision answers to this commitment. If a choice fits neither pole, cut it.

### 2. Set the token architecture

Read **references/design-tokens.md**. Palette shape is fixed: a 5-step neutral ramp + ONE signal color family + 3–4 pastel accents. The Kimi-inspired blue preset (`#002F5B` / `#007CFF` / `#00A1FF` / `#A0DAF7` / `#00F6FF`) ships ready-to-use in **assets/tokens.css** — import it directly or swap the signal family for the project's own hue. Hard rules:

- **Signal color is a budget.** Exactly one saturated hue carries all attention and actions — primary CTAs, active states, alerts, focus rings, key metrics. Neutrals do 90% of the work.
- **Pastel accents are a separate budget.** Categorization only (tags, soft fills), always low-saturation — never CTAs, alerts, or focus states. The two budgets never compete in the same component.
- **Warm white beats cold gray** for light surfaces.
- Define dark mode as a token remap, never ad-hoc overrides.

### 3. Assign type roles

Read **references/typography-and-grid.md**. Exactly three faces, chosen by semantic role:

1. **UI sans** (Inter by default) — body, controls, product surfaces.
2. **Mono** (Geist Mono) — code, data, metrics, technical labels.
3. **Editorial serif** (Sentient) — headlines and emotional/warmth moments.

Never add a fourth face without a named role. Type scale and pairing rules are in the reference.

### 4. Choose the grid mode

Read **references/typography-and-grid.md** §Grid. Two modes, chosen per surface by content density:

- **Base grid** — strict base-8 spacing math, fixed columns, for product UI (dashboards, forms, app screens). This is the consistency layer.
- **Expressive grid** — loose editorial composition (asymmetry, oversized numerals, big whitespace) for low-text visual-first moments (heroes, empty states, launch pages).

Switching modes mid-surface is slop. Declare the mode per page/section.

### 5. Add texture, voice, motion

Read **references/voice-texture-motion.md**.

- **Texture:** one generative code-glyph/pixel matrix (ship `assets/decoding-texture.js` or adapt it) as a *quiet background only* — low opacity, never behind body text, never stock illustration.
- **Voice:** copy is a design token. Warm, plain, second-person, benefit-first, concrete metaphors, before→after framing, short sentences, no hype, no exclamation marks.
- **Motion:** conversational micro-interactions — subtle pulses/blinks on interaction, instant feedback. No scroll-jacking, no theatrical reveals. Data-viz stays minimal and never misleading.

### 6. Anti-slop review

Before shipping, check the build against this list. Each entry is a failure mode and its corrective:

| Slop pattern | Corrective |
|---|---|
| Purple-blue gradient hero, gradient text | Flat warm-white or near-black surface; ONE signal color used flat |
| Inter (or one sans) for everything, mono nowhere | Enforce the 3-role type triad; give data/code to the mono |
| Emoji bullets and icon-per-line feature lists | Real sentences; mono or serif numerals as markers |
| Cookie-cutter hero: centered headline + subhead + two CTAs + screenshot | Commit to the expressive grid: asymmetry, oversized numeral, off-center composition |
| Glassmorphism on every card | Flat surfaces with 1px borders by default; backdrop blur only for sticky/fixed chrome (nav, command bars) and mobile overlays |
| Centered-everything layouts | Left-align by default on the base grid; center only deliberate expressive moments |
| Rainbow of accent colors competing | Signal-color budget: one hue, pastels only for categorization |
| Bento-grid-of-everything with equal-weight cards | Hierarchy through scale and whitespace, not 12 identical tiles |
| Generic stock 3D shapes / illustration packs | One generative texture device, repeated consistently |
| Hype copy ("Supercharge your workflow!") | Benefit-first plain language, before→after framing, no exclamation marks |
| Gratuitous parallax / scroll-jacking | Motion as punctuation: pulse, blink, 150–250ms ease transitions |
| Charts dressed up with gradients and 3D | Gray context + one signal highlight; reduce ink, never distort |

## Reference map

Load these only when the workflow step calls for them:

- **references/design-tokens.md** — full token architecture: neutral ramp, signal-blue preset, pastels, semantic roles, dark-mode mapping, spacing math, contrast pairings. Load at step 2.
- **references/typography-and-grid.md** — 3-role type system, scale, pairing rules, base vs expressive grid. Load at steps 3–4.
- **references/voice-texture-motion.md** — UI copy rules with examples, De-coding texture implementation (CSS/JS/canvas), motion principles, data-viz rules. Load at step 5.

Ready-to-use assets:

- **assets/tokens.css** — the default preset as CSS custom properties (light + dark, spacing scale, type roles). Import as-is.
- **assets/decoding-texture.js** — dependency-free canvas code-glyph matrix. One line to mount; configurable glyphs, opacity, cell size.

## Quality bar

A passing design has: a stated axis commitment; exactly one signal color used sparingly; three typefaces with named roles; one grid mode per surface; texture that stays quiet and background-level; copy that reads like a person wrote it; and zero anti-slop hits. After generating code, self-verify that every code comment matches actual behavior — delete or fix any comment claiming a feature the code does not implement. If any element could be swapped into a random template without anyone noticing, redesign it.

---
*Author: Minc (github.com/morriszdweck), inspired by the Kimi Visual Identity System (kimi.ai/resources/kimi-brand). Kimi trademarks and brand assets belong to Moonshot AI and are not included here — this skill generalizes the design principles only.*
