/* ==========================================================================
   Vecode — plugins.js · plugin registry
   Each plugin contributes:
     · prompt        — instructions appended to the agent's system prompt
     · reviewItems   — extra anti-slop review checklist entries
     · inject(files) — a file-level hook run when the plugin is enabled
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Typography presets (3-role type, per the design skill) ---------- */
  const TYPOGRAPHY_PRESETS = {
    warmth: {
      name: "Warmth", desc: "Serif headlines + sans body + mono data",
      ui: "Inter", mono: "JetBrains Mono", serif: "Source Serif 4",
      css: '--font-ui: "Inter", system-ui, sans-serif;\n  --font-mono: "JetBrains Mono", ui-monospace, monospace;\n  --font-editorial: "Source Serif 4", Georgia, serif;',
      weights: "Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400"
    },
    precision: {
      name: "Precision", desc: "Sans headlines, mono eyebrows, cool & strict",
      ui: "Inter", mono: "IBM Plex Mono", serif: "Lora",
      css: '--font-ui: "Inter", system-ui, sans-serif;\n  --font-mono: "IBM Plex Mono", ui-monospace, monospace;\n  --font-editorial: "Lora", Georgia, serif;',
      weights: "Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400"
    },
    editorial: {
      name: "Editorial", desc: "Newsreader headlines for storytelling",
      ui: "Inter", mono: "Space Mono", serif: "Newsreader",
      css: '--font-ui: "Inter", system-ui, sans-serif;\n  --font-mono: "Space Mono", ui-monospace, monospace;\n  --font-editorial: "Newsreader", Georgia, serif;',
      weights: "Inter:wght@400;500;600&family=Space+Mono:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400"
    },
    humanist: {
      name: "Humanist", desc: "Soft, round, approachable",
      ui: "Public Sans", mono: "IBM Plex Mono", serif: "Lora",
      css: '--font-ui: "Public Sans", system-ui, sans-serif;\n  --font-mono: "IBM Plex Mono", ui-monospace, monospace;\n  --font-editorial: "Lora", Georgia, serif;',
      weights: "Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400"
    }
  };

  /* ---------- icons (16px inline SVGs) ---------- */
  const ICONS = {
    typography: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3 12.5 6.5 3h3L13 12.5"/><path d="M4.5 9h7"/><path d="M2 3h5M9 3h5" opacity=".5"/></svg>',
    darkmode: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"/></svg>',
    motion: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5 9.7 6.3 14.5 8 9.7 9.7 8 14.5 6.3 9.7 1.5 8 6.3 6.3Z"/></svg>',
    forms: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1.5" y="3" width="13" height="10" rx="2"/><path d="M1.5 6h13M4.5 9.5h4"/></svg>',
    seo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/><path d="M4 7h6M7 4v6" opacity=".55"/></svg>',
    analytics: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 13.5h12"/><rect x="3" y="8.5" width="2.4" height="5" rx=".6"/><rect x="6.8" y="5.5" width="2.4" height="8" rx=".6"/><rect x="10.6" y="2.5" width="2.4" height="11" rx=".6"/></svg>',
    a11y: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="5" r="2.4"/><path d="M3 14c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5"/></svg>',
    pwa: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="3" y="1.5" width="10" height="13" rx="2"/><path d="M6.5 12.5h3"/></svg>',
    faq: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 3.5h11v8h-6l-3.5 2v-2H2.5z"/><path d="M6.2 6.1A2 2 0 0 1 8 5c1.1 0 1.9.6 1.9 1.5 0 1.4-1.9 1.4-1.9 2.5M8 10.6h.01"/></svg>',
    performance: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.3 11.5a6 6 0 1 1 11.4 0"/><path d="m8 8 3-2.2"/><path d="M4.5 12.5h7"/></svg>',
    skill: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 1.5 9.7 6.3 14.5 8 9.7 9.7 8 14.5 6.3 9.7 1.5 8 6.3 6.3Z" opacity=".4"/><path d="M12.5 11l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8Z"/></svg>'
  };

  const markerStart = (id) => `<!-- vecode:plugin:${id} -->`;
  const markerEnd = (id) => `<!-- /vecode:plugin:${id} -->`;
  const marked = (id, content) => markerStart(id) + "\n" + content + "\n" + markerEnd(id);
  const escapeAttr = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Managed plugin code is always enclosed by markers so a toggle is fully
  // reversible. This intentionally strips every plugin before reapplying the
  // enabled set; it also makes option changes and repeated runs idempotent.
  function stripPluginMarkers(content) {
    if (typeof content !== "string") return content;
    return content.replace(/<!--\s*vecode:plugin:([a-z0-9_-]+)\s*-->[\s\S]*?<!--\s*\/vecode:plugin:\1\s*-->\s*/gi, "");
  }

  /* ---------- the registry ---------- */
  const PLUGINS = [
    {
      id: "typography",
      name: "Typography · 3-role type",
      tagline: "Named roles: sans for UI, mono for data, serif for warmth",
      icon: ICONS.typography,
      default: true,
      hasOptions: true,
      optionLabel: "Pairing preset",
      getOptions: () => Object.keys(TYPOGRAPHY_PRESETS).map((k) => ({ value: k, label: TYPOGRAPHY_PRESETS[k].name + " — " + TYPOGRAPHY_PRESETS[k].desc })),
      prompt: (opts) => {
        const p = TYPOGRAPHY_PRESETS[(opts && opts.preset) || "warmth"];
        return `TYPography plugin is ON. Use this 3-role type pairing: UI sans = "${p.ui}", mono = "${p.mono}", editorial serif = "${p.serif}". Link them from Google Fonts. Set CSS custom properties --font-ui, --font-mono, --font-editorial and use roles consistently: serif only for headlines/warmth moments, mono for data/metrics/code/labels.`;
      },
      inject: (files, opts) => {
        const p = TYPOGRAPHY_PRESETS[(opts && opts.preset) || "warmth"];
        const html = files["index.html"] || "";
        if (!html) return files;
        const links = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${p.weights}&display=swap" rel="stylesheet">`;
        const cssVarBlock = `<style>
:root {
  ${p.css}
}
</style>`;
        const parts = [];
        if (!html.includes("fonts.googleapis.com")) parts.push(links);
        if (!html.includes("--font-editorial")) parts.push(cssVarBlock);
        if (parts.length) files["index.html"] = html.replace(/<\/head>/i, marked("typography", parts.join("\n")) + "\n</head>");
        return files;
      }
    },
    {
      id: "darkmode",
      name: "Dark mode",
      tagline: "Token-remap dark theme, never ad-hoc overrides",
      icon: ICONS.darkmode,
      default: true,
      prompt: () => `DARK MODE plugin is ON. Implement dark mode as a token remap: define colors as CSS custom properties, then remap them under @media (prefers-color-scheme: dark) (and/or a [data-theme="dark"] attribute). Dark surfaces: near-black with a blue undertone (#0A1622 family), never pure black; text #F2F4F6 soft white; the signal color brightens one step for contrast. Add <meta name="color-scheme" content="light dark"> to the head.`,
      inject: (files) => {
        const html = files["index.html"] || "";
        if (!html) return files;
        if (!/<meta\b[^>]*name=["']color-scheme["']/i.test(html)) {
          files["index.html"] = html.replace(/<head\b[^>]*>/i, (head) => head + "\n" + marked("darkmode", '<meta name="color-scheme" content="light dark">'));
        }
        return files;
      }
    },
    {
      id: "motion",
      name: "Motion",
      tagline: "Micro-interactions as punctuation — no scroll-jacking",
      icon: ICONS.motion,
      default: true,
      prompt: () => `MOTION plugin is ON. Motion is conversational punctuation: buttons/toggles respond within 100ms; transitions 150–250ms ease; at most one gentle "breathing" cue per screen. A single fade/translate entrance for content (200–300ms, once) is allowed. No scroll-jacking, no parallax mazes, no theatrical reveals. Respect prefers-reduced-motion (disable all animation under it).`,
      inject: (files) => {
        const html = files["index.html"] || "";
        if (!html) return files;
        const helper = `/* Vecode Motion helper — reveal-on-scroll, respects reduced motion */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  var els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();`;
        const css = `<style>[data-reveal]{opacity:0;transform:translateY(10px);transition:opacity .3s ease,transform .3s ease}[data-reveal].revealed{opacity:1;transform:none}@media (prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}</style>`;
        const block = marked("motion", css + "\n<script>" + helper + "</" + "script>");
        files["index.html"] = html.replace(/<\/body>/i, block + "\n</body>");
        return files;
      }
    },
    {
      id: "forms",
      name: "Netlify Forms",
      tagline: "Contact forms that work when you deploy to Netlify",
      icon: ICONS.forms,
      default: true,
      prompt: () => `NETLIFY FORMS plugin is ON. Any form on the site must work with Netlify Forms: add data-netlify="true" to the <form> element, give every input a name attribute, and include a hidden honeypot input named "bot-field" with tabindex="-1" autocomplete="off". Note in the page copy that submissions land in the Netlify dashboard.`,
      reviewItems: ["Forms have data-netlify=\"true\", named inputs, and a bot-field honeypot"]
    },
    {
      id: "seo",
      name: "SEO",
      tagline: "Meta tags, Open Graph and structured data",
      icon: ICONS.seo,
      default: true,
      prompt: () => `SEO plugin is ON. Give every page a unique descriptive <title> (under 60 chars) and a truthful meta description (under 160 chars). Add accurate Open Graph, Twitter card, canonical and JSON-LD data when the project supplies the real values. Never write "Site name", "Describe this site", example domains, fake image URLs, or other placeholder metadata. Use a semantic heading hierarchy.`,
      reviewItems: [
        "Titles and descriptions are specific to the real page content",
        "SEO metadata contains no placeholder copy, fake domains, or invented image URLs"
      ]
    },
    {
      id: "analytics",
      name: "Analytics",
      tagline: "Privacy-friendly Plausible snippet with your domain",
      icon: ICONS.analytics,
      default: false,
      hasOptions: true,
      optionLabel: "Site domain",
      prompt: (opts) => `ANALYTICS plugin is ON. The Plausible snippet is already in the head with data-domain="${(opts && opts.domain) || "your-site.netlify.app"}" — do not duplicate it. Keep the rest of the site free of tracking scripts.`,
      inject: (files, opts) => {
        const html = files["index.html"] || "";
        if (!html) return files;
        const domain = escapeAttr((opts && opts.domain) || "your-site.netlify.app");
        const snippet = `<script defer data-domain="${domain}" src="https://plausible.io/js/script.js"></script>`;
        if (!html.includes("plausible.io")) {
          files["index.html"] = html.replace(/<\/head>/i, marked("analytics", snippet) + "\n</head>");
        }
        return files;
      }
    },
    {
      id: "a11y",
      name: "Accessibility",
      tagline: "Semantic landmarks, contrast, focus and reduced motion",
      icon: ICONS.a11y,
      default: true,
      prompt: () => `ACCESSIBILITY plugin is ON. Build accessibly by default: semantic landmarks (header/nav/main/footer), one h1 per page, real <label>s tied to inputs, alt text on meaningful images (empty alt on decorative ones), WCAG AA contrast, visible :focus-visible styles, aria-expanded on toggles, and prefers-reduced-motion support. Keyboard navigation must reach everything a mouse can.`,
      reviewItems: [
        "One h1 per page and a logical heading order",
        "Form inputs have visible labels",
        "Focus-visible styles are visible",
        "prefers-reduced-motion is respected"
      ]
    },
    {
      id: "pwa",
      name: "PWA / offline",
      tagline: "manifest.webmanifest + service worker",
      icon: ICONS.pwa,
      default: false,
      prompt: () => `PWA plugin is ON. Create manifest.webmanifest (name, short_name, start_url "/", display "standalone", theme_color matching the design, icons referenced from an icons/ folder with 192 and 512 sizes) and sw.js (cache-first for same-origin assets, network-first for navigation, versioned cache name). Register the service worker from script.js with a try/catch.`,
      inject: (files) => {
        const html = files["index.html"] || "";
        if (html && !html.includes("manifest.webmanifest")) {
          files["index.html"] = html.replace(/<head\b[^>]*>/i, (head) => head + "\n" + marked("pwa", '<link rel="manifest" href="/manifest.webmanifest">'));
        }
        return files;
      }
    },
    {
      id: "faq",
      name: "FAQ",
      tagline: "Useful answers, accessible disclosure UI and honest FAQ schema",
      icon: ICONS.faq,
      default: true,
      prompt: () => `FAQ plugin is ON. When the page benefits from frequently asked questions, write concise answers to real visitor objections and use accessible native <details>/<summary> disclosure elements. Add FAQPage JSON-LD only when those same questions and answers are visibly present on the page; never invent claims or hide schema-only content.`,
      reviewItems: [
        "FAQ answers address real visitor questions without filler",
        "FAQPage schema, when present, exactly matches visible FAQ content"
      ]
    },
    {
      id: "performance",
      name: "Performance",
      tagline: "Fast-by-default assets, loading and interaction guidance",
      icon: ICONS.performance,
      default: false,
      prompt: () => `PERFORMANCE plugin is ON. Keep the static site fast: no unnecessary libraries, defer non-critical scripts, give images explicit dimensions, lazy-load below-the-fold images, preload only genuinely critical assets, and avoid layout shifts. Preserve visual quality while keeping the first render lightweight.`,
      reviewItems: [
        "Below-the-fold images are lazy-loaded and have dimensions",
        "Scripts and third-party assets do not block the first render unnecessarily"
      ]
    }
  ];

  function getPlugin(id) { return PLUGINS.find((p) => p.id === id); }

  /** Collect prompt fragments + review items for all enabled plugins. */
  function collect(enabledIds, optionsByPlugin) {
    let prompt = "";
    const review = [];
    for (const p of PLUGINS) {
      if (!enabledIds.includes(p.id)) continue;
      const opts = (optionsByPlugin && optionsByPlugin[p.id]) || {};
      if (p.prompt) prompt += "\n" + p.prompt(opts) + "\n";
      if (p.reviewItems) review.push(...p.reviewItems);
    }
    return { prompt, review };
  }

  /** Apply inject hooks for enabled plugins. Returns a NEW files object. */
  function applyInjections(files, enabledIds, optionsByPlugin) {
    const active = Array.isArray(enabledIds) ? enabledIds : [];
    let out = {};
    for (const path of Object.keys(files || {})) out[path] = stripPluginMarkers(files[path]);
    for (const p of PLUGINS) {
      if (!active.includes(p.id) || !p.inject) continue;
      const opts = (optionsByPlugin && optionsByPlugin[p.id]) || {};
      try { out = p.inject(out, opts) || out; } catch (e) { console.warn("plugin inject failed:", p.id, e); }
    }
    return out;
  }

  window.Vecode = window.Vecode || {};
  window.Vecode.Plugins = { PLUGINS, TYPOGRAPHY_PRESETS, getPlugin, collect, applyInjections, stripPluginMarkers };
})();
