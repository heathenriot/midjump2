// Domain Collection page (/domains). Words + card order: content/gallery.json. Logo placement: content/logo-fit.json.
import { esc, readJson } from "../lib/util.js";
import { domains, galleryText as G, CATEGORIES } from "../lib/data.js";
import { layout2, backdrop, backToTop } from "../lib/layout2.js";
import { logoTf, logoSrc, fitOf } from "../lib/cards.js";

const bySlug = Object.fromEntries(domains.map((d) => [d.slug, d]));
for (const s of G.order) if (!bySlug[s]) throw new Error(`content/gallery.json "order" lists "${s}" but there's no content/domains/${s}.json. Check the spelling.`);
const listed = new Set(G.order);
const missing = domains.filter((d) => !listed.has(d.slug)).map((d) => d.slug);
if (missing.length) throw new Error(`content/gallery.json "order" is missing: ${missing.join(", ")}. Add them, or they won't appear on the gallery.`);
const cards = G.order.map((s) => bySlug[s]);

// Phone, one card per row: the logo is placed by its ink box (design/data/logo-ink.json) on a wide 16:9 plate,
// on the same baseline as the desktop cards. FIX nudges a few logos [x, y] in %.
const INK = readJson("design/data/logo-ink.json").logos;
const FIX = { Anthropize: [0, 1.1], HitPrompt: [0, 0.9], CloudAider: [0, 0.9], Throughlane: [0, 0.7], Sanctional: [0, 0.7], eHustles: [-0.7, -4.6], GenoFold: [0, -5.2], Cloudveyor: [0, -2.4] };
const ONE_COL_LOGO = 0.8, LOGO_SIZE = 0.93, T0 = 0.18571;
const oneCol = (d) => {
  const m = INK[d.base]; if (!m) return "";
  const [W, H] = m, [S, k, o] = fitOf(d), s = S * o;
  const K = Math.min(0.76 / W, 0.66 / H) * LOGO_SIZE * s * ONE_COL_LOGO;
  const yd = (T0 - s * k) / 0.66, fx = FIX[d.base] || [0, 0];
  const my = (0.015 + LOGO_SIZE * yd * 0.66) * ONE_COL_LOGO - 0.024 + fx[1] / 100;
  return `--w1:${(W * K * 100).toFixed(3)}%;--mx1:${fx[0].toFixed(3)}%;--my1:${(my * 100).toFixed(3)}%`;
};

// Phone, one per row: each card's soft glow sits in its own spot, worked out from the domain name
// (so it never changes between visits). Change GLOW_SEED to reshuffle them all.
const GLOW_SEED = 1;
const rnd = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
const glow = (d) => { const r = (k) => rnd(d.base + "|" + GLOW_SEED + "|" + k); return `--gx:${Math.round(r("x") * 100)}%;--gy:${Math.round(-25 + r("y") * 150)}%;--ga:${(0.45 + r("a") * 0.55).toFixed(2)}`; };

const card = (d) => {
  const tf = logoTf(d), src = logoSrc(d), one = oneCol(d);
  return `<a href="/domains/${d.slug}" class="pol" style="${glow(d)}" data-cats="${esc(d.categories.join("|"))}"><span class="pol-plate"><img src="${src}" alt="${esc(d.name)} logo" style="transform:${tf};${one}" loading="lazy" decoding="async"></span><span class="pol-name">${esc(d.base)}<span>${esc(d.ext)}</span></span></a>`;
};

const icon1 = `<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="2.5" y="2.5" width="13" height="5.5" rx="1.2"/><rect x="2.5" y="10" width="13" height="5.5" rx="1.2"/></svg>`;
const icon2 = `<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="2.5" y="2.5" width="5.5" height="5.5" rx="1.2"/><rect x="10" y="2.5" width="5.5" height="5.5" rx="1.2"/><rect x="2.5" y="10" width="5.5" height="5.5" rx="1.2"/><rect x="10" y="10" width="5.5" height="5.5" rx="1.2"/></svg>`;

export const gallery = () => {
  const tabs = [["All", cards.length], ...CATEGORIES.map((c) => [c, cards.filter((d) => d.categories.includes(c)).length])]
    .map(([c, n], i) => `<button type="button" role="tab" class="tab${i ? "" : " on"}" data-cat="${esc(c)}" aria-selected="${i ? "false" : "true"}">${i ? esc(c) : `<span class="tl-d">All</span><span class="tl-m">${esc(G.allLabelPhone || "All")}</span>`} <span class="ct">${n}</span></button>`).join("");
  const body = `
${backdrop}
<section class="gal-top" aria-labelledby="ttl">
<div class="wrap">
<div class="pttl"><h1 id="ttl" class="pg-h1">${esc(G.heading)}</h1><div class="pvs" role="group" aria-label="Cards per row"><button type="button" class="on" data-vw="1" aria-label="One card per row" aria-pressed="true">${icon1}</button><button type="button" data-vw="2" aria-label="Two cards per row" aria-pressed="false">${icon2}</button></div></div>
<div class="tabs" role="tablist" aria-label="Filter by category">${tabs}</div>
</div>
</section>
<section class="gal" aria-label="Domains">
<div class="wrap"><div class="g4 gal-grid v1">${cards.map(card).join("")}</div></div>
</section>
${backToTop}`;
  return layout2({ title: G.title, description: G.description, urlPath: "/domains", body, active: "/domains", page: "gallery" });
};
