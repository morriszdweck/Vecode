# Typography & Grid — 3-Role Type System, Two Grid Modes

Load this when choosing fonts, setting a type scale, or laying out pages.

## The type triad

Exactly three typefaces, assigned by **semantic role** — never by taste, never more than three without a named role.

| Role | Default | Free alternatives | Owns |
|---|---|---|---|
| **UI sans** | Inter | IBM Plex Sans, Public Sans, system-ui stack | Body copy, controls, nav, forms, product surfaces |
| **Mono** | Geist Mono | JetBrains Mono, IBM Plex Mono, Space Mono | Code, data, metrics, IDs, technical labels, timestamps |
| **Editorial serif** | Sentient | Source Serif 4, Newsreader, Lora, Instrument Serif | Headlines, pull quotes, emotional/warmth moments, empty states |

Why a triad works: the sans carries efficiency, the mono carries precision/trust, the serif carries warmth. That pairing IS the scientific-humanism tension expressed in type. A fourth face dilutes the signal.

### Role rules

- UI sans is the default for anything a user reads or clicks in product UI.
- Mono is for anything *verifiable*: numbers, code, metrics, keys. Setting a dashboard metric in mono instantly reads as precise. Mono also works for eyebrows/labels (`OVERVIEW — 01`) at 11–12px with tracking.
- Serif appears ONLY at warmth moments: hero headline, editorial sections, empty-state voice. If the serif shows up in a settings form, the role system has failed.
- Never set long body text in mono or serif.

## Scale guidance

A compact scale covers nearly every project (1.25 ratio on a 16px base):

```
12px  — mono labels, captions, table metadata
14px  — dense UI text, secondary body (dashboards)
16px  — base body
20px  — lead paragraphs, section intros
28px  — section headings (serif or sans semibold)
40px  — page titles (serif on warmth-leaning surfaces)
56–96px — expressive-grid display only (heroes, numerals)
```

- Line-height: 1.5–1.65 body, 1.1–1.2 headings, 1.0 for display numerals.
- Measure: 60–75 characters for body columns. Full-width paragraphs are slop.
- Weight range: stay within 400/500/600. Bold-everything flattens hierarchy.

## Pairing rules

- Serif headline + sans body is the default warmth-leaning composition.
- Sans headline + mono eyebrow is the default precision-leaning composition.
- Mono and serif never share a line.
- Numerals in data contexts are always mono with tabular figures (`font-variant-numeric: tabular-nums`).

## The two grid modes

### Mode A — Base grid (product UI)

Use for: dashboards, apps, forms, settings, admin, any text-dense screen.

- 12 columns, gutters on the base-8 scale (24px desktop), margins via `clamp(24px, 6vw, 96px)`.
- All spacing from the base-8 scale — no arbitrary pixel values.
- Left-aligned content, single dominant column for reading flows, cards only when content is genuinely modular.
- Goal: cross-platform consistency. This mode should feel invisible.

### Mode B — Expressive grid (visual-first)

Use for: heroes, landing pages, launch pages, empty states, about/story sections — low-text, visual-first moments.

- Break the base grid deliberately: asymmetric text+image blocks, elements spanning unexpected column ranges, oversized numerals and pagination markers (`01 / 05`), generous whitespace as a compositional element.
- Display type at 56–96px; one oversized element per composition, not five.
- Whitespace is the structure — if an expressive layout feels empty, enlarge the anchor element before adding content.

### Choosing and switching

- Choose per surface by **content density**: dense + interactive → Mode A; sparse + narrative → Mode B.
- A marketing landing page typically alternates: B (hero) → A (feature details) → B (closing). The alternation itself creates rhythm.
- Never mix modes within one section. An asymmetric hero that collapses into centered-everything below the fold is the most common AI-slop failure.
