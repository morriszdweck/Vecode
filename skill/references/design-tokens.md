# Design Tokens — Architecture and Default Preset

Load this when setting up color, spacing, and theming for a project. The architecture is fixed; the hues are adaptable. A ready-to-import implementation of the default preset lives in `assets/tokens.css`.

## Architecture

Every palette in this system has the same four layers:

1. **Neutral ramp (5 steps)** — carries ~90% of the UI: surfaces, text, borders.
2. **Signal color family (5 steps)** — ONE saturated hue with tints/shades. Carries *meaning*, not decoration.
3. **Pastel accents (3–4)** — soft humanist counterpoints for categorization and warmth moments.
4. **Semantic roles** — tokens are referenced by role (`surface`, `text`, `border`, `signal`), never by raw hex, so themes remap cleanly.

Hierarchy, stated once: exactly ONE saturated signal hue carries attention and actions; pastel accents are categorization-only and always low-saturation. These are two separate budgets — they never compete inside the same component.

## Default preset (Kimi-inspired signal blue)

Use as-is, or treat as a template and swap the signal family for the project's own hue.

### Signal family

| Token | Hex | Role |
|---|---|---|
| `signal-deep` | `#002F5B` | Deep anchor — dark-mode surfaces, footer, dense headers |
| `signal` | `#007CFF` | The one signal color — primary actions, active states, key metrics |
| `signal-bright` | `#00A1FF` | Hover states, secondary highlights, chart accents |
| `signal-ice` | `#A0DAF7` | Washes, selected-row backgrounds, subtle fills |
| `signal-cyan` | `#00F6FF` | Rare spark — generative texture glyphs, tiny focus pings only |

### Neutral ramp

| Token | Hex | Role |
|---|---|---|
| `ink` | `#121212` | Primary text, dark surfaces |
| `gray-70` | `#707070` | Secondary text, captions, muted labels |
| `gray-40` | `#C3C3C3` | Disabled text, decorative marks |
| `surface-line` | `#E1E3E6` | Borders, dividers, hairlines |
| `paper` | `#FFFFFF` | Base surface (warm-white variants allowed: `#FCFCFA` reads more human) |

Supporting quiet gray: `#8D9390` for secondary chrome that must sit between text and border weight.

### Pastel accents

| Token | Hex | Use |
|---|---|---|
| `pastel-lilac` | `#DFC8F5` | Category/tag fills, warmth moments |
| `pastel-pink` | `#FFD1D4` | Same — never for errors (reserve red for that) |
| `pastel-green` | `#B3F4A8` | Same — acceptable as a soft success tint |
| `pastel-yellow` | `#F4F9A7` | Highlights, annotation fills |

Pastels are fills and tags at low visual weight — never headlines, never primary buttons, never CTAs, alerts, or focus states. Those belong to the signal family alone.

## Semantic roles

Map every raw token into roles before writing components:

```
surface-base, surface-raised, surface-sunken   → neutral ramp
text-primary, text-secondary, text-disabled    → neutral ramp
border-default, border-strong                  → neutral ramp
signal, signal-hover, signal-wash, signal-text → signal family
accent-{1..4}                                  → pastels
```

Components consume roles only. This is what makes dark mode a remap instead of a rewrite.

## Dark-mode mapping

Dark mode is NOT inverted light mode. Rules:

- `surface-base` → `signal-deep`-adjacent dark (`#0A1622` or `#121212`), never pure black.
- `text-primary` → `#F2F4F6` (soft white, not `#FFFFFF`).
- `signal` stays `#007CFF` or brightens to `#00A1FF` to hold contrast on dark.
- `signal-ice` washes become translucent overlays (`rgba(0,124,255,0.12)`).
- Pastels desaturate ~20% and darken to stay quiet.
- Implement via `[data-theme="dark"]` or `prefers-color-scheme` — both are wired in `assets/tokens.css`.

## Spacing math

- **Base-8 scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. The 4 exists for icon gaps and fine nudges only; layout rhythm lives on 8-multiples.
- **Grid margins as percentages:** page margins scale with viewport — e.g. `clamp(24px, 6vw, 96px)` — so density feels intentional at every width.
- **Section rhythm:** vertical spacing between major sections is 3–5× the base unit of in-component spacing (96–128px on desktop). Inconsistent section rhythm is a top slop tell.

## Signal-color budget rule

One signal hue per product. It may appear as: primary buttons, active nav/tab states, focus rings, key metric values, links, alerts. It may NOT appear as: backgrounds of large regions, decorative shapes, multiple competing tints in one view. If a screen uses the signal in more than ~5% of its pixels, it is decoration — pull it back to neutrals. Anything interactive or attention-demanding is signal or neutral — never pastel.

## Accessibility contrast pairings

Approved pairs (WCAG AA verified for normal text unless noted):

- `#121212` on `#FFFFFF` — 17.7:1, primary body text.
- `#707070` on `#FFFFFF` — 4.9:1, secondary text (AA pass; do not go lighter for text).
- `#FFFFFF` on `#007CFF` — 4.0:1, large text/bold UI labels on signal buttons (AA large; keep button labels ≥16px semibold or 18px).
- `#002F5B` on `#A0DAF7` — 7.6:1, deep text on ice wash.
- `#121212` on any pastel — all pastels exceed 10:1.
- `#FFFFFF` on `#002F5B` — 13.6:1, footer/dark headers.
- Never: `#A0DAF7` or `#00F6FF` as text on white; pastels as text anywhere; `gray-40` for meaningful text.

## Data-viz color rule

Charts render in neutrals; the one signal color marks what matters.

- Gray (`gray-70`, `surface-line`) carries axes, context series, and gridlines — reduce gridlines until the chart still reads, then stop.
- The signal hue (`#007CFF` / `#00A1FF`) highlights the single series, bar, or threshold the viewer must act on. One highlight per chart.
- Pastels may distinguish secondary categories at low weight — never as the primary data encoding.
- Never: gradient-filled bars, 3D charts, dual-axis tricks, or truncated axes without labeling. Data-viz informs; it never decorates or distorts.
