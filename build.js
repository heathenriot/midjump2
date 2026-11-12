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


/* ---------- contact ---------- */
const contact = () => {
  const body = `
<div class="c-frame">
<section class="c-title d-only"><h1 class="mj-fade">Portfolio Inquiries</h1></section>
<section class="mj-title m-only"><h1 class="mj-fade">Portfolio Inquiries</h1></section>
<section class="c-form" aria-label="Contact form"><div class="c-inner">
<p class="c-intro">For acquisition inquiries or portfolio details, please use the form below and specify the domains of interest.</p>
<div class="c-wrap">
<form class="mj-form" id="mj-contact" data-key="13657328-3220-44e4-b42f-0f0e138bd0b6">
<input class="mj-hp" type="text" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="mj-field"><input class="mj-input" type="text" name="firstName" placeholder="First name" aria-label="First name" autocomplete="given-name" required></label>
<label class="mj-field"><input class="mj-input" type="text" name="lastName" placeholder="Last name" aria-label="Last name" autocomplete="family-name" required></label>
<label class="mj-field"><input class="mj-input" type="email" name="email" placeholder="Email address" aria-label="Email address" autocomplete="email" required></label>
<label class="mj-field"><textarea class="mj-input" name="message" rows="4" placeholder="Enter your message" aria-label="Message" required></textarea></label>
<div class="c-actions"><button type="submit" class="mj-send"><span>Send inquiry</span><svg class="mj-chev" viewBox="0 0 242.333 242.333" aria-hidden="true"><path d="M80 38 L164 121.2 L80 204.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>
<p class="mj-err" role="alert" hidden>Something went wrong. Please email hello@midjump.com instead.</p>
</form>
<div class="mj-note" role="status" aria-live="polite"><p class="t">Message received.</p><p class="s">Thank you for your inquiry.</p><button type="button" class="mj-again">Send another</button></div>
</div>
</div></section>
</div>`;
  return layout({ title: "Contact Midjump | Portfolio Inquiries", description: "Inquire about acquiring a Midjump domain, or ask for portfolio details. Purchases are secured through Escrow.com.", urlPath: "/contact", body, active: "/contact" });
};


/* ---------- landing ---------- */
const MQ = [["anthropize", 0.63], ["enforcing", 0.53], ["nephele", 0.44], ["reinforcing", 0.64], ["guardrailed", 0.65], ["triaged", 0.45], ["crossmodality", 0.77], ["modulated", 0.60]];
const FAQ_D = [
  ["01", "How does the purchase process work?", "Purchases are completed through Atom.com's escrow service, which handles both payment and domain transfer. For multi-domain acquisitions or custom arrangements, transactions can be facilitated through Escrow.com."],
  ["02", "Are the logo concepts included?", "Each domain is presented with custom logo concepts, which are available to buyers on request."],
  ["03", "Do you offer payment plans?", "Payment plans are available for select domains and are facilitated through Atom.com. Contact Midjump with the domain of interest and your preferred payment timeline."],
];
const FAQ_M = [
  ["01", "How does purchasing work?", "Payment and domain transfer are handled through Atom.com's escrow service. Multi-domain or custom deals can go through Escrow.com."],
  ["02", "Are logo concepts included?", "Each domain comes with custom logo concepts, available to buyers on request."],
  ["03", "Are payment plans available?", "For select domains, through Atom.com. Contact Midjump with the domain and your preferred timeline."],
];
const mqItems = (kind) => [0, 1].map((copy) => MQ.map(([slug, ink]) => {
  const d = domains.find((x) => x.slug === slug);
  const slot = kind === "d" ? ` style="width:${(220 * ink + 66).toFixed(1)}px"` : "";
  return `<a href="/domains/${slug}" class="mq-item"${slot}${copy ? ' aria-hidden="true" tabindex="-1"' : ""}><span class="mq-logo"><img src="/assets/svg/m_${d.atomName === "CrossModality" ? "CrossModality" : d.atomName}.svg" alt="" loading="lazy" decoding="async"></span><span class="mq-name">${esc(d.base)}<span class="mq-ext">${esc(d.ext)}</span></span></a>`;
}).join("")).join("");
const arrow = `<svg viewBox="0 0 242.333 242.333" aria-hidden="true"><path d="M162 38 L78 121.2 L162 204.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
const landing = () => {
  const body = `
<div class="c-frame d-only l-d">
<section class="l-hero"><h1 class="mj-fade" style="text-align:center">Digital Identities.<br>Built for distinction.</h1>
<p class="mj-fade mj-d1" style="text-align:center">Midjump is a collection of signature domain names,<br>curated for startups, enterprises, and emerging ventures.</p>
<div class="mj-fade mj-d2 l-cta" style="justify-content:center"><a href="/domains" class="mj-hero-btn">Explore the portfolio${arrow}</a></div></section>
<section class="l-band" aria-labelledby="mq-label-d"><h2 id="mq-label-d" class="mj-row-label" style="padding-bottom:44px">Selected domains</h2>
<p class="mq-hint" aria-hidden="true">&lsaquo;&ensp;Drag to browse&ensp;&rsaquo;</p>
<div class="mq"><div class="mq-vp" data-secs="45"><div class="mq-track">${mqItems("d")}</div></div></div></section>
<section class="l-qa" aria-labelledby="qa-label-d"><h2 id="qa-label-d" class="mj-row-label">Acquiring a domain</h2>
<dl>${FAQ_D.map(([n, q, a]) => `<div><dt><span class="n" aria-hidden="true">${n}</span><span>${esc(q)}</span></dt><dd>${esc(a)}</dd></div>`).join("")}</dl>
<div class="l-end" aria-hidden="true"></div></section>
</div>
<div class="m-only l-m">
<section class="l-hero"><h1 class="mj-fade">Digital<br>Identities.<br>Built for<br>distinction.</h1>
<p class="mj-fade mj-d1">Midjump is a collection of signature domain names, curated for startups, enterprises, and emerging ventures.</p>
<a href="/domains" class="mj-cta mj-fade mj-d2"><span>Explore the portfolio</span>${arrow}</a></section>
<section class="l-band" aria-labelledby="mq-label-m"><h2 id="mq-label-m" class="row-label" style="padding-bottom:31px">Selected domains</h2>
<p class="mq-hint" aria-hidden="true">&lsaquo;&ensp;Drag to browse&ensp;&rsaquo;</p>
<div class="mq-vp" data-secs="20"><div class="mq-track">${mqItems("m")}</div></div></section>
<section class="l-qa" aria-labelledby="qa-label-m"><h2 id="qa-label-m" class="row-label">Acquiring a domain</h2>
<div class="faq-list">${FAQ_M.map(([n, q, a], i) => `<div class="faq${i ? "" : " is-open"}"><button type="button" class="faq-q" aria-expanded="${i ? "false" : "true"}"><span class="faq-qt"><span class="faq-n" aria-hidden="true">${n}</span><span>${esc(q)}</span></span><span class="faq-ic" aria-hidden="true"></span></button><div class="faq-a"><div class="faq-ai"><p>${esc(a)}</p></div></div></div>`).join("")}</div>
<div class="l-end" aria-hidden="true"></div></section>
</div>`;
  return layout({ title: "Midjump | Digital Identities. Built for distinction.", description: "Midjump is a collection of signature domain names, curated for startups, enterprises, and emerging ventures.", urlPath: "/", body, active: "" });
};


/* ---------- domain pages ---------- */
const WEB3_KEY = "13657328-3220-44e4-b42f-0f0e138bd0b6";
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const usage = Object.fromEntries(domains.map((d) => [d.slug, 0]));
const picks = {};
for (const d of domains) {
  const pool = domains.filter((x) => x.slug !== d.slug && x.categories.some((c) => d.categories.includes(c)));
  const chosen = [];
  for (const t of ["A", "B", "C"]) {
    let cand = pool.filter((x) => x.tier === t && !chosen.includes(x));
    if (!cand.length) cand = pool.filter((x) => !chosen.includes(x));
    cand.sort((a, b) => usage[a.slug] - usage[b.slug] || hash(d.slug + a.slug) - hash(d.slug + b.slug));
    if (cand[0]) { chosen.push(cand[0]); usage[cand[0].slug]++; }
  }
  picks[d.slug] = chosen;
}
const trim = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");
const firstSentences = (s, n) => { const m = s.match(/^.*?[.!?](\s|$)/); return trim((m ? m[0] : s).trim(), n); };
const chev = `<svg viewBox="0 0 10 10"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
const backSvg = `<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M6.5 2 L3.5 5 L6.5 8" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
const domainPage = (d) => {
  const fx = (i) => d.logoFx[i] || {};
  const slides = d.logos.map((l, i) => { const f = fx(i); return `<div class="dm-slide"><img src="${l}" alt="${esc(d.name)} logo concept ${i + 1}" style="--cy:${f.y || "0%"};--cs:${f.scale || 1};--my:${f.my || f.y || "0%"};--ms:${f.mscale || f.scale || 1}"${i ? ' loading="lazy"' : ""} decoding="async"></div>`; }).join("");
  const rel = picks[d.slug].map((r) => `<a href="/domains/${r.slug}" class="dm-rel"><span class="dm-rel-img"><img src="${r.galleryLogo}" alt="${esc(r.name)} logo" loading="lazy" decoding="async" style="--s:${r.desk.scale};--y:${r.desk.y}"></span><span class="dm-rel-name">${esc(r.base)}<span class="dm-rel-ext">${esc(r.ext)}</span></span></a>`).join("");
  const cat0 = d.categories[0].toLowerCase();
  const desc = trim(`${d.name} is available for acquisition. ${firstSentences(d.overview[1] || d.overview[0], 120)}`, 158);
  const body = `
<div class="c-frame">
<section class="dm-name"><h1 class="mj-fade">${esc(d.base)}<span class="dm-ext">${esc(d.ext)}</span></h1><span class="k-lab dm-cats mj-fade mj-d1">${d.categories.join(" · ")}</span></section>
<section class="dm-view${d.logos.length < 2 ? " dm-single" : ""}" aria-label="Logo concepts"><div class="dm-vin">
<div class="mj-fade dm-viewer"><div class="dm-track">${slides}</div><div class="dm-fadeL" aria-hidden="true"></div><div class="dm-fadeR" aria-hidden="true"></div></div>
<div class="dm-arrows"><button type="button" class="dm-arrow dm-prev" aria-label="Previous logo concept"><svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><path d="M8.5 1.5 2 8l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2"></path></svg></button><button type="button" class="dm-arrow dm-next" aria-label="Next logo concept"><svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><path d="M1.5 1.5 8 8l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2"></path></svg></button></div>
</div></section>
<div class="dm-acqwrap"><section class="dm-row dm-acq" aria-labelledby="acq-h"><h2 id="acq-h" class="dm-label">Available for acquisition</h2>
<div class="c-wrap"><form class="dm-form mj-form" data-key="${WEB3_KEY}" data-domain="${esc(d.name)}">
<input class="mj-hp" type="text" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
<p class="dm-sent">${esc(d.name)} can be purchased securely via Atom.com, or you can contact Midjump directly to arrange a transaction through Escrow.com.</p>
<div class="dm-fields">
<label class="mj-field"><input class="mj-input" type="text" name="name" autocomplete="name" placeholder="Name" aria-label="Name" required></label>
<label class="mj-field"><input class="mj-input" type="email" name="email" autocomplete="email" placeholder="Email" aria-label="Email" required></label>
<label class="mj-field"><textarea class="mj-input" name="message" rows="3" placeholder="Message" aria-label="Message" required></textarea></label>
<div class="dm-btns"><a href="https://www.atom.com/name/${esc(d.atomName)}" class="dm-atom" rel="noopener" target="_blank"><span>View on Atom.com</span></a>
<button type="submit" class="mj-send"><span>Send inquiry</span><svg class="mj-chev" viewBox="0 0 242.333 242.333" aria-hidden="true"><path d="M80 38 L164 121.2 L80 204.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>
<p class="mj-err" role="alert" hidden>Something went wrong. Please email hello@midjump.com instead.</p>
</div></form>
<div class="mj-note" role="status" aria-live="polite"><p class="t">Message received.</p><p class="s">Thank you for your inquiry.</p><button type="button" class="mj-again">Send another</button></div>
</div></section></div>
<div class="dm-aboutwrap"><section class="dm-row dm-about" aria-labelledby="about-h"><h2 id="about-h" class="dm-label">About the domain</h2><div class="dm-paras">${d.overview.map((p) => `<p class="dm-para">${esc(p)}</p>`).join("")}</div></section></div>
<section class="dm-moresec" aria-labelledby="more-h">
<div class="dm-morehead"><a href="/domains" class="dm-back dm-back-top">${backSvg}Back to portfolio</a><h2 id="more-h"><a href="/domains?c=${cat0}" class="dm-more">More from the collection<span class="dm-more-arrow" aria-hidden="true">${chev}</span></a></h2></div>
<div class="dm-relgrid">${rel}</div>
<a href="/domains" class="dm-back dm-back-end">${backSvg}Back to portfolio</a>
</section>
</div>`;
  return layout({ title: `${d.name} | Premium Domain | Midjump`, description: desc, urlPath: `/domains/${d.slug}`, body, active: "/domains" });
};

/* ---------- output ---------- */
fs.rmSync(dist, { recursive: true, force: true });
copyDir(path.join(root, "src/assets"), path.join(dist, "assets"));
fs.copyFileSync(path.join(root, "src/styles/site.css"), path.join(dist, "assets/site.css"));
fs.copyFileSync(path.join(root, "src/js/site.js"), path.join(dist, "assets/site.js"));
write("domains/index.html", gallery());
write("contact/index.html", contact());
for (const d of domains) write(`domains/${d.slug}/index.html`, domainPage(d));
write("index.html", landing());
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["/", "/domains", "/contact", ...domains.map((d) => "/domains/" + d.slug)].map((u) => `<url><loc>${SITE}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
if (process.env.SHOW_PICKS) for (const d of domains) console.log(`| ${d.name} | ${d.categories.join(" · ")} | ${picks[d.slug].map((r) => r.name).join(", ")} |`);
console.log("built", fs.readdirSync(dist).length, "entries");
