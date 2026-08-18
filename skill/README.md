# Minc Frontend Design Skill

A general-purpose frontend design skill for coding agents. It turns the design philosophy of *scientific humanism* — precision and warmth held in deliberate tension — into a repeatable workflow any agent can apply to any web UI: landing pages, dashboards, SaaS apps, portfolios, admin panels.

The skill's job is to stop generic AI-slop output (purple-blue gradients, Inter-everything, emoji bullets, cookie-cutter centered heroes, glassmorphism abuse) and replace it with committed, intentional design: one signal color, three typefaces with named roles, two grid modes chosen deliberately, a quiet generative texture, and copy that sounds human.

## What you get

- A six-step design workflow: commit to a direction on the precision ↔ warmth axis → set tokens → assign type roles → pick a grid mode → add texture/voice/motion → anti-slop review.
- A ready-to-use token preset (neutral ramp + signal-blue family + pastels) as CSS custom properties, with light and dark themes.
- A dependency-free canvas script that renders a subtle generative code-glyph matrix background texture.
- Three reference documents covering tokens, typography/grid, and voice/texture/motion in depth (progressive disclosure — loaded only when needed).
- An opinionated anti-slop checklist with correctives for the most common AI-generated design failures.

## Install

- **As a skills folder:** drop `minc-frontend-design/` into your agent's skills directory (e.g. `.claude/skills/`, or the equivalent for your agent runtime). The agent picks it up from `SKILL.md`'s frontmatter description.
- **As a `.skill` package:** zip the folder contents so `SKILL.md` sits at the archive root and import it with your runtime's skill installer.

No dependencies, no build step. The CSS and JS assets are optional ready-to-use implementations of the defaults.

## Quick start

1. State the project's direction in one sentence (e.g. "precision-leaning developer dashboard" or "warmth-leaning editorial portfolio").
2. Import `assets/tokens.css` for the default preset, or use `references/design-tokens.md` to define a custom signal family.
3. Load fonts per `references/typography-and-grid.md` (Inter + Geist Mono + Sentient, or the free alternatives listed).
4. Mount the texture where appropriate:

```js
decodingTexture(document.querySelector('#hero'), { opacity: 0.06 });
```

5. Before shipping, run the anti-slop review table in `SKILL.md` against every page.

## File map

```
minc-frontend-design/
├── SKILL.md                          # Workflow, quality bar, anti-slop review, reference map
├── references/
│   ├── design-tokens.md              # Token architecture, dark mode, spacing math, contrast
│   ├── typography-and-grid.md        # 3-role type system, type scale, base vs expressive grid
│   └── voice-texture-motion.md       # UI copy rules, De-coding texture, motion, data-viz
├── assets/
│   ├── tokens.css                    # Default preset as CSS custom properties (light + dark)
│   └── decoding-texture.js           # Dependency-free generative glyph-matrix canvas texture
└── README.md
```

## Credit

Author: **Minc** (https://github.com/morriszdweck). Inspired by the **Kimi Visual Identity System** (kimi.ai/resources/kimi-brand) — specifically its transferable principles, generalized here into a brand-agnostic method. This skill never instructs anyone to copy Kimi's actual identity, logo, or artwork.

## License

MIT. Kimi trademarks, logos, and brand assets are the exclusive property of **Moonshot AI** and are not included in this skill; the Kimi-inspired hex values are provided as an adaptable starting preset, not a brand kit.
