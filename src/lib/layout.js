// The frame around every page: header, menu, footer, <head>.
import { esc } from "./util.js";
import { site } from "./data.js";

/* ---------- shared chrome ---------- */
const NAV = site.menu.map((m) => [m.link, m.label]);
export const header = (active) => `
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

export const escrow = `<span class="esc"><img src="/assets/svg/escrow2.svg" alt="Escrow.com"></span>`;
export const footer = `
<footer class="d-footer d-only">
<div class="d-foot-l" aria-hidden="true"></div>
<div class="d-foot-c"><div class="foot-mail"><a href="mailto:${site.email}" class="mj-email">${site.email}</a><i aria-hidden="true"></i></div>
<div class="d-tag"><span style="color:#8D8A82">${site.footerTagDesktop[0]}</span><span style="color:#848078">${site.footerTagDesktop[1]} ${escrow}</span></div>
<p class="copy">© ${site.year} Midjump</p></div>
<div class="d-foot-r" aria-hidden="true"></div>
</footer>
<footer class="m-footer m-only">
<div class="foot-mail"><a href="mailto:${site.email}" class="mj-email">${site.email}</a><i aria-hidden="true"></i></div>
<div class="foot-tag"><span style="color:#8D8A82">${site.footerTagPhone[0]}</span><span style="color:#848078">${site.footerTagPhone[1]} ${escrow}</span></div>
<p class="copy">© ${site.year} Midjump</p>
</footer>`;

export const layout = ({ title, description, urlPath, body, active, noindex, extraHead = "", ogImage }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${site.url}${urlPath}">
${noindex ? '<meta name="robots" content="noindex">' : ""}
<meta property="og:type" content="website"><meta property="og:site_name" content="Midjump">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${site.url}${urlPath}">
${ogImage ? `<meta property="og:image" content="${site.url}${ogImage}"><meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
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

