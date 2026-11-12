// Reads content/ and checks it. If something is wrong it stops with a plain-English message
// (and the live site is NOT replaced, so a typo can never break what visitors see).
import fs from "node:fs";
import path from "node:path";
import { root, readJson } from "./util.js";

export const site = readJson("content/site.json");
export const landingText = readJson("content/landing.json");
export const contactText = readJson("content/contact.json");
export const galleryText = readJson("content/gallery.json");

const problems = [];
const bad = (msg) => problems.push(msg);
const TIERS = ["A", "B", "C"];
const CATS = galleryText.categories;

const dir = path.join(root, "content/domains");
const svgDir = path.join(root, "content/svg");
const folders = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => f.slice(0, -5)).sort();

export const domains = folders.map((slug) => {
  const where = `content/domains/${slug}.json`;
  const file = path.join(dir, slug + ".json");
  let j;
  try { j = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { bad(`${where} can't be read: ${e.message}. Usually a missing comma or quote mark near that spot.`); return null; }

  for (const k of ["name", "atomName", "categories", "tier", "galleryLogo", "logos", "overview", "gallery", "desktopOrder", "phoneOrder"])
    if (j[k] === undefined || j[k] === "") bad(`${where} is missing "${k}".`);
  if (!j.name || !/^[a-z0-9-]+\.[a-z]+$/i.test(j.name)) bad(`${where}: "name" should look like Example.com (got "${j.name}").`);
  if (j.name && j.name.toLowerCase().split(".")[0].replace(/[^a-z0-9]/g, "") !== slug.replace(/[^a-z0-9]/g, "")) bad(`${where}: the file name "${slug}.json" should be the domain name in lowercase without the extension (e.g. "${(j.name || "").split(".")[0].toLowerCase()}").`);
  for (const c of j.categories || []) if (!CATS.includes(c)) bad(`${where}: category "${c}" isn't one of: ${CATS.join(", ")}. Check the spelling and capital letters.`);
  if (!TIERS.includes(j.tier)) bad(`${where}: "tier" must be "A", "B" or "C" (got "${j.tier}").`);
  const need = [j.galleryLogo, ...(j.logos || []), j.marqueeLogo].filter(Boolean);
  for (const f of need) if (!fs.existsSync(path.join(svgDir, f))) bad(`${where} mentions the logo "${f}" but that file isn't in the folder content/svg/. Upload it there, or fix the spelling in domain.json (capital letters matter).`);
  if (Array.isArray(j.logos) && j.logos.length === 0) bad(`${where}: "logos" is empty. Every domain needs at least one logo.`);
  if (!Array.isArray(j.overview) || !j.overview.length) bad(`${where}: "overview" needs at least one paragraph.`);

  const [base, ...rest] = (j.name || "").split(".");
  const url = (f) => `/assets/svg/${f}`;
  return {
    slug, name: j.name, base, ext: "." + rest.join("."), atomName: j.atomName,
    categories: j.categories || [], tier: j.tier, overview: j.overview || [],
    galleryLogo: url(j.galleryLogo), logos: (j.logos || []).map(url), marqueeLogo: j.marqueeLogo,
    desk: j.gallery?.desktop, phone: j.gallery?.phone, logoFx: j.carouselTweaks || [],
    desktopOrder: j.desktopOrder, phoneOrder: j.phoneOrder,
  };
}).filter(Boolean);

// duplicate checks
const seen = (list, key, label) => { const m = {}; for (const d of domains) (m[d[key]] ||= []).push(d.slug); for (const [v, s] of Object.entries(m)) if (s.length > 1) bad(`Two domains share the same ${label} "${v}": ${s.join(", ")}. Each must be unique.`); };
seen(domains, "name", "domain name");
seen(domains, "desktopOrder", "desktopOrder number");
seen(domains, "phoneOrder", "phoneOrder number");

// landing page scroller / contact references
for (const m of landingText.scrollerDomains) {
  const d = domains.find((x) => x.slug === m.domain);
  if (!d) bad(`content/landing.json lists "${m.domain}" in the scrolling strip, but there's no domain file with that name.`);
  else if (!d.marqueeLogo) bad(`"${m.domain}" is in the home-page scrolling strip, so content/domains/${m.domain}.json needs a "marqueeLogo" (a logo file in that folder).`);
}

if (problems.length) {
  console.error("\nThe site was NOT built, because of the following:\n");
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}\n`));
  console.error("Fix these and build again. The live site is untouched.\n");
  process.exit(1);
}

domains.sort((a, b) => a.desktopOrder - b.desktopOrder);
export const phoneDomains = [...domains].sort((a, b) => a.phoneOrder - b.phoneOrder);
export const CATEGORIES = CATS;
