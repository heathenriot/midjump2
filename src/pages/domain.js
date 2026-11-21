// One page per domain (/domains/<name>). Also decides the "More from the collection" picks.
// Words: content/domains/<name>.json (overview[0] = About, overview[1] = Ideal for). Look: src/styles/v2-domain.css.
import { esc, escEm, plain } from "../lib/util.js";
import { domains, site } from "../lib/data.js";
import { layout2, backdrop, breadcrumbs } from "../lib/layout2.js";
import { card } from "../lib/cards.js";
import { iconAbout, iconIdeal } from "../lib/domain-icons.js";

/* ---------- "More from the collection": 4 related domains (shared category), spread evenly ---------- */
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const usage = Object.fromEntries(domains.map((d) => [d.slug, 0]));
export const picks = {};
for (const d of domains) {
  const pool = domains.filter((x) => x.slug !== d.slug && x.categories.some((c) => d.categories.includes(c)));
  const chosen = [];
  for (const t of ["A", "B", "C", null]) {
    let cand = pool.filter((x) => (t === null || x.tier === t) && !chosen.includes(x));
    if (!cand.length) cand = pool.filter((x) => !chosen.includes(x));
    cand.sort((a, b) => usage[a.slug] - usage[b.slug] || hash(d.slug + a.slug) - hash(d.slug + b.slug));
    if (cand[0]) { chosen.push(cand[0]); usage[cand[0].slug]++; }
  }
  picks[d.slug] = chosen;
}

const trim = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");
const firstSentences = (s, n) => { const m = s.match(/^.*?[.!?](\s|$)/); return trim((m ? m[0] : s).trim(), n); };
const pct = (v) => parseFloat(v) || 0;

/* Logo concepts in the carousel. Each logo's y / scale come from the domain file ("carouselTweaks"); the design
   then scales them per screen size, and makes every logo after the first a touch smaller/lower (calibrated on Triaged.si). */
const slideVars = (t = {}, k) => {
  const y = pct(t.y), s = Number(t.scale) || 1, extra = k > 0;
  const dy = y + (extra ? 2.5 : 0), ds = s * 1.14 * (extra ? 0.84 * 1.15 : 1);   // desktop
  const ts = s * 1.14 * (extra ? 1.07 : 1);                                        // tablet
  const ps = s * 1.14 * (extra ? 0.9 * 1.12 : 1);                                  // phone
  return `--dy:${dy}%;--ds:${ds.toFixed(3)};--ty:${y}%;--ts:${ts.toFixed(3)};--py:${y}%;--ps:${ps.toFixed(3)}`;
};
const chevL = `<svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><path d="M8.5 1.5 2 8l6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
const chevR = `<svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><path d="M1.5 1.5 8 8l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
const catLink = (c) => `/domains?category=${encodeURIComponent(c)}`;

export const domainPage = (d) => {
  const tweaks = d.logoFx || [];
  const many = d.logos.length > 1;
  const alpha = (u) => u.replace("/assets/svg/", "/assets/logo-alpha/").replace(/\.svg$/, ".png");
  const slides = d.logos.map((l, k) => `<div class="slide${k ? " off" : ""}"><img src="${alpha(l)}" alt="${esc(d.name)} logo concept ${k + 1}" style="${slideVars(tweaks[k], k)}"${k ? ' loading="lazy"' : ""} decoding="async"></div>`).join("");
  const dots = d.logos.map((_, k) => `<button type="button" class="dot${k ? "" : " on"}" aria-label="Show logo concept ${k + 1}"></button>`).join("");
  const [about = "", ideal = ""] = d.overview;
  const rel = picks[d.slug].map((r) => card(r)).join("");
  const desc = trim(`${d.name} is a premium domain name available for acquisition. ${firstSentences(plain(ideal || about), 120)}`, 158);

  const body = `
${backdrop}
<div class="dpg"><div class="shl ctl">
<section aria-labelledby="dname">
<div class="wrap d-top">
<h1 id="dname">${esc(d.base)}<span class="dext">${esc(d.ext)}</span></h1>
<div class="d-tags" aria-label="Categories">${d.categories.map((c) => `<a href="${catLink(c)}" class="tag">${esc(c)}</a>`).join("")}</div>
</div></section>
<section aria-label="Logo concepts and acquisition">
<div class="wrap d-main">
<div class="duo">
<div class="lcol">
<div class="stage${many ? "" : " one"}">
<div class="plate">
<div class="track">${slides}</div>
<div class="efl" aria-hidden="true"></div><div class="efr" aria-hidden="true"></div>
</div>
<div class="ovl">
<div class="dots">${dots}</div>
<div class="ovl-arrs"><button type="button" class="arr sm pv" aria-label="Previous logo concept">${chevL}</button><button type="button" class="arr sm nx" aria-label="Next logo concept">${chevR}</button></div>
</div>
</div>
<section class="tc" aria-labelledby="about-h"><h2 id="about-h" class="tl"><span class="ti" aria-hidden="true">${iconAbout}</span>About the domain</h2><p class="tp">${escEm(about)}</p></section>
${ideal ? `<section class="tc ti-line" aria-labelledby="ideal-h"><h3 id="ideal-h" class="tl"><span class="ti" aria-hidden="true">${iconIdeal}</span>Ideal for</h3><p class="tp">${escEm(ideal)}</p></section>` : ""}
</div>
<div class="pdv" aria-hidden="true"></div>
<section class="navy lfx-static" aria-labelledby="acq-h">
<h2 id="acq-h" class="nl"><span class="nlt">Available for acquisition</span></h2>
<form class="d-form" data-key="${site.formKey}" data-domain="${esc(d.name)}">
<input class="hp" type="text" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
<p class="ns"><span class="nb nd">${esc(d.name)}</span> can be purchased securely via <span class="nb">Atom.com</span>, or you can contact Midjump directly to arrange a transaction through <span class="nb">Escrow.com</span>.</p>
<div class="flds">
<label class="fld"><input class="inp" type="text" name="name" autocomplete="name" placeholder="Name" aria-label="Name" required></label>
<label class="fld"><input class="inp" type="email" name="email" autocomplete="email" placeholder="Email" aria-label="Email" required></label>
<label class="fld full"><textarea class="inp" name="message" rows="3" placeholder="Message" aria-label="Message" required></textarea></label>
<div class="btns bfx-glow"><button type="submit" class="btn sec inq"><span class="shn" aria-hidden="true"></span><span class="bl">Send inquiry</span></button><a href="https://www.atom.com/name/${esc(d.atomName)}" class="btn pri atm-b" rel="noopener" target="_blank"><span class="shn" aria-hidden="true"><i class="shr"></i></span><span>View on Atom.com</span><span class="va" aria-hidden="true">→</span></a></div>
<p class="ferr" role="alert" hidden>Something went wrong. Please email <a href="mailto:${site.email}">${site.email}</a> instead.</p>
</div>
</form>
<div class="fok" role="status" aria-live="polite" hidden><span class="fok-i" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><p class="fok-t">Message received.</p><p class="fok-s">Thank you for your inquiry.</p><button type="button" class="fok-again">Send another</button></div>
<div class="ndiv" aria-hidden="true"></div>
<div class="trust"><span class="atm" role="img" aria-label="Atom.com"></span><span class="tdv" aria-hidden="true"></span><span class="esc2" role="img" aria-label="Escrow.com"></span></div>
</section>
</div>
</div></section>
<section aria-labelledby="more-h">
<div class="wrap d-more">
<div class="sdiv" aria-hidden="true"></div>
<h2 id="more-h"><a href="${catLink(d.categories[0])}" class="vfc">More from the collection<span class="va" aria-hidden="true">→</span></a></h2>
<div class="g4 rel-grid">${rel}</div>
</div></section>
</div></div>
`;
  return layout2({ title: `${d.name} | Premium Domain for Sale | Midjump`, description: desc, urlPath: `/domains/${d.slug}`, body, active: "/domains", page: "domain", extraHead: breadcrumbs([["Home", "/"], ["Domain Collection", "/domains"], [d.name, `/domains/${d.slug}`]]) });
};
