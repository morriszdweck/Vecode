/* ==========================================================================
   Vecode — templates.js · starter templates
   Hand-built with the Vecode Design Skill (one signal color, 3-role type,
   expressive heroes, quiet texture, human voice). Starting from one of
   these seeds the project, then the agent takes over.
   ========================================================================== */
(function () {
  "use strict";

  const T = {};

  /* ---------------- 01 · Landing (warm editorial) ---------------- */
  T.landing = {
    id: "landing", name: "Landing page", tagline: "Warm editorial hero, oversized numeral, benefit-first copy",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>Fieldnote — notes that keep up with you</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="site-head">
  <a class="wordmark" href="#">fieldnote</a>
  <nav aria-label="Main">
    <a href="#product">Product</a>
    <a href="#stories">Stories</a>
    <a href="#pricing">Pricing</a>
  </nav>
  <a class="btn btn-signal" href="#pricing">Start free</a>
</header>

<main>
  <section class="hero">
    <p class="eyebrow">FIELDNOTES — 01 / 05</p>
    <h1>Notes that keep up<br>with how you <em>think</em>.</h1>
    <p class="lede">Fieldnote turns scattered thoughts into a quiet, searchable journal — on your phone, your laptop, or both. No folders to build, no tags to invent. You write; it files.</p>
    <div class="hero-actions">
      <a class="btn btn-signal btn-lg" href="#pricing">Start free — no card</a>
      <a class="btn btn-ghost btn-lg" href="#product">See how it works</a>
    </div>
    <p class="hero-note mono">2 minutes to first note · works offline</p>
    <div class="hero-numeral mono" aria-hidden="true">04<span>min saved per note, on average</span></div>
  </section>

  <section class="facts" id="product">
    <div class="fact">
      <p class="mono fact-k">01</p>
      <h2>Write first, file never.</h2>
      <p>Every note lands in one timeline. Search finds it later — by word, by date, by feel. Filing is a chore; we deleted it.</p>
    </div>
    <div class="fact">
      <p class="mono fact-k">02</p>
      <h2>Quiet by design.</h2>
      <p>No streaks, no badges, no "you're on fire". Fieldnote is a plain notebook with good lighting.</p>
    </div>
    <div class="fact">
      <p class="mono fact-k">03</p>
      <h2>Yours, offline.</h2>
      <p>Notes live on your device first. The cloud is a mirror, not a landlord.</p>
    </div>
  </section>

  <section class="quote" id="stories">
    <p class="eyebrow">A NOTE FROM A READER</p>
    <blockquote>“I kept three apps for the same job. Fieldnote is the one I open at the end of the day — because it never asks me to do anything first.”</blockquote>
    <p class="mono attr">— Mira, product designer, Rotterdam</p>
  </section>

  <section class="pricing" id="pricing">
    <p class="eyebrow">PRICING — 02 / 05</p>
    <h2>Simple like the product.</h2>
    <div class="plans">
      <article class="plan">
        <h3>Free</h3>
        <p class="mono price">0<span>/mo</span></p>
        <ul>
          <li>Unlimited notes</li>
          <li>Search across everything</li>
          <li>One device</li>
        </ul>
        <a class="btn" href="#">Start free</a>
      </article>
      <article class="plan plan-featured">
        <h3>Fieldnote Plus</h3>
        <p class="mono price">6<span>/mo</span></p>
        <ul>
          <li>Everything in Free</li>
          <li>Sync across all devices</li>
          <li>Export to markdown, anytime</li>
          <li>Offline-first mobile app</li>
        </ul>
        <a class="btn btn-signal" href="#">Start 30-day trial</a>
      </article>
    </div>
  </section>
</main>

<footer class="site-foot">
  <p class="mono">FIELDNOTE — WRITTEN FOR PEOPLE WHO THINK IN MARGINS</p>
  <p>© 2026 Fieldnote. Built with Vecode.</p>
</footer>
</body>
</html>`,
      "styles.css": `/* Fieldnote — warmth-leaning editorial. Signal blue on warm white. */
:root {
  --signal-deep: #002F5B;
  --signal: #007CFF;
  --signal-bright: #00A1FF;
  --signal-ice: #A0DAF7;
  --ink: #121212;
  --gray-70: #707070;
  --gray-40: #C3C3C3;
  --line: #E1E3E6;
  --paper: #FFFFFF;
  --paper-warm: #FCFCFA;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-editorial: "Source Serif 4", Georgia, serif;
  color-scheme: light dark;
}
* { box-sizing: border-box; }
body {
  margin: 0; font-family: var(--font-ui); font-size: 16px; line-height: 1.6;
  background: var(--paper-warm); color: var(--ink);
}
a { color: inherit; text-decoration: none; }
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

/* head */
.site-head {
  display: flex; align-items: center; gap: 32px;
  padding: 20px clamp(24px, 6vw, 96px);
  border-bottom: 1px solid var(--line);
}
.wordmark { font-family: var(--font-editorial); font-weight: 600; font-size: 20px; letter-spacing: -0.01em; }
.site-head nav { flex: 1; display: flex; gap: 24px; font-size: 14px; color: var(--gray-70); }
.site-head nav a:hover { color: var(--signal); }

/* buttons */
.btn {
  display: inline-block; padding: 10px 20px; border-radius: 8px;
  font-size: 15px; font-weight: 600; border: 1px solid var(--line);
  background: var(--paper); transition: all 150ms ease;
}
.btn-signal { background: var(--signal); border-color: var(--signal); color: #fff; }
.btn-signal:hover { background: var(--signal-bright); }
.btn-ghost { border-color: transparent; background: transparent; }
.btn-ghost:hover { color: var(--signal); }
.btn-lg { padding: 14px 28px; font-size: 16px; }

/* hero — expressive grid */
.hero {
  position: relative;
  padding: clamp(64px, 10vw, 128px) clamp(24px, 6vw, 96px) 96px;
  overflow: hidden;
}
.eyebrow {
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.12em;
  color: var(--signal); font-weight: 500; margin: 0 0 16px;
}
.hero h1 {
  font-family: var(--font-editorial); font-weight: 400;
  font-size: clamp(44px, 7.5vw, 88px); line-height: 1.05; letter-spacing: -0.02em;
  margin: 0 0 24px; max-width: 12ch;
}
.hero h1 em { font-style: italic; color: var(--signal); }
.lede { font-size: 19px; color: var(--gray-70); max-width: 52ch; margin: 0 0 32px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.hero-note { font-size: 12px; color: var(--gray-40); margin: 0; }
.hero-numeral {
  position: absolute; right: clamp(24px, 6vw, 96px); top: clamp(48px, 8vw, 96px);
  font-size: clamp(120px, 20vw, 260px); font-weight: 500; line-height: 1;
  color: var(--signal-ice); letter-spacing: -0.04em; user-select: none;
}
.hero-numeral span {
  display: block; font-size: 13px; letter-spacing: 0.02em; color: var(--gray-70);
  font-weight: 400; max-width: 26ch; margin-top: 8px; text-align: right;
}

/* facts — base grid */
.facts {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px;
  padding: 96px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line);
}
.fact-k { font-size: 12px; color: var(--signal); letter-spacing: 0.1em; }
.fact h2 { font-family: var(--font-editorial); font-weight: 600; font-size: 28px; margin: 8px 0 12px; }
.fact p { color: var(--gray-70); margin: 0; max-width: 40ch; }

/* quote */
.quote { padding: 96px clamp(24px, 6vw, 96px); background: var(--signal-deep); color: #fff; }
.quote .eyebrow { color: var(--signal-ice); }
.quote blockquote {
  font-family: var(--font-editorial); font-size: clamp(26px, 4vw, 44px);
  line-height: 1.25; margin: 16px 0 24px; max-width: 24ch; font-weight: 400;
}
.quote .attr { color: var(--signal-ice); font-size: 13px; margin: 0; }

/* pricing */
.pricing { padding: 96px clamp(24px, 6vw, 96px); }
.pricing h2 { font-family: var(--font-editorial); font-size: 40px; font-weight: 600; margin: 0 0 40px; }
.plans { display: grid; grid-template-columns: repeat(2, minmax(260px, 380px)); gap: 24px; }
.plan { border: 1px solid var(--line); border-radius: 14px; padding: 32px; background: var(--paper); }
.plan h3 { margin: 0 0 8px; font-size: 18px; }
.price { font-size: 40px; margin: 0 0 20px; }
.price span { font-size: 15px; color: var(--gray-70); }
.plan ul { list-style: none; padding: 0; margin: 0 0 28px; color: var(--gray-70); font-size: 14px; }
.plan li { padding: 6px 0; border-top: 1px solid var(--line); }
.plan .btn { width: 100%; text-align: center; }
.plan-featured { border-color: var(--signal); box-shadow: 0 12px 40px rgba(0,124,255,0.12); }

/* foot */
.site-foot {
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  padding: 32px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line);
  font-size: 13px; color: var(--gray-70);
}
.site-foot .mono { font-size: 11px; letter-spacing: 0.1em; color: var(--gray-40); }

@media (max-width: 820px) {
  .facts { grid-template-columns: 1fr; gap: 32px; }
  .plans { grid-template-columns: 1fr; }
  .hero-numeral { position: static; margin-top: 48px; font-size: 120px; }
  .hero-numeral span { text-align: left; }
  .site-head nav { display: none; }
}
@media (prefers-color-scheme: dark) {
  :root {
    --signal-deep: #002F5B;
    --signal: #00A1FF;
    --signal-ice: #A0DAF7;
    --ink: #F2F4F6;
    --gray-70: #9AA4AD;
    --gray-40: #55606A;
    --line: #22303F;
    --paper: #101F30;
    --paper-warm: #0A1622;
  }
}`
    }
  };

  /* ---------------- 02 · SaaS product ---------------- */
  T.saas = {
    id: "saas", name: "SaaS product page", tagline: "Precision-leaning marketing page with pricing table",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>Relay — deploy pipelines that explain themselves</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="nav">
  <span class="logo mono">relay//</span>
  <nav aria-label="Main">
    <a href="#product">Product</a>
    <a href="#metrics">Metrics</a>
    <a href="#pricing">Pricing</a>
    <a href="#docs">Docs</a>
  </nav>
  <a class="btn btn-signal" href="#pricing">Start free</a>
</header>

<main>
  <section class="hero">
    <p class="eyebrow mono">DEPLOY PIPELINES — 01 / 03</p>
    <h1>Deploys that explain themselves.</h1>
    <p class="lede">Relay runs your build pipeline and tells you exactly what happened, in plain language. From commit to live in one view — with every failure traced to the line that caused it.</p>
    <div class="cta-row">
      <a class="btn btn-signal" href="#pricing">Start free</a>
      <a class="btn" href="#metrics">See the numbers</a>
    </div>
    <div class="hero-metrics mono">
      <div><span class="big">38s</span> median deploy</div>
      <div><span class="big">99.98%</span> build success</div>
      <div><span class="big">12k</span> teams shipping</div>
    </div>
  </section>

  <section class="features" id="product">
    <h2 class="mono kicker">WHAT RELAY DOES</h2>
    <div class="grid">
      <article class="card"><h3>Trace every failure</h3><p>Each red build links straight to the commit, the log line and the diff. No more guessing which step broke.</p></article>
      <article class="card"><h3>Plain-language summaries</h3><p>“Preview is live at /preview — 3 checks passed, 1 warning.” Relay writes the update so you do not have to.</p></article>
      <article class="card"><h3>One view per pipeline</h3><p>Build, test, deploy and rollback history in a single timeline. Your whole release story in one scroll.</p></article>
      <article class="card"><h3>Works with what you have</h3><p>GitHub, GitLab, Docker, Vercel, Netlify, any registry. Relay reads your stack, not the other way round.</p></article>
    </div>
  </section>

  <section class="metrics" id="metrics">
    <p class="eyebrow mono">MEASURED, NOT GUESSED</p>
    <div class="metric-row mono">
      <div><span class="num">2.4×</span><span class="cap">faster rollbacks</span></div>
      <div><span class="num">−61%</span><span class="cap">time hunting logs</span></div>
      <div><span class="num">41</span><span class="cap">integrations</span></div>
    </div>
  </section>

  <section class="pricing" id="pricing">
    <h2 class="mono kicker">PRICING — 02 / 03</h2>
    <div class="plans">
      <article class="plan">
        <h3>Hobby</h3>
        <p class="price mono">0<span>/mo</span></p>
        <ul>
          <li>1 pipeline</li>
          <li>7-day history</li>
          <li>Community support</li>
        </ul>
        <a class="btn" href="#">Start free</a>
      </article>
      <article class="plan featured">
        <h3>Team</h3>
        <p class="price mono">29<span>/mo</span></p>
        <ul>
          <li>Unlimited pipelines</li>
          <li>90-day history</li>
          <li>Plain-language summaries</li>
          <li>Slack + email alerts</li>
        </ul>
        <a class="btn btn-signal" href="#">Start 14-day trial</a>
      </article>
      <article class="plan">
        <h3>Enterprise</h3>
        <p class="price mono">Custom</p>
        <ul>
          <li>SSO / SAML</li>
          <li>Unlimited retention</li>
          <li>Dedicated support</li>
        </ul>
        <a class="btn" href="#">Talk to us</a>
      </article>
    </div>
  </section>

  <section class="cta" id="docs">
    <h2>From first commit to first deploy in under five minutes.</h2>
    <a class="btn btn-signal btn-lg" href="#">Start free</a>
    <p class="mono small">No card · no sales call · delete anytime</p>
  </section>
</main>

<footer class="foot">
  <span class="mono">RELAY — DEPLOYS THAT EXPLAIN THEMSELVES</span>
  <span>© 2026 Relay Systems. Built with Vecode.</span>
</footer>
</body>
</html>`,
      "styles.css": `/* Relay — precision pole: strict grid, mono-forward, cool neutrals. */
:root {
  --signal-deep: #002F5B; --signal: #007CFF; --signal-bright: #00A1FF; --signal-ice: #A0DAF7;
  --ink: #121212; --gray-70: #707070; --gray-40: #C3C3C3; --line: #E1E3E6;
  --paper: #FFFFFF; --paper-warm: #FCFCFA;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  color-scheme: light dark;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-ui); font-size: 16px; line-height: 1.6; background: var(--paper-warm); color: var(--ink); }
a { color: inherit; text-decoration: none; }
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

.nav { display: flex; align-items: center; gap: 40px; padding: 18px clamp(24px, 6vw, 96px); border-bottom: 1px solid var(--line); position: sticky; top: 0; background: color-mix(in srgb, var(--paper-warm) 85%, transparent); backdrop-filter: blur(10px); }
.logo { font-weight: 500; color: var(--signal); font-size: 15px; }
.nav nav { flex: 1; display: flex; gap: 24px; font-size: 14px; color: var(--gray-70); }
.nav nav a:hover { color: var(--signal); }

.btn { display: inline-block; padding: 9px 18px; border-radius: 6px; border: 1px solid var(--line); background: var(--paper); font-size: 14px; font-weight: 600; transition: all 150ms ease; }
.btn-signal { background: var(--signal); border-color: var(--signal); color: #fff; }
.btn-signal:hover { background: var(--signal-bright); }
.btn-lg { padding: 13px 26px; font-size: 15px; }

.hero { padding: clamp(72px, 10vw, 128px) clamp(24px, 6vw, 96px) 80px; max-width: 1000px; }
.eyebrow { font-size: 12px; letter-spacing: 0.12em; color: var(--signal); margin: 0 0 14px; }
.hero h1 { font-size: clamp(40px, 6vw, 68px); line-height: 1.08; letter-spacing: -0.025em; margin: 0 0 20px; max-width: 14ch; }
.lede { font-size: 18px; color: var(--gray-70); max-width: 54ch; margin: 0 0 28px; }
.cta-row { display: flex; gap: 12px; margin-bottom: 48px; }
.hero-metrics { display: flex; gap: 48px; border-top: 1px solid var(--line); padding-top: 28px; font-size: 13px; color: var(--gray-70); }
.big { display: block; font-size: 30px; color: var(--ink); font-weight: 500; }

.features { padding: 80px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); }
.kicker { font-size: 12px; letter-spacing: 0.12em; color: var(--signal); }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; }
.card { border: 1px solid var(--line); border-radius: 10px; padding: 28px; background: var(--paper); }
.card h3 { margin: 0 0 8px; font-size: 17px; }
.card p { margin: 0; color: var(--gray-70); font-size: 14px; max-width: 46ch; }

.metrics { background: var(--signal-deep); color: #fff; padding: 72px clamp(24px, 6vw, 96px); }
.metrics .eyebrow { color: var(--signal-ice); }
.metric-row { display: flex; gap: 64px; margin-top: 20px; flex-wrap: wrap; }
.num { font-size: 44px; font-weight: 500; display: block; color: var(--signal-ice); }
.cap { font-size: 13px; color: rgba(255,255,255,0.7); }

.pricing { padding: 80px clamp(24px, 6vw, 96px); }
.plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px; }
.plan { border: 1px solid var(--line); border-radius: 10px; padding: 28px; background: var(--paper); display: flex; flex-direction: column; }
.plan h3 { margin: 0 0 6px; font-size: 16px; }
.price { font-size: 32px; margin: 0 0 18px; }
.price span { font-size: 14px; color: var(--gray-70); }
.plan ul { list-style: none; padding: 0; margin: 0 0 24px; font-size: 13.5px; color: var(--gray-70); flex: 1; }
.plan li { padding: 7px 0; border-top: 1px solid var(--line); }
.plan .btn { text-align: center; }
.featured { border-color: var(--signal); box-shadow: 0 12px 40px rgba(0,124,255,0.12); }

.cta { text-align: center; padding: 96px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); }
.cta h2 { font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.02em; max-width: 22ch; margin: 0 auto 24px; }
.small { font-size: 12px; color: var(--gray-40); margin-top: 16px; }

.foot { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 28px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); font-size: 13px; color: var(--gray-70); }
.foot .mono { font-size: 11px; letter-spacing: 0.1em; color: var(--gray-40); }

@media (max-width: 860px) {
  .grid { grid-template-columns: 1fr; }
  .plans { grid-template-columns: 1fr; }
  .hero-metrics { flex-direction: column; gap: 20px; }
  .nav nav { display: none; }
}
@media (prefers-color-scheme: dark) {
  :root {
    --signal: #00A1FF; --ink: #F2F4F6; --gray-70: #9AA4AD; --gray-40: #55606A;
    --line: #22303F; --paper: #101F30; --paper-warm: #0A1622;
  }
}`
    }
  };

  /* ---------------- 03 · Portfolio ---------------- */
  T.portfolio = {
    id: "portfolio", name: "Portfolio", tagline: "Expressive grid, oversized index, mono metadata",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>Ana Sol — design engineer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="head">
  <span class="mono id">ANA SOL — DESIGN ENGINEER</span>
  <nav aria-label="Main">
    <a href="#work">Work</a>
    <a href="#about">About</a>
    <a href="mailto:ana@example.com">Contact</a>
  </nav>
</header>

<main>
  <section class="hero">
    <p class="mono kicker">PORTFOLIO — 2021 / 2026</p>
    <h1>I make software feel<br><em>considered.</em></h1>
    <p class="lede">Design engineer in Amsterdam. Eight years building design systems, dashboards and the odd experiment — always with the same question: does this earn its place on the screen?</p>
    <p class="mono meta">AVAILABLE FOR SELECT PROJECTS — 2026</p>
  </section>

  <section class="work" id="work">
    <p class="mono kicker">SELECTED WORK — 05</p>
    <ol class="index">
      <li><a href="#">
        <span class="mono n">01</span>
        <span class="t">Aurora — weather that reads like a friend</span>
        <span class="mono y">2025</span>
      </a></li>
      <li><a href="#">
        <span class="mono n">02</span>
        <span class="t">Ledgerline — bookkeeping without the dread</span>
        <span class="mono y">2025</span>
      </a></li>
      <li><a href="#">
        <span class="mono n">03</span>
        <span class="t">Typekit for nurses — clinical notes, humane</span>
        <span class="mono y">2024</span>
      </a></li>
      <li><a href="#">
        <span class="mono n">04</span>
        <span class="t">Grain — a camera app that respects film</span>
        <span class="mono y">2023</span>
      </a></li>
      <li><a href="#">
        <span class="mono n">05</span>
        <span class="t">Kiosk — museum wayfinding system</span>
        <span class="mono y">2022</span>
      </a></li>
    </ol>
  </section>

  <section class="about" id="about">
    <p class="mono kicker">ABOUT — 01</p>
    <h2>Precision, with warmth.</h2>
    <div class="cols">
      <p>I spent five years at a bank learning what "trustworthy software" means — then unlearned the grey. These days I work with teams who want interfaces that feel like a good conversation: clear, kind and never louder than the content.</p>
      <p class="mono caps">CURRENTLY READING — "THE DESIGN OF EVERYDAY THINGS"<br><br>FAVOURITE TOOL — A SHARPENED PENCIL</p>
    </div>
  </section>
</main>

<footer class="foot">
  <span class="mono">ANA@EXAMPLE.COM</span>
  <span class="mono">AMSTERDAM — UTC+1</span>
</footer>
</body>
</html>`,
      "styles.css": `/* Portfolio — expressive grid, oversized type, generous whitespace. */
:root {
  --signal-deep: #002F5B; --signal: #007CFF; --signal-ice: #A0DAF7; --signal-cyan: #00F6FF;
  --ink: #121212; --gray-70: #707070; --gray-40: #C3C3C3; --line: #E1E3E6;
  --paper: #FFFFFF; --paper-warm: #FCFCFA;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
  --font-editorial: "Newsreader", Georgia, serif;
  color-scheme: light dark;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-ui); font-size: 16px; line-height: 1.6; background: var(--paper-warm); color: var(--ink); }
a { color: inherit; text-decoration: none; }
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
em { font-style: italic; }

.head { display: flex; justify-content: space-between; align-items: center; padding: 24px clamp(24px, 6vw, 96px); border-bottom: 1px solid var(--line); }
.id { font-size: 11px; letter-spacing: 0.12em; color: var(--gray-70); }
.head nav { display: flex; gap: 24px; font-size: 14px; color: var(--gray-70); }
.head nav a:hover { color: var(--signal); }

.hero { padding: clamp(96px, 16vw, 200px) clamp(24px, 6vw, 96px) 96px; }
.kicker { font-size: 12px; letter-spacing: 0.12em; color: var(--signal); margin: 0 0 20px; }
.hero h1 { font-family: var(--font-editorial); font-weight: 400; font-size: clamp(52px, 9vw, 110px); line-height: 0.98; letter-spacing: -0.03em; margin: 0 0 32px; }
.hero h1 em { color: var(--signal); }
.lede { font-size: 19px; color: var(--gray-70); max-width: 46ch; margin: 0 0 40px; }
.meta { font-size: 12px; letter-spacing: 0.1em; color: var(--gray-40); }

.work { padding: 96px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); }
.index { list-style: none; padding: 0; margin: 32px 0 0; }
.index li { border-top: 1px solid var(--line); }
.index li:last-child { border-bottom: 1px solid var(--line); }
.index a { display: flex; align-items: baseline; gap: 32px; padding: 28px 8px; transition: padding 150ms ease, color 150ms ease; }
.index a:hover { padding-left: 24px; color: var(--signal); }
.index .n { font-size: 13px; color: var(--gray-40); }
.index .t { font-family: var(--font-editorial); font-size: clamp(22px, 3vw, 34px); flex: 1; }
.index .y { font-size: 13px; color: var(--gray-70); }

.about { padding: 96px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); }
.about h2 { font-family: var(--font-editorial); font-size: clamp(34px, 5vw, 56px); font-weight: 400; letter-spacing: -0.02em; margin: 8px 0 32px; }
.cols { display: grid; grid-template-columns: 1.4fr 1fr; gap: 48px; }
.cols p { color: var(--gray-70); font-size: 17px; max-width: 52ch; margin: 0; }
.caps { font-size: 12px; letter-spacing: 0.08em; color: var(--gray-40); line-height: 2; }

.foot { display: flex; justify-content: space-between; padding: 32px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); font-size: 12px; letter-spacing: 0.08em; color: var(--gray-70); }

@media (max-width: 760px) {
  .cols { grid-template-columns: 1fr; }
  .head nav { display: none; }
  .index a { flex-wrap: wrap; gap: 8px; }
}
@media (prefers-color-scheme: dark) {
  :root { --signal: #00A1FF; --ink: #F2F4F6; --gray-70: #9AA4AD; --gray-40: #55606A; --line: #22303F; --paper: #101F30; --paper-warm: #0A1622; }
}`
    }
  };

  /* ---------------- 04 · Docs ---------------- */
  T.docs = {
    id: "docs", name: "Docs site", tagline: "Base grid, sidebar navigation, mono API references",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>Parcel API — documentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="layout">
  <aside class="side">
    <a class="brand mono" href="#">parcel<span>/docs</span></a>
    <nav aria-label="Documentation">
      <p class="mono grp">GETTING STARTED</p>
      <a href="#" class="on">Introduction</a>
      <a href="#">Quickstart</a>
      <a href="#">Authentication</a>
      <p class="mono grp">GUIDES</p>
      <a href="#">Creating shipments</a>
      <a href="#">Tracking events</a>
      <a href="#">Labels &amp; printing</a>
      <p class="mono grp">REFERENCE</p>
      <a href="#">REST API</a>
      <a href="#">Webhooks</a>
      <a href="#">Errors</a>
    </nav>
  </aside>

  <main class="doc">
    <nav class="crumbs mono"><a href="#">docs</a> / <span>introduction</span></nav>
    <h1>Ship less code, more parcels.</h1>
    <p class="lede">Parcel is a shipping API for small teams. Create labels, track parcels and get webhooks when things move — without signing a carrier contract first.</p>

    <h2>What you get</h2>
    <ul>
      <li><b>One integration, 40+ carriers.</b> The same request shape for every courier.</li>
      <li><b>Real tracking events.</b> Webhooks for created, in-transit, out-for-delivery, delivered.</li>
      <li><b>Labels in two lines.</b> <code>POST /labels</code> returns a ready-to-print PDF.</li>
    </ul>

    <h2>Your first request</h2>
    <pre><code>curl -X POST https://api.parcel.dev/v1/labels \\
  -H "Authorization: Bearer pk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": { "name": "Ada", "city": "London" },
    "carrier": "royal-mail",
    "service": "tracked-48"
  }'</code></pre>

    <h2>Base URL</h2>
    <p>All requests go to <code>https://api.parcel.dev/v1</code>. Test keys start with <code>pk_test_</code>, live keys with <code>pk_live_</code>.</p>

    <div class="note">
      <p class="mono note-k">NOTE — 01</p>
      <p>Webhook payloads are signed with your secret. Verify the signature before trusting an event.</p>
    </div>
  </main>
</div>
</body>
</html>`,
      "styles.css": `/* Parcel docs — precision pole, base grid, mono metadata. */
:root {
  --signal-deep: #002F5B; --signal: #007CFF; --signal-bright: #00A1FF; --signal-ice: #A0DAF7;
  --ink: #121212; --gray-70: #707070; --gray-40: #C3C3C3; --line: #E1E3E6;
  --paper: #FFFFFF; --paper-warm: #FCFCFA;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  color-scheme: light dark;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-ui); font-size: 16px; line-height: 1.65; background: var(--paper-warm); color: var(--ink); }
a { color: inherit; text-decoration: none; }
code { font-family: var(--font-mono); font-size: 0.88em; background: var(--paper); border: 1px solid var(--line); border-radius: 5px; padding: 1px 6px; }
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

.layout { display: grid; grid-template-columns: 264px 1fr; min-height: 100vh; }

.side { border-right: 1px solid var(--line); padding: 28px 20px; position: sticky; top: 0; height: 100vh; overflow-y: auto; background: var(--paper); }
.brand { font-size: 16px; font-weight: 500; display: block; margin-bottom: 28px; }
.brand span { color: var(--gray-40); }
.side nav { display: flex; flex-direction: column; gap: 2px; font-size: 14px; }
.grp { font-size: 11px; letter-spacing: 0.12em; color: var(--gray-40); margin: 18px 0 6px; }
.side nav a { padding: 7px 10px; border-radius: 6px; color: var(--gray-70); }
.side nav a:hover { color: var(--ink); background: var(--paper-warm); }
.side nav a.on { color: var(--signal); background: var(--signal-ice); font-weight: 500; }

.doc { padding: 48px clamp(32px, 6vw, 88px); max-width: 760px; }
.crumbs { font-size: 12px; color: var(--gray-40); margin-bottom: 24px; }
.crumbs a:hover { color: var(--signal); }
.doc h1 { font-size: clamp(32px, 5vw, 48px); letter-spacing: -0.02em; line-height: 1.1; margin: 0 0 16px; }
.lede { font-size: 18px; color: var(--gray-70); margin: 0 0 40px; max-width: 52ch; }
.doc h2 { font-size: 20px; margin: 40px 0 12px; }
.doc ul { padding-left: 20px; color: var(--gray-70); }
.doc li { margin: 8px 0; }
pre { background: var(--signal-deep); color: #E8F1F9; border-radius: 10px; padding: 20px; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; }
pre code { background: none; border: none; color: inherit; padding: 0; }
.note { border: 1px solid var(--signal-ice); background: color-mix(in srgb, var(--signal-ice) 25%, transparent); border-radius: 10px; padding: 18px 20px; margin-top: 32px; }
.note-k { font-size: 11px; letter-spacing: 0.12em; color: var(--signal-deep); margin: 0 0 6px; }
.note p:last-child { margin: 0; font-size: 14px; }

@media (max-width: 820px) {
  .layout { grid-template-columns: 1fr; }
  .side { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--line); }
}
@media (prefers-color-scheme: dark) {
  :root { --signal: #00A1FF; --ink: #F2F4F6; --gray-70: #9AA4AD; --gray-40: #55606A; --line: #22303F; --paper: #101F30; --paper-warm: #0A1622; }
  .side nav a.on { background: rgba(0,124,255,0.15); }
  pre { background: #060D16; }
}`
    }
  };

  /* ---------------- 05 · Blog ---------------- */
  T.blog = {
    id: "blog", name: "Blog", tagline: "Editorial index with mono dates and serif headlines",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>The Ledger — notes on money, plainly</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="head">
  <a class="brand serif" href="#">The Ledger</a>
  <p class="mono tag">NOTES ON MONEY, PLAINLY — EST. 2024</p>
</header>

<main class="wrap">
  <section class="featured">
    <p class="mono date">AUG 12, 2026 — 08 MIN</p>
    <h1><a href="#">The quiet case for boring investments</a></h1>
    <p class="dek">Exciting portfolios make good stories and bad returns. What boring actually buys you, with numbers.</p>
  </section>

  <section class="list">
    <article>
      <p class="mono date">AUG 03, 2026 — 05 MIN</p>
      <h2><a href="#">What your bank statement is really telling you</a></h2>
      <p>Three lines to read every month, and the one number that matters more than the balance.</p>
    </article>
    <article>
      <p class="mono date">JUL 21, 2026 — 06 MIN</p>
      <h2><a href="#">Emergency funds are a form of sleep</a></h2>
      <p>The math behind keeping six months of rent in a boring account, and why it beats the alternative.</p>
    </article>
    <article>
      <p class="mono date">JUL 09, 2026 — 04 MIN</p>
      <h2><a href="#">A one-page budget for people who hate budgets</a></h2>
      <p>Four categories, one page, no apps. The system holds because it is almost not a system.</p>
    </article>
  </section>

  <aside class="about">
    <p class="mono date">ABOUT</p>
    <p>Written by June Park, a former fund analyst who got tired of saying "past performance is not a guarantee" and started showing the work instead. New note every two weeks. No sponsored posts, ever.</p>
  </aside>
</main>

<footer class="foot mono">THE LEDGER — NEW NOTE EVERY TWO WEEKS</footer>
</body>
</html>`,
      "styles.css": `/* The Ledger — editorial, warmth-leaning, generous whitespace. */
:root {
  --signal-deep: #002F5B; --signal: #007CFF; --signal-ice: #A0DAF7;
  --ink: #121212; --gray-70: #707070; --gray-40: #C3C3C3; --line: #E1E3E6;
  --paper: #FFFFFF; --paper-warm: #FCFCFA;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
  --font-editorial: "Newsreader", Georgia, serif;
  color-scheme: light dark;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-ui); font-size: 16px; line-height: 1.7; background: var(--paper-warm); color: var(--ink); }
a { color: inherit; text-decoration: none; }
a:hover { color: var(--signal); }
.serif { font-family: var(--font-editorial); }
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

.head { display: flex; justify-content: space-between; align-items: baseline; padding: 32px clamp(24px, 6vw, 96px); border-bottom: 1px solid var(--line); }
.brand { font-size: 26px; font-weight: 600; letter-spacing: -0.01em; }
.tag { font-size: 11px; letter-spacing: 0.1em; color: var(--gray-40); }

.wrap { padding: clamp(48px, 8vw, 96px) clamp(24px, 6vw, 96px); }
.date { font-size: 12px; letter-spacing: 0.08em; color: var(--signal); margin: 0 0 12px; }

.featured { padding-bottom: 64px; border-bottom: 1px solid var(--line); }
.featured h1 { font-family: var(--font-editorial); font-weight: 400; font-size: clamp(40px, 6vw, 64px); line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 20px; max-width: 18ch; }
.dek { font-size: 19px; color: var(--gray-70); max-width: 52ch; margin: 0; }

.list { padding: 48px 0; display: flex; flex-direction: column; gap: 40px; }
.list article { max-width: 60ch; }
.list h2 { font-family: var(--font-editorial); font-weight: 600; font-size: 28px; line-height: 1.2; margin: 0 0 8px; }
.list p { color: var(--gray-70); margin: 0; }

.about { border-top: 1px solid var(--line); padding-top: 32px; max-width: 52ch; color: var(--gray-70); }
.about .date { color: var(--gray-40); }

.foot { padding: 32px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); font-size: 11px; letter-spacing: 0.1em; color: var(--gray-40); }

@media (max-width: 720px) { .head { flex-direction: column; gap: 8px; } }
@media (prefers-color-scheme: dark) {
  :root { --signal: #00A1FF; --ink: #F2F4F6; --gray-70: #9AA4AD; --gray-40: #55606A; --line: #22303F; --paper: #101F30; --paper-warm: #0A1622; }
}`
    }
  };

  /* ---------------- 06 · Café / local business ---------------- */
  T.cafe = {
    id: "cafe", name: "Café / local business", tagline: "Warmth pole — hours in mono, menu, directions",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>Morrow Coffee — 48 Vestry St</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="head">
  <a class="brand serif" href="#">Morrow</a>
  <nav aria-label="Main">
    <a href="#menu">Menu</a>
    <a href="#visit">Visit</a>
    <a href="#story">Story</a>
  </nav>
</header>

<main>
  <section class="hero">
    <p class="mono eyebrow">COFFEE &amp; MORNINGS — 48 VESTRY ST</p>
    <h1>Come as you are.<br>Stay <em>for the quiet.</em></h1>
    <p class="lede">Small-batch coffee, bread from the bakery two doors down, and a room that lets you think. Open every day from seven.</p>
    <div class="hero-actions">
      <a class="btn btn-signal" href="#visit">Find us</a>
      <a class="btn" href="#menu">See the menu</a>
    </div>
  </section>

  <section class="hours mono" id="visit">
    <div><span>MON — FRI</span><b>07:00 — 17:00</b></div>
    <div><span>SAT — SUN</span><b>08:00 — 16:00</b></div>
  </section>

  <section class="menu" id="menu">
    <p class="mono eyebrow">THE SHORT MENU — CHANGES WITH THE SEASON</p>
    <div class="menu-grid">
      <div class="item"><span>Filter, batch brew</span><b class="mono">3.50</b></div>
      <div class="item"><span>Flat white / latte / cappuccino</span><b class="mono">4.20</b></div>
      <div class="item"><span>Espresso, single origin</span><b class="mono">2.80</b></div>
      <div class="item"><span>Cold brew, house blend</span><b class="mono">4.50</b></div>
      <div class="item"><span>Tea — six loose-leaf</span><b class="mono">3.20</b></div>
      <div class="item"><span>Cardamom bun / sourdough toast</span><b class="mono">4.00</b></div>
    </div>
  </section>

  <section class="story" id="story">
    <p class="mono eyebrow">OUR STORY — 01 / 01</p>
    <h2>We opened in 2019 with one idea: a neighbourhood room that smells like coffee and feels like a library.</h2>
    <p class="muted">No laptop bans, no playlist drama. Just good beans, honest prices and chairs that do not wobble. — The Morrows</p>
  </section>
</main>

<footer class="foot">
  <div>
    <p class="mono">48 VESTRY ST · LONDON E1</p>
    <p class="mono">HELLO@MORROWCOFFEE.EXAMPLE</p>
  </div>
  <p class="mono">© 2026 MORROW</p>
</footer>
</body>
</html>`,
      "styles.css": `/* Morrow — warmth pole: serif headlines, warm whites, human voice. */
:root {
  --signal-deep: #002F5B; --signal: #007CFF; --signal-ice: #A0DAF7;
  --ink: #121212; --gray-70: #707070; --gray-40: #C3C3C3; --line: #E1E3E6;
  --paper: #FFFFFF; --paper-warm: #FCFCFA;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-editorial: "Source Serif 4", Georgia, serif;
  color-scheme: light dark;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-ui); font-size: 16px; line-height: 1.65; background: var(--paper-warm); color: var(--ink); }
a { color: inherit; text-decoration: none; }
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
em { font-style: italic; }

.head { display: flex; justify-content: space-between; align-items: center; padding: 24px clamp(24px, 6vw, 96px); }
.brand { font-size: 28px; font-weight: 600; }
.head nav { display: flex; gap: 28px; font-size: 14px; color: var(--gray-70); }
.head nav a:hover { color: var(--signal); }

.hero { padding: clamp(64px, 10vw, 128px) clamp(24px, 6vw, 96px) 72px; max-width: 1000px; }
.eyebrow { font-size: 12px; letter-spacing: 0.12em; color: var(--signal); margin: 0 0 18px; }
.hero h1 { font-family: var(--font-editorial); font-weight: 400; font-size: clamp(48px, 8vw, 92px); line-height: 1.02; letter-spacing: -0.02em; margin: 0 0 24px; }
.hero h1 em { color: var(--signal); }
.lede { font-size: 19px; color: var(--gray-70); max-width: 44ch; margin: 0 0 32px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.btn { display: inline-block; padding: 11px 22px; border-radius: 999px; border: 1px solid var(--line); background: var(--paper); font-weight: 600; font-size: 15px; transition: all 150ms ease; }
.btn-signal { background: var(--signal); border-color: var(--signal); color: #fff; }
.btn-signal:hover { background: var(--signal-bright); }
.btn:hover { border-color: var(--signal); color: var(--signal); }

.hours { display: flex; gap: 48px; flex-wrap: wrap; padding: 28px clamp(24px, 6vw, 96px); background: var(--signal-deep); color: #fff; }
.hours div { display: flex; gap: 16px; font-size: 14px; }
.hours span { color: var(--signal-ice); letter-spacing: 0.08em; }
.hours b { font-weight: 500; }

.menu { padding: 96px clamp(24px, 6vw, 96px); }
.menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 48px; margin-top: 28px; max-width: 820px; }
.item { display: flex; justify-content: space-between; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line); font-size: 15px; }
.item b { color: var(--gray-70); font-weight: 500; }

.story { padding: 96px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); max-width: 860px; }
.story h2 { font-family: var(--font-editorial); font-weight: 400; font-size: clamp(28px, 4vw, 44px); line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 20px; max-width: 26ch; }
.muted { color: var(--gray-70); margin: 0; }

.foot { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; padding: 40px clamp(24px, 6vw, 96px); border-top: 1px solid var(--line); font-size: 12px; letter-spacing: 0.08em; color: var(--gray-70); }
.foot p { margin: 4px 0; }

@media (max-width: 760px) {
  .menu-grid { grid-template-columns: 1fr; }
  .head nav { display: none; }
}
@media (prefers-color-scheme: dark) {
  :root { --signal: #00A1FF; --ink: #F2F4F6; --gray-70: #9AA4AD; --gray-40: #55606A; --line: #22303F; --paper: #101F30; --paper-warm: #0A1622; }
}`
    }
  };

  /* ---------------- 07 · Blank ---------------- */
  T.blank = {
    id: "blank", name: "Blank canvas", tagline: "Start empty — tell the agent exactly what you want",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>My site</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="shell">
    <h1>Your site starts here</h1>
    <p>Describe what you want to build and the Vecode agent will write the files.</p>
  </main>
</body>
</html>`,
      "styles.css": `/* Blank canvas — the agent builds from here. */
:root {
  --signal: #007CFF;
  --ink: #121212; --gray-70: #707070; --line: #E1E3E6; --paper-warm: #FCFCFA;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  --font-editorial: Georgia, serif;
  color-scheme: light dark;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--font-ui); background: var(--paper-warm); color: var(--ink); line-height: 1.6; }
.shell { max-width: 640px; margin: 0 auto; padding: 96px 24px; }
h1 { font-family: var(--font-editorial); font-weight: 400; font-size: 44px; margin: 0 0 12px; }
p { color: var(--gray-70); }
@media (prefers-color-scheme: dark) {
  :root { --signal: #00A1FF; --ink: #F2F4F6; --gray-70: #9AA4AD; --line: #22303F; --paper-warm: #0A1622; }
}`
    }
  };

  window.Vecode = window.Vecode || {};
  window.Vecode.Templates = Object.keys(T).map((k) => T[k]);
})();
