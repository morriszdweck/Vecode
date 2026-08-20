/* ==========================================================================
   Vecode — plugins.js · plugin registry (v3 rebuild)
   Ground-up rewrite: same 10 plugins, cleaner injection, safer markers.
   ========================================================================== */
(function () {
  "use strict";

  const TYPOGRAPHY_PRESETS = {
    warmth: { name: "Warmth", desc: "Serif headlines + sans body + mono data", ui: "Inter", mono: "JetBrains Mono", serif: "Source Serif 4",
      css: '--font-ui: "Inter", system-ui, sans-serif;\n  --font-mono: "JetBrains Mono", ui-monospace, monospace;\n  --font-editorial: "Source Serif 4", Georgia, serif;',
      weights: "Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400" },
    precision: { name: "Precision", desc: "Sans headlines, mono eyebrows, cool & strict", ui: "Inter", mono: "IBM Plex Mono", serif: "Lora",
      css: '--font-ui: "Inter", system-ui, sans-serif;\n  --font-mono: "IBM Plex Mono", ui-monospace, monospace;\n  --font-editorial: "Lora", Georgia, serif;',
      weights: "Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400" },
    editorial: { name: "Editorial", desc: "Newsreader headlines for storytelling", ui: "Inter", mono: "Space Mono", serif: "Newsreader",
      css: '--font-ui: "Inter", system-ui, sans-serif;\n  --font-mono: "Space Mono", ui-monospace, monospace;\n  --font-editorial: "Newsreader", Georgia, serif;',
      weights: "Inter:wght@400;500;600&family=Space+Mono:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400" },
    humanist: { name: "Humanist", desc: "Soft, round, approachable", ui: "Public Sans", mono: "IBM Plex Mono", serif: "Lora",
      css: '--font-ui: "Public Sans", system-ui, sans-serif;\n  --font-mono: "IBM Plex Mono", ui-monospace, monospace;\n  --font-editorial: "Lora", Georgia, serif;',
      weights: "Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400" }
  };

  const ICONS = {
    typography: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3 12.5 6.5 3h3L13 12.5"/><path d="M4.5 9h7"/><path d="M2 3h5M9 3h5" opacity=".5"/></svg>',
    darkmode: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"/></svg>',
    motion: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 1.5 9.7 6.3 14.5 8 9.7 9.7 8 14.5 6.3 9.7 1.5 8 6.3 6.3Z"/></svg>',
    forms: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1.5" y="3" width="13" height="10" rx="2"/><path d="M1.5 6h13M4.5 9.5h4"/></svg>',
    seo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/><path d="M4 7h6M7 4v6" opacity=".55"/></svg>',
    analytics: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 13.5h12"/><rect x="3" y="8.5" width="2.4" height="5" rx=".6"/><rect x="6.8" y="5.5" width="2.4" height="8" rx=".6"/><rect x="10.6" y="2.5" width="2.4" height="11" rx=".6"/></svg>',
    a11y: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="5" r="2.4"/><path d="M3 14c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5"/></svg>',
    pwa: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="3" y="1.5" width="10" height="13" rx="2"/><path d="M6.5 12.5h3"/></svg>',
    faq: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2.5 3.5h11v8h-6l-3.5 2v-2H2.5z"/><path d="M6.2 6.1A2 2 0 0 1 8 5c1.1 0 1.9.6 1.9 1.5 0 1.4-1.9 1.4-1.9 2.5M8 10.6h.01"/></svg>',
    performance: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2.3 11.5a6 6 0 1 1 11.4 0"/><path d="m8 8 3-2.2"/><path d="M4.5 12.5h7"/></svg>'
  };

  const markerStart = (id) => `<!-- vecode:plugin:${id} -->`;
  const markerEnd = (id) => `<!-- /vecode:plugin:${id} -->`;
  const marked = (id, content) => markerStart(id) + "\n" + content + "\n" + markerEnd(id);
  const escAttr = (v) => String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  function stripPluginMarkers(content) {
    if (typeof content !== "string") return content;
    return content.replace(/<!--\s*vecode:plugin:([a-z0-9_-]+)\s*-->[\s\S]*?<!--\s*\/vecode:plugin:\1\s*-->\s*/gi, "");
  }

  const PLUGINS = [
    {
      id: "typography", name: "Typography · 3-role type", tagline: "Named roles: sans for UI, mono for data, serif for warmth", icon: ICONS.typography, default: true,
      hasOptions: true, optionLabel: "Pairing preset",
      getOptions: () => Object.keys(TYPOGRAPHY_PRESETS).map((k) => ({ value: k, label: TYPOGRAPHY_PRESETS[k].name + " — " + TYPOGRAPHY_PRESETS[k].desc })),
      prompt: (opts) => {
        const p = TYPOGRAPHY_PRESETS[(opts && opts.preset) || "warmth"];
        return `TYPOGRAPHY plugin is ON. Use 3-role pairing: UI sans="${p.ui}", mono="${p.mono}", serif="${p.serif}". Link Google Fonts, set --font-ui/--font-mono/--font-editorial, use roles consistently: serif only for headlines, mono for data/labels.`;
      },
      inject: (files, opts) => {
        const p = TYPOGRAPHY_PRESETS[(opts && opts.preset) || "warmth"];
        const html = files["index.html"] || ""; if (!html) return files;
        const links = `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=${p.weights}&display=swap" rel="stylesheet">`;
        const cssVar = `<style>\n:root {\n  ${p.css}\n}\n</style>`;
        const parts = [];
        if (!html.includes("fonts.googleapis.com")) parts.push(links);
        if (!html.includes("--font-editorial")) parts.push(cssVar);
        if (parts.length) files["index.html"] = html.replace(/<\/head>/i, marked("typography", parts.join("\n")) + "\n</head>");
        return files;
      }
    },
    {
      id: "darkmode", name: "Dark mode", tagline: "Token-remap dark theme, never ad-hoc overrides", icon: ICONS.darkmode, default: true,
      prompt: () => `DARK MODE plugin is ON. Implement dark mode as token remap: CSS custom properties under @media (prefers-color-scheme: dark) and/or [data-theme="dark"]. Dark surfaces near-black #0A1622, text #F2F4F6, signal brightens one step. Add <meta name="color-scheme" content="light dark">.`,
      inject: (files) => {
        const html = files["index.html"] || ""; if (!html) return files;
        if (!/<meta\b[^>]*name=["']color-scheme["']/i.test(html)) {
          files["index.html"] = html.replace(/<head\b[^>]*>/i, (h) => h + "\n" + marked("darkmode", '<meta name="color-scheme" content="light dark">'));
        }
        return files;
      }
    },
    {
      id: "motion", name: "Motion", tagline: "Micro-interactions as punctuation — no scroll-jacking", icon: ICONS.motion, default: true,
      prompt: () => `MOTION plugin is ON. Motion is punctuation: buttons respond in 100ms, transitions 150–250ms ease, one breathing cue per screen max. One fade/translate entrance (200–300ms, once). No scroll-jacking, no parallax. Respect prefers-reduced-motion.`,
      inject: (files) => {
        const html = files["index.html"] || ""; if (!html) return files;
        const helper = `/* Vecode Motion helper — reveal-on-scroll, respects reduced motion */\n(function(){var r=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(r||!("IntersectionObserver"in window))return;var els=document.querySelectorAll("[data-reveal]");if(!els.length)return;var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target);}});},{threshold:0.12});els.forEach(function(el){io.observe(el);});})();`;
        const css = `<style>[data-reveal]{opacity:0;transform:translateY(10px);transition:opacity .3s ease,transform .3s ease}[data-reveal].revealed{opacity:1;transform:none}@media (prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}</style>`;
        files["index.html"] = html.replace(/<\/body>/i, marked("motion", css + "\n<script>" + helper + "</" + "script>") + "\n</body>");
        return files;
      }
    },
    {
      id: "forms", name: "Netlify Forms", tagline: "Contact forms that work when you deploy to Netlify", icon: ICONS.forms, default: true,
      prompt: () => `NETLIFY FORMS plugin is ON. Any form must work with Netlify Forms: data-netlify="true", every input has name, hidden honeypot name="bot-field" tabindex="-1" autocomplete="off". Note submissions land in Netlify dashboard.`,
      reviewItems: ["Forms have data-netlify=\"true\", named inputs, and a bot-field honeypot"]
    },
    {
      id: "seo", name: "SEO", tagline: "Meta tags, Open Graph and structured data", icon: ICONS.seo, default: true,
      prompt: () => `SEO plugin is ON. Every page gets unique descriptive <title> (<60 chars) and truthful meta description (<160 chars). Add accurate OG/Twitter/canonical/JSON-LD when real values exist. Never invent placeholder domains or image URLs. Use semantic heading hierarchy.`,
      reviewItems: ["Titles and descriptions are specific to the real page content", "SEO metadata contains no placeholder copy, fake domains, or invented image URLs"]
    },
    {
      id: "analytics", name: "Analytics", tagline: "Privacy-friendly Plausible snippet with your domain", icon: ICONS.analytics, default: false,
      hasOptions: true, optionLabel: "Site domain",
      prompt: (opts) => `ANALYTICS plugin is ON. Plausible snippet already in head with data-domain="${(opts && opts.domain) || "your-site.netlify.app"}" — do not duplicate. Keep rest of site free of trackers.`,
      inject: (files, opts) => {
        const html = files["index.html"] || ""; if (!html) return files;
        const domain = escAttr((opts && opts.domain) || "your-site.netlify.app");
        const snippet = `<script defer data-domain="${domain}" src="https://plausible.io/js/script.js"></script>`;
        if (!html.includes("plausible.io")) files["index.html"] = html.replace(/<\/head>/i, marked("analytics", snippet) + "\n</head>");
        return files;
      }
    },
    {
      id: "a11y", name: "Accessibility", tagline: "Semantic landmarks, contrast, focus and reduced motion", icon: ICONS.a11y, default: true,
      prompt: () => `ACCESSIBILITY plugin is ON. Build accessibly: header/nav/main/footer, one h1 per page, real <label>s, alt text (empty on decorative), WCAG AA contrast, visible :focus-visible, aria-expanded on toggles, prefers-reduced-motion. Keyboard reaches everything.`,
      reviewItems: ["One h1 per page and a logical heading order", "Form inputs have visible labels", "Focus-visible styles are visible", "prefers-reduced-motion is respected"]
    },
    {
      id: "pwa", name: "PWA / offline", tagline: "manifest.webmanifest + service worker", icon: ICONS.pwa, default: false,
      prompt: () => `PWA plugin is ON. Create manifest.webmanifest (name, short_name, start_url "/", display "standalone", theme_color) and sw.js (cache-first for assets, network-first for nav, versioned cache). Register SW from script.js with try/catch.`,
      inject: (files) => {
        const html = files["index.html"] || ""; if (!html) return files;
        if (!html.includes("manifest.webmanifest")) files["index.html"] = html.replace(/<head\b[^>]*>/i, (h) => h + "\n" + marked("pwa", '<link rel="manifest" href="/manifest.webmanifest">'));
        return files;
      }
    },
    {
      id: "faq", name: "FAQ", tagline: "Useful answers, accessible disclosure UI and honest FAQ schema", icon: ICONS.faq, default: true,
      prompt: () => `FAQ plugin is ON. When a page benefits from FAQ, write concise answers to real visitor objections using native <details>/<summary>. Add FAQPage JSON-LD only when same Q&A is visibly present; never hide schema-only content.`,
      reviewItems: ["FAQ answers address real visitor questions without filler", "FAQPage schema, when present, exactly matches visible FAQ content"]
    },
    {
      id: "performance", name: "Performance", tagline: "Fast-by-default assets, loading and interaction guidance", icon: ICONS.performance, default: false,
      prompt: () => `PERFORMANCE plugin is ON. Keep site fast: no extra libraries, defer non-critical scripts, explicit image dimensions, lazy-load below-fold images, preload only critical assets, avoid layout shifts.`,
      reviewItems: ["Below-the-fold images are lazy-loaded and have dimensions", "Scripts and third-party assets do not block the first render unnecessarily"]
    }
  ];

  function getPlugin(id) { return PLUGINS.find((p) => p.id === id); }

  function collect(enabledIds, optionsByPlugin) {
    let prompt = ""; const review = [];
    for (const p of PLUGINS) {
      if (!enabledIds.includes(p.id)) continue;
      const opts = (optionsByPlugin && optionsByPlugin[p.id]) || {};
      if (p.prompt) prompt += "\n" + p.prompt(opts) + "\n";
      if (p.reviewItems) review.push(...p.reviewItems);
    }
    return { prompt, review };
  }

  function applyInjections(files, enabledIds, optionsByPlugin) {
    const active = Array.isArray(enabledIds) ? enabledIds : [];
    let out = {}; for (const k of Object.keys(files || {})) out[k] = stripPluginMarkers(files[k]);
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
