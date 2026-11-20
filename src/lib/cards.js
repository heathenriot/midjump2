// Domain cards (logo plate + name), shared by the new-design pages.
import { esc, readJson } from "./util.js";

const fit = readJson("content/logo-fit.json");
export const fitOf = (d) => fit[d.base] || [1.15, 0.15, 1];
// gallery logo with a transparent background (content/logo-alpha, made by tools/make-logo-alpha.py)
export const logoSrc = (d) => d.galleryLogo.replace("/assets/svg/", "/assets/logo-alpha/").replace(/\.svg$/, ".png");
// where the logo sits on the plate (same formula as the design canvas)
export const logoTf = (d) => {
  const [S, k, o] = fitOf(d);
  const s = S * o;
  const y = ((0.18571 - s * k) / 0.66) * 100;
  return `translate(0%, ${y.toFixed(2)}%) scale(${s.toFixed(4)})`;
};
// A card. The second (colour) image is for the navy-tint-at-rest look (landing, desktop).
export const card = (d, { hidden = false, tint = false } = {}) => {
  const tf = logoTf(d), src = logoSrc(d);
  return `<a href="/domains/${d.slug}" class="pol${tint ? " tint" : ""}"${hidden ? ' aria-hidden="true" tabindex="-1"' : ""}><span class="pol-plate"><img src="${src}" alt="${hidden ? "" : esc(d.name) + " logo"}" style="transform:${tf}" loading="lazy" decoding="async">${tint ? `<img class="cimg" src="${src}" alt="" aria-hidden="true" style="transform:${tf}" loading="lazy" decoding="async">` : ""}</span><span class="pol-name">${esc(d.base)}<span>${esc(d.ext)}</span></span></a>`;
};
