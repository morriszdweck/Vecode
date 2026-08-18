# Voice, Texture & Motion

Load this when writing UI copy, adding background texture, or implementing animation.

## UI copy tone

Voice is a design token — codify it and apply it as strictly as color.

### Rules

- **Warm and plain, second-person.** Talk to "you", never "users" or "the user".
- **Benefit-first, feature-second.** Lead with the human outcome; the mechanism follows.
  - ✗ "Our sidebar uses persistent indexed history storage."
  - ✓ "Every conversation stays in plain sight — pick up where you left off."
- **Concrete metaphors over jargon.** "As easy to browse as a bookshelf," not "intuitive information architecture."
- **Before→after framing** for change stories: "From waiting to staying ahead." "From digging through folders to opening one shelf."
- **Short sentences.** Em-dashes for pivots. No exclamation marks, no hype adjectives ("revolutionary", "supercharge", "seamless" — delete on sight).
- **Personification with restraint.** The product may be "a companion who just gets it" — never cutesy, never exclamation-pointed.
- **Empty states and errors get the best copy.** They are the moments the user is most alone. "Nothing here yet — ask your first question" beats "No results found."

### Quick rewrite test

Read any screen's copy aloud. If it sounds like a press release or a changelog, rewrite it benefit-first. Rewriting one screen's copy in this voice makes the whole product feel redesigned.

## The De-coding texture

### Concept

One generative visual device per product: a field of code-glyphs (characters like `▲ ✳ # ● [ ] + =`) rendered in the signal palette on a near-invisible background — code resolving into image. It replaces stock illustration and can never look generic because it is generated from the project's own tokens.

### Implementation

- A dependency-free canvas implementation ships at `assets/decoding-texture.js` — mount it with one line (see its header comment) and configure glyphs, opacity, cell size, and colors.
- Pure-CSS fallback: a repeating background of glyphs via an inline SVG data-URI at 4–8% opacity.

### Usage rules (non-negotiable)

- **Quiet and background-level only.** Opacity 0.03–0.08 on light surfaces, 0.05–0.12 on dark. If a visitor consciously notices the texture before the content, it is too loud.
- **Placement is precise.** Allowed behind display/hero type and large numerals (56px+) at opacity ≤0.08. Forbidden behind paragraph/body columns and data tables. Elsewhere, place it in empty states, section gutters, footers — anywhere extended reading is not the primary task. If it must sit near body text, mask or fade it under the text block.
- **Always decorative-only in the DOM:** `aria-hidden="true"` and `pointer-events: none`.
- **One texture device per product.** Do not mix glyph matrices with gradient blobs and noise overlays.
- Prefer glyphs from the signal-color family; pastels may appear at ≤10% of cells.

## Motion principles

The interface should feel **alive, not animated** — motion is conversational punctuation.

- **Micro-feedback on interaction:** icons pulse or blink on hover/click; buttons respond within 100ms; toggles ease 150–250ms.
- **Idle liveliness (rare):** one gentle "breathing" cue per screen max — a soft pulsing status dot, a blinking cursor. Never five things breathing at once.
- **No theatrical scroll-jacking.** No hijacked scroll, no parallax mazes, no full-screen pinned reveals. Content appears with simple 200–300ms fade/translate on entry, and only once.
- **Flat by default, glass by exception:** surfaces are flat with 1px borders. Backdrop blur is permitted ONLY for sticky/fixed chrome (nav, command bars) and mobile overlays — never as decorative card styling.
- **Respect `prefers-reduced-motion`:** disable texture animation and non-essential transitions under it.

## Data-viz rules

- Minimalism and reduction: remove gridlines, borders, and legends until the chart still reads — then stop.
- **Never mislead:** no truncated axes without labeling, no 3D, no dual-axis tricks, no decorative distortion.
- Neutrals carry the chart; the single signal color marks what matters (see `references/design-tokens.md` §Data-viz).
