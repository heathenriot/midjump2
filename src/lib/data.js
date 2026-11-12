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

  for (const k of ["name", "atomName", "categories", "tier", "galleryLogo", "logos", "overview"])
    if (j[k] === undefined || j[k] === "") bad(`${where} is missing "${k}".`);
  if (!j.name || !/^[a-z0-9-]+\.[a-z]+$/i.test(j.name)) bad(`${where}: "name" should look like Example.com (got "${j.name}").`);
  if (j.name && j.name.toLowerCase().split(".")[0].replace(/[^a-z0-9]/g, "") !== slug.replace(/[^a-z0-9]/g, "")) bad(`${where}: the file name "${slug}.json" should be the domain name in lowercase without the extension (e.g. "${(j.name || "").split(".")[0].toLowerCase()}").`);
  for (const c of j.categories || []) if (!CATS.includes(c)) bad(`${where}: category "${c}" isn't one of: ${CATS.join(", ")}. Check the spelling and capital letters.`);
  if (!TIERS.includes(j.tier)) bad(`${where}: "tier" must be "A", "B" or "C" (got "${j.tier}").`);
  const need = [j.galleryLogo, ...(j.logos || [])].filter(Boolean);
  for (const f of need) if (!fs.existsSync(path.join(svgDir, f))) bad(`${where} mentions the logo "${f}" but that file isn't in the folder content/svg/. Upload it there, or fix the spelling in domain.json (capital letters matter).`);
  if (Array.isArray(j.logos) && j.logos.length === 0) bad(`${where}: "logos" is empty. Every domain needs at least one logo.`);
  if (!Array.isArray(j.overview) || !j.overview.length) bad(`${where}: "overview" needs at least one paragraph.`);

  const [base, ...rest] = (j.name || "").split(".");
  const url = (f) => `/assets/svg/${f}`;
  return {
    slug, name: j.name, base, ext: "." + rest.join("."), atomName: j.atomName,
    categories: j.categories || [], tier: j.tier, overview: j.overview || [],
    galleryLogo: url(j.galleryLogo), logos: (j.logos || []).map(url),
    logoFx: j.carouselTweaks || [],
  };
}).filter(Boolean);

// duplicate checks
const seen = (list, key, label) => { const m = {}; for (const d of domains) (m[d[key]] ||= []).push(d.slug); for (const [v, s] of Object.entries(m)) if (s.length > 1) bad(`Two domains share the same ${label} "${v}": ${s.join(", ")}. Each must be unique.`); };
seen(domains, "name", "domain name");
// ---- layout files: order + size/position of each logo ----
const NUM = /^-?\d+(\.\d+)?(%|px)?$/;
const slugs = new Set(domains.map((d) => d.slug));
const readList = (file) => {
  let j;
  try { j = readJson("content/" + file); } catch (e) { bad(`content/${file} can't be read: ${e.message}. Usually a missing comma or quote mark near that spot.`); return []; }
  return Array.isArray(j.order) ? j.order : (bad(`content/${file} needs an "order" list.`), []);
};
const checkNum = (file, who, label, v, allowEmpty) => { if (v === undefined && allowEmpty) return; if (!(typeof v === "number" || NUM.test(String(v)))) bad(`content/${file}: "${who}" has a bad ${label} (${JSON.stringify(v)}). Use a number like 0.9 for scale, or something like "3%" for x / y.`); };
const loadGallery = (file) => {
  const list = readList(file), seenIn = {};
  for (const e of list) {
    if (!slugs.has(e.domain)) { bad(`content/${file} lists "${e.domain}" but there's no file content/domains/${e.domain}.json. Check the spelling.`); continue; }
    if (seenIn[e.domain]) bad(`content/${file} lists "${e.domain}" more than once. Each domain must appear exactly once.`);
    seenIn[e.domain] = e;
    checkNum(file, e.domain, "scale", e.scale); checkNum(file, e.domain, "y", e.y); checkNum(file, e.domain, "x", e.x, true);
  }
  for (const d of domains) if (!seenIn[d.slug]) bad(`content/${file} is missing "${d.slug}". Add a line for it, or it won't appear on the gallery.`);
  return list.filter((e) => slugs.has(e.domain));
};
const deskList = loadGallery("gallery-desktop.json");
const phoneList = loadGallery("gallery-phone.json");

const marqueeRaw = readList("marquee.json");
for (const m of marqueeRaw) {
  if (!slugs.has(m.domain)) bad(`content/marquee.json lists "${m.domain}" but there's no file content/domains/${m.domain}.json. Check the spelling.`);
  if (!m.logo || !fs.existsSync(path.join(svgDir, m.logo))) bad(`content/marquee.json: the logo "${m.logo}" for "${m.domain}" isn't in content/svg/. Upload it there or fix the spelling (capital letters matter).`);
  checkNum("marquee.json", m.domain, "width", m.width);
  for (const k of ["desktop", "phone"]) if (m[k]) { checkNum("marquee.json", m.domain + " " + k, "scale", m[k].scale, true); checkNum("marquee.json", m.domain + " " + k, "x", m[k].x, true); checkNum("marquee.json", m.domain + " " + k, "y", m[k].y, true); }
}

if (problems.length) {
  console.error("\nThe site was NOT built, because of the following:\n");
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}\n`));
  console.error("Fix these and build again. The live site is untouched.\n");
  process.exit(1);
}

const bySlug = Object.fromEntries(domains.map((d) => [d.slug, d]));
for (const e of deskList) bySlug[e.domain].desk = { scale: e.scale, x: e.x, y: e.y };
for (const e of phoneList) bySlug[e.domain].phone = { scale: e.scale, x: e.x, y: e.y };
domains.length = 0; domains.push(...deskList.map((e) => bySlug[e.domain]));
export const phoneDomains = phoneList.map((e) => bySlug[e.domain]);
export const marquee = marqueeRaw.map((m) => ({ ...m, d: bySlug[m.domain] }));
export const CATEGORIES = CATS;
