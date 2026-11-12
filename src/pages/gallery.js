// Domain Collection page (/domains).
import { esc } from "../lib/util.js";
import { domains, phoneDomains, galleryText, CATEGORIES } from "../lib/data.js";
import { layout } from "../lib/layout.js";

/* ---------- gallery ---------- */
export const groups = Object.fromEntries(CATEGORIES.map((c) => [c, domains.filter((d) => d.categories.includes(c)).map((d) => d.slug)]));
const card = (d, k) => {
  const v = k === "p" ? d.phone : d.desk;
  const style = `--s:${v.scale};--y:${v.y};--x:${v.x || "0%"}`;
  return `<a href="/domains/${d.slug}" class="k-card" data-slug="${d.slug}" style="${style}"><span class="k-panel"><img class="k-logo" src="${d.galleryLogo}" alt="${esc(d.name)} logo" loading="lazy" decoding="async"></span><span class="k-name">${esc(d.base)}<span class="k-ext">${esc(d.ext)}</span></span></a>`;
};
export const gallery = () => {
  const dTabs = [["All", domains.length], ...CATEGORIES.map((c) => [c, groups[c].length])]
    .map(([c, n], i) => `<button type="button" role="tab" class="g-tab${i ? "" : " is-on"}" data-cat="${c}" aria-selected="${i ? "false" : "true"}">${c} <span class="g-count">${n}</span></button>`).join("");
  const pTabs = ["All", ...CATEGORIES].map((c, i) => `<button type="button" role="tab" class="p-tab${i ? "" : " is-on"}" data-cat="${c}" aria-selected="${i ? "false" : "true"}">${c}</button>`).join("");
    const body = `
<div class="d-only d-frame">
<section class="g-title"><h1 class="mj-fade">${esc(galleryText.heading)}</h1></section>
<div class="g-tabs" role="tablist" aria-label="Filter by category">${dTabs}</div>
<section class="dg-wrap" aria-label="Domains"><div class="dg">${domains.map((d) => card(d, "d")).join("")}</div></section>
</div>
<div class="m-only">
<section class="mj-title"><h1 class="mj-fade">${esc(galleryText.heading)}</h1></section>
<div class="mj-tabs-band"><div class="mj-tabs" role="tablist" aria-label="Filter by category">${pTabs}</div></div>
<section class="pg-wrap" aria-label="Domains"><div class="pg">${phoneDomains.map((d) => card(d, "p")).join("")}</div>
<button type="button" class="k-top" aria-label="Back to top"><svg viewBox="0 0 11 7" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 6l4.5-4.5L10 6"/></svg><span>Back to top</span></button></section>
</div>
<script type="application/json" id="mj-groups">${JSON.stringify(groups)}</script>`;
  return layout({ title: galleryText.title, description: galleryText.description, urlPath: "/domains", body, active: "/domains" });
};


