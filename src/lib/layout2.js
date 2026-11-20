// The frame around every page in the new design (2026 re-skin): <head>, header (with the phone menu), footer.
// Pages still on the old design use layout.js until they are rebuilt.
import { esc } from "./util.js";
import { site } from "./data.js";

const NAV = site.menu.map((m) => [m.link, m.label]);
const navLinks = (active) => NAV.map(([h, l]) => `<a href="${h}"${h === active ? ' aria-current="page"' : ""}>${esc(l)}</a>`).join("");

export const header2 = (active) => `
<header class="hdr">
<div class="wrap"><div class="hdr-in">
<span class="hdr-line" aria-hidden="true"></span>
<a class="hdr-logo" href="/" aria-label="Midjump home"><img src="/assets/svg/logo-v4.svg" alt="midjump" width="113" height="44"></a>
<nav class="nav" aria-label="Site">${navLinks(active)}</nav>
<button type="button" class="pmb" aria-label="Menu" aria-expanded="false" aria-controls="pmm" data-open="0"><i class="b1"></i><i class="b2"></i><i class="b3"></i></button>
</div></div>
<div class="pmo" aria-hidden="true"></div>
<nav class="pmm" id="pmm" aria-label="Site">${navLinks(active)}</nav>
</header>`;

// The landing silk, repeated faintly behind the top of inner pages (gallery, domain, contact).
export const backdrop = `<div class="bd" aria-hidden="true"><div class="wrap"><div class="bd-box"><img class="bd-img" src="/assets/graphics/silk.jpg" alt=""></div></div></div>`;

// Round "back to top" button (tablet + phone; shows when scrolling back up after 1200px).
export const backToTop = `<button type="button" class="ptop" aria-label="Back to top"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3.5"/><path d="M3.5 7.5 8 3l4.5 4.5"/></svg></button>`;

export const escrowMark = `<span class="esc" role="img" aria-label="Escrow.com"></span>`;

export const footer2 = `
<footer class="foot">
<div class="wrap">
<div class="foot-main">
<img class="foot-mark" src="/assets/graphics/mark.svg" alt="" aria-hidden="true">
<a href="mailto:${site.email}" class="fmail">${site.email}</a>
<p class="foot-tag"><span>${esc(site.footerTagDesktop[0])}</span><span>${esc(site.footerTagDesktop[1])} ${escrowMark}</span></p>
</div>
<div class="foot-bar"><span class="foot-bar-line" aria-hidden="true"></span><span class="foot-copy">© ${site.year} Midjump</span>${NAV.map(([h, l]) => `<a href="${h}" class="fl">${esc(l)}</a>`).join("")}</div>
</div>
</footer>`;

export const layout2 = ({ title, description, urlPath, body, active = "", page = "", noindex, extraHead = "", ogImage }) => `<!doctype html>
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
<meta name="theme-color" content="#F2F3F5">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/svg/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/svg/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/FinlandicaText-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Questrial-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/v2.css">
${extraHead}
</head>
<body class="v2${page ? " pg-" + page : ""}">
<a class="skip" href="#main">Skip to content</a>
${header2(active)}
<main id="main">${body}</main>
${footer2}
<script src="/assets/v2.js" defer></script>
</body>
</html>
`;
