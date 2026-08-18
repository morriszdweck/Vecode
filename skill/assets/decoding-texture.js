/**
 * decoding-texture.js — dependency-free generative code-glyph matrix.
 * Renders a quiet "De-coding" background texture: code-glyphs resolving
 * into a subtle pixel field, drawn from your own signal palette.
 *
 * Usage (one line):
 *   decodingTexture(document.querySelector('#hero'));
 *
 * Or with options:
 *   decodingTexture(el, { opacity: 0.06, cell: 18, glyphs: '▲✳#●[]+=', animated: true });
 *
 * Rules: keep opacity low (0.03–0.08 light / 0.05–0.12 dark), never place
 * behind body text, one texture device per product.
 */
function decodingTexture(container, options) {
  const opts = Object.assign(
    {
      glyphs: "▲✳#●[]+=/<>{}",
      colors: ["#007CFF", "#00A1FF", "#121212", "#002F5B", "#00F6FF"],
      pastelColors: ["#DFC8F5", "#B3F4A8"],
      pastelRatio: 0.1, // fraction of cells allowed to use pastels
      opacity: 0.06,
      cell: 18, // px per glyph cell
      fillRatio: 0.55, // fraction of cells that contain a glyph
      animated: false, // gentle glyph blinking; respects reduced motion
      blinkInterval: 900, // ms between blink waves when animated
      blinkCount: 6 // glyphs changed per blink wave
    },
    options || {}
  );

  if (!container) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    opacity: String(opts.opacity),
    pointerEvents: "none",
    zIndex: "0"
  });

  const computed = getComputedStyle(container);
  if (computed.position === "static") container.style.position = "relative";
  container.prepend(canvas);

  let cols = 0;
  let rows = 0;
  let cells = [];

  const glyphs = Array.from(opts.glyphs);

  function randomGlyph() {
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }

  function randomColor() {
    if (Math.random() < opts.pastelRatio) {
      return opts.pastelColors[Math.floor(Math.random() * opts.pastelColors.length)];
    }
    return opts.colors[Math.floor(Math.random() * opts.colors.length)];
  }

  function buildGrid() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(rect.width / opts.cell);
    rows = Math.ceil(rect.height / opts.cell);
    cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        cells.push(
          Math.random() < opts.fillRatio
            ? { x, y, glyph: randomGlyph(), color: randomColor() }
            : null
        );
      }
    }
  }

  function draw() {
    const rect = container.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = Math.round(opts.cell * 0.62) + "px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const cell of cells) {
      if (!cell) continue;
      ctx.fillStyle = cell.color;
      ctx.fillText(
        cell.glyph,
        cell.x * opts.cell + opts.cell / 2,
        cell.y * opts.cell + opts.cell / 2
      );
    }
  }

  function blinkWave() {
    for (let i = 0; i < opts.blinkCount; i++) {
      const idx = Math.floor(Math.random() * cells.length);
      if (cells[idx]) {
        cells[idx] = { x: cells[idx].x, y: cells[idx].y, glyph: randomGlyph(), color: randomColor() };
      }
    }
    draw();
  }

  buildGrid();
  draw();

  const onResize = () => {
    buildGrid();
    draw();
  };
  window.addEventListener("resize", onResize);

  let timer = null;
  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (opts.animated && !reducedMotion) {
    timer = setInterval(blinkWave, opts.blinkInterval);
  }

  // Return a handle so callers can tear down.
  return {
    canvas,
    redraw: draw,
    destroy() {
      window.removeEventListener("resize", onResize);
      if (timer) clearInterval(timer);
      canvas.remove();
    }
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = decodingTexture;
}
