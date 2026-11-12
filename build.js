// Static site builder: node build.js  ->  dist/
import fs from "node:fs";
import path from "node:path";

const SITE = "https://midjump.com";
const YEAR = 2026;
const root = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(root, "dist");
const domains = JSON.parse(fs.readFileSync(path.join(root, "src/data/domains.json"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const write = (rel, data) => { const f = path.join(dist, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
const copyDir = (a, b) => { fs.mkdirSync(b, { recursive: true }); for (const e of fs.readdirSync(a, { withFileTypes: true })) e.isDirectory() ? copyDir(path.join(a, e.name), path.join(b, e.name)) : fs.copyFileSync(path.join(a, e.name), path.join(b, e.name)); };

/* ---------- shared chrome ---------- */
const NAV = [["/domains", "Domain Portfolio"], ["/contact", "Contact"]];
const header = (active) => `
<header class="d-header d-only">
<div class="d-hcol">
<a class="d-logo" href="/" aria-label="Midjump home"><img src="/assets/svg/logo3.svg" alt="midjump"></a>
<nav class="mj-nav" aria-label="Site"><span class="mj-navline" aria-hidden="true"></span>${NAV.map(([h, l]) => `<a href="${h}" class="mj-navlink"${h === active ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
</div>
</header>
<nav class="mj-side d-only" aria-label="Site" aria-hidden="true"><a href="/" aria-label="Midjump home"><img class="mj-side-mark" src="/assets/svg/logo.svg" alt=""></a>${NAV.map(([h, l]) => `<a href="${h}" class="mj-side-link"${h === active ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
<header class="mj-header m-only">
<div class="mj-hcol"><a href="/" aria-label="Midjump home" style="line-height:0"><img class="mj-hlogo" src="/assets/svg/logo3.svg" alt="midjump"></a>
<button type="button" class="mj-menu-btn" data-open="0" aria-expanded="false" aria-controls="mj-menu" aria-label="Open menu"><span class="bar bar1" aria-hidden="true"></span><span class="bar bar2" aria-hidden="true"></span><span class="bar bar3" aria-hidden="true"></span></button></div>
<nav id="mj-menu" class="mj-menu" aria-label="Site">${NAV.map(([h, l]) => `<a href="${h}"${h === active ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
</header>`;

const escrow = `<span class="esc"><img src="/assets/svg/escrow2.svg" alt="Escrow.com"></span>`;
const footer = `
<footer class="d-footer d-only">
<div class="d-foot-l" aria-hidden="true"></div>
<div class="d-foot-c"><div class="foot-mail"><a href="mailto:hello@midjump.com" class="mj-email">hello@midjump.com</a><i aria-hidden="true"></i></div>
<div class="d-tag"><span style="color:#8D8A82">Curated digital identities,</span><span style="color:#848078">secured through ${escrow}</span></div>
<p class="copy">© ${YEAR} Midjump</p></div>
<div class="d-foot-r" aria-hidden="true"></div>
</footer>
<footer class="m-footer m-only">
<div class="foot-mail"><a href="mailto:hello@midjump.com" class="mj-email">hello@midjump.com</a><i aria-hidden="true"></i></div>
<div class="foot-tag"><span style="color:#8D8A82">Curated digital identities</span><span style="color:#848078">Secured through ${escrow}</span></div>
<p class="copy">© ${YEAR} Midjump</p>
</footer>`;

const layout = ({ title, description, urlPath, body, active, noindex, extraHead = "", ogImage }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${urlPath}">
${noindex ? '<meta name="robots" content="noindex">' : ""}
<meta property="og:type" content="website"><meta property="og:site_name" content="Midjump">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${SITE}${urlPath}">
${ogImage ? `<meta property="og:image" content="${SITE}${ogImage}"><meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<meta name="theme-color" content="#F3F2EE">
<link rel="preload" href="/assets/fonts/FinlandicaText-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
${extraHead}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header(active)}
<main id="main">${body}</main>
${footer}
<script src="/assets/site.js" defer></script>
</body>
</html>
`;

/* ---------- gallery ---------- */
const CATS = ["AI", "Cloud", "Security", "Data", "Ventures"];
const groups = Object.fromEntries(CATS.map((c) => [c, domains.filter((d) => d.categories.includes(c)).map((d) => d.slug)]));
const card = (d, k) => {
  const v = k === "p" ? d.phone : d.desk;
  const style = `--s:${v.scale};--y:${v.y};--x:${v.x || "0%"}`;
  return `<a href="/domains/${d.slug}" class="k-card" data-slug="${d.slug}" style="${style}"><span class="k-panel"><img class="k-logo" src="${d.galleryLogo}" alt="${esc(d.name)} logo" loading="lazy" decoding="async"></span><span class="k-name">${esc(d.base)}<span class="k-ext">${esc(d.ext)}</span></span></a>`;
};
const gallery = () => {
  const dTabs = [["All", domains.length], ...CATS.map((c) => [c, groups[c].length])]
    .map(([c, n], i) => `<button type="button" role="tab" class="g-tab${i ? "" : " is-on"}" data-cat="${c}" aria-selected="${i ? "false" : "true"}">${c} <span class="g-count">${n}</span></button>`).join("");
  const pTabs = ["All", ...CATS].map((c, i) => `<button type="button" role="tab" class="p-tab${i ? "" : " is-on"}" data-cat="${c}" aria-selected="${i ? "false" : "true"}">${c}</button>`).join("");
  const phoneOrder = [...domains].sort((a, b) => a.order2col - b.order2col);
  const body = `
<div class="d-only d-frame">
<section class="g-title"><h1 class="mj-fade">Domain Collection</h1></section>
<div class="g-tabs" role="tablist" aria-label="Filter by category">${dTabs}</div>
<section class="dg-wrap" aria-label="Domains"><div class="dg">${domains.map((d) => card(d, "d")).join("")}</div></section>
</div>
<div class="m-only">
<section class="mj-title"><h1 class="mj-fade">Domain Collection</h1></section>
<div class="mj-tabs-band"><div class="mj-tabs" role="tablist" aria-label="Filter by category">${pTabs}</div></div>
<section class="pg-wrap" aria-label="Domains"><div class="pg">${phoneOrder.map((d) => card(d, "p")).join("")}</div>
<button type="button" class="k-top" aria-label="Back to top"><svg viewBox="0 0 11 7" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 6l4.5-4.5L10 6"/></svg><span>Back to top</span></button></section>
</div>
<script type="application/json" id="mj-groups">${JSON.stringify(groups)}</script>`;
  return layout({ title: "Domain Collection | Midjump", description: "Premium, brandable domain names for AI, cloud, security, data and ventures, each presented with custom logo concepts.", urlPath: "/domains", body, active: "/domains" });
};

/* ---------- output ---------- */
fs.rmSync(dist, { recursive: true, force: true });
copyDir(path.join(root, "src/assets"), path.join(dist, "assets"));
fs.copyFileSync(path.join(root, "src/styles/site.css"), path.join(dist, "assets/site.css"));
fs.copyFileSync(path.join(root, "src/js/site.js"), path.join(dist, "assets/site.js"));
write("domains/index.html", gallery());
write("index.html", `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Midjump (rebuild in progress)</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F3F2EE;color:#1A1A18;font:300 16px/1.6 system-ui,sans-serif}</style></head><body><p>Midjump, rebuild in progress. <a href="/domains">Domain collection</a></p></body></html>`);
console.log("built", fs.readdirSync(dist).length, "entries");
