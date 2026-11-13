// One page per domain (/domains/<name>). Also decides the "More from the collection" picks.
import { esc } from "../lib/util.js";
import { domains, site } from "../lib/data.js";
import { layout } from "../lib/layout.js";

/* ---------- domain pages ---------- */
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const usage = Object.fromEntries(domains.map((d) => [d.slug, 0]));
export const picks = {};
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
export const domainPage = (d) => {
  const fx = (i) => d.logoFx[i] || {};
  const slides = d.logos.map((l, i) => { const f = fx(i); return `<div class="dm-slide"><img src="${l}" alt="${esc(d.name)} logo concept ${i + 1}" style="--cy:${f.y || "0%"};--cs:${f.scale || 1};--my:${f.my || f.y || "0%"};--ms:${f.mscale || f.scale || 1}"${i ? ' loading="lazy"' : ""} decoding="async"></div>`; }).join("");
  const rel = picks[d.slug].map((r) => `<a href="/domains/${r.slug}" class="dm-rel"><span class="dm-rel-img"><img src="${r.galleryLogo}" alt="${esc(r.name)} logo" loading="lazy" decoding="async" style="--s:${r.desk.scale};--y:${r.desk.y}"></span><span class="dm-rel-name">${esc(r.base)}<span class="dm-rel-ext">${esc(r.ext)}</span></span></a>`).join("");
  const cat0 = d.categories[0].toLowerCase();
  const desc = trim(`${d.name} is available for acquisition. ${firstSentences(d.overview[1] || d.overview[0], 120)}`, 158);
  const body = `
<div class="c-frame dm-frame">
<section class="dm-name"><h1 class="mj-fade">${esc(d.base)}<span class="dm-ext">${esc(d.ext)}</span></h1></section>
<section class="dm-view${d.logos.length < 2 ? " dm-single" : ""}" aria-label="Logo concepts"><div class="dm-vin">
<div class="mj-fade dm-viewer"><div class="dm-track">${slides}</div><div class="dm-fadeL" aria-hidden="true"></div><div class="dm-fadeR" aria-hidden="true"></div></div>
<div class="dm-arrows"><button type="button" class="dm-arrow dm-prev" aria-label="Previous logo concept"><svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><path d="M8.5 1.5 2 8l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2"></path></svg></button><button type="button" class="dm-arrow dm-next" aria-label="Next logo concept"><svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><path d="M1.5 1.5 8 8l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2"></path></svg></button></div>
</div></section>
<div class="dm-acqwrap"><section class="dm-row dm-acq" aria-labelledby="acq-h"><h2 id="acq-h" class="dm-label">Available for acquisition</h2>
<div class="c-wrap"><form class="dm-form mj-form" data-key="${site.formKey}" data-domain="${esc(d.name)}">
<input class="mj-hp" type="text" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
<p class="dm-sent"><span class="d-only">${esc(d.name)} can be purchased securely via <span class="dm-brand">Atom.com</span>, or you can contact Midjump directly to arrange a transaction through <span class="dm-brand">Escrow.com</span>.</span><span class="m-only">Purchase securely via <span class="dm-brand">Atom.com</span>, or contact Midjump to arrange a direct transaction through <span class="dm-brand">Escrow.com</span>.</span></p>
<div class="dm-fields">
<label class="mj-field"><input class="mj-input" type="text" name="name" autocomplete="name" placeholder="Name" aria-label="Name" required></label>
<label class="mj-field"><input class="mj-input" type="email" name="email" autocomplete="email" placeholder="Email" aria-label="Email" required></label>
<label class="mj-field"><textarea class="mj-input" name="message" rows="3" placeholder="Message" aria-label="Message" required></textarea></label>
<div class="dm-btns"><a href="https://www.atom.com/name/${esc(d.atomName)}" class="dm-atom" rel="noopener" target="_blank"><span>View on Atom.com</span><svg class="mj-chev" viewBox="0 0 242.333 242.333" aria-hidden="true"><path d="M80 38 L164 121.2 L80 204.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></a>
<button type="submit" class="mj-send"><span>Send inquiry</span></button></div>
<p class="mj-err" role="alert" hidden>Something went wrong. Please email ${site.email} instead.</p>
</div></form>
<div class="mj-note" role="status" aria-live="polite"><p class="t">Message received.</p><p class="s">Thank you for your inquiry.</p><button type="button" class="mj-again">Send another</button></div>
</div></section></div>
<div class="dm-aboutwrap"><section class="dm-row dm-about" aria-labelledby="about-h"><h2 id="about-h" class="dm-label">About the domain</h2><div class="dm-paras">${d.overview.map((p, i) => `${i === 1 ? '<h3 class="dm-label dm-label2">Ideal for</h3>' : ""}<p class="dm-para">${esc(p)}</p>`).join("")}</div></section></div>
<section class="dm-moresec" aria-labelledby="more-h">
<div class="dm-morehead"><h2 id="more-h"><a href="/domains?c=${cat0}" class="dm-more">More from the collection<span class="dm-more-arrow" aria-hidden="true">${chev}</span></a></h2></div>
<div class="dm-relgrid">${rel}</div>
</section>
</div>`;
  return layout({ title: `${d.name} | Premium Domain | Midjump`, description: desc, urlPath: `/domains/${d.slug}`, body, active: "/domains" });
};

