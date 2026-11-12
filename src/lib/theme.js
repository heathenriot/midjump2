// Reads content/theme-desktop.jsonc and content/theme-phone.jsonc, checks every value,
// and turns them into CSS variables. Plain-English errors; a failed check never replaces the live site.
import fs from "node:fs";
import path from "node:path";
import { root } from "./util.js";
import { DESKTOP, PHONE, DESKTOP_SECTIONS, PHONE_SECTIONS, FONTS, LINE_STYLES, CASES } from "./theme-schema.js";

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// strip // and /* */ comments and trailing commas, without touching text inside quotes
export const stripJsonc = (src) => {
  let out = "", i = 0, str = false;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (str) { out += c; if (c === "\\") { out += n; i += 2; continue; } if (c === '"') str = false; i++; continue; }
    if (c === '"') { str = true; out += c; i++; continue; }
    if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
    out += c; i++;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
};

const COLOR = /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|transparent|rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(,\s*[\d.]+%?\s*)?\))$/i;
const SIZE1 = /^-?(\d+(\.\d+)?|\.\d+)(px|em|rem|%|vw|vh)$|^0$/;
const isColor = (v) => typeof v === "string" && COLOR.test(v.trim());
const isSize = (v) => typeof v === "string" && v.trim().split(/\s+/).length <= 4 && v.trim().split(/\s+/).every((t) => SIZE1.test(t));

const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
const closest = (w, list) => { let best = null, bd = 99; for (const x of list) { const d = lev(w.toLowerCase(), x.toLowerCase()); if (d < bd) { bd = d; best = x; } } return bd <= 3 ? best : null; };

const load = (file, schema, sections, prefix, problems) => {
  const where = `content/${file}`;
  let user = {};
  const full = path.join(root, where);
  if (fs.existsSync(full)) {
    try { user = JSON.parse(stripJsonc(fs.readFileSync(full, "utf8"))); }
    catch (e) { problems.push(`${where} can't be read: ${e.message}. Usually a missing comma, a missing quote mark, or a missing } or ] near that spot.`); return null; }
  }
  const known = {};
  for (const [sec, key] of schema) (known[sec] ||= []).push(key);
  const values = {}, css = [];

  for (const sec of Object.keys(user)) {
    if (!known[sec]) { const g = closest(sec, Object.keys(known)); problems.push(`${where}: "${sec}" isn't a section name${g ? ` (did you mean "${g}"?)` : ""}. Sections are: ${Object.keys(known).join(", ")}.`); continue; }
    if (typeof user[sec] !== "object" || user[sec] === null) { problems.push(`${where}: "${sec}" should be a block { ... } of settings.`); continue; }
    for (const k of Object.keys(user[sec])) if (!known[sec].includes(k)) { const g = closest(k, known[sec]); problems.push(`${where}: in "${sec}", "${k}" isn't a setting I know${g ? ` (did you mean "${g}"?)` : ""}.`); }
  }

  for (const [sec, key, type, def] of schema) {
    let v = user[sec]?.[key];
    const label = `${where}: "${sec}" → "${key}"`;
    if (v === undefined) v = def;
    const bad = (why) => { problems.push(`${label} is ${JSON.stringify(v)}. ${why}`); };
    const name = `--${prefix}-${kebab(sec)}-${kebab(key)}`;
    let ok = true;
    if (type === "color") { if (!isColor(v)) { ok = false; bad('A colour looks like "#F3F2EE" (hex code, with the #).'); } else css.push(`${name}:${v.trim()}`); }
    else if (type === "size") { if (!isSize(v)) { ok = false; bad('A size needs a unit, like "14px", "1.5em" or "20%" (or "0"). Keep the quote marks.'); } else css.push(`${name}:${v.trim()}`); }
    else if (type === "num") { if (typeof v !== "number" || !Number.isFinite(v)) { ok = false; bad("This needs a plain number with no quote marks, like 1.2."); } else css.push(`${name}:${v}`); }
    else if (type === "font") { if (!FONTS.includes(v)) { ok = false; bad(`Pick one of the installed fonts, spelled exactly: ${FONTS.map((f) => `"${f}"`).join(", ")}.`); } else css.push(`${name}:"${v}",system-ui,sans-serif`); }
    else if (type === "case") { if (!CASES.includes(v)) { ok = false; bad(`Use one of: ${CASES.map((f) => `"${f}"`).join(", ")}.`); } else css.push(`${name}:${v}`); }
    else if (type === "line") {
      if (typeof v !== "object" || v === null) { ok = false; bad('A line looks like { "style": "dotted", "width": "1px", "color": "#B3B2A8" }.'); }
      else {
        const merged = { ...def, ...v };
        for (const k2 of Object.keys(v)) if (!["style", "width", "color"].includes(k2)) { ok = false; problems.push(`${label}: "${k2}" isn't part of a line. Use only style, width and color.`); }
        if (!LINE_STYLES.includes(merged.style)) { ok = false; problems.push(`${label} → "style" is ${JSON.stringify(merged.style)}. Use one of: ${LINE_STYLES.map((f) => `"${f}"`).join(", ")}.`); }
        if (!isSize(merged.width)) { ok = false; problems.push(`${label} → "width" is ${JSON.stringify(merged.width)}. Use a size like "1px".`); }
        if (!isColor(merged.color)) { ok = false; problems.push(`${label} → "color" is ${JSON.stringify(merged.color)}. Use a colour like "#B3B2A8".`); }
        if (ok) { v = merged; css.push(`${name}:${merged.width} ${merged.style} ${merged.color}`, `${name}-width:${merged.width}`, `${name}-style:${merged.style}`, `${name}-color:${merged.color}`); }
      }
    }
    if (ok) (values[sec] ||= {})[key] = v;
  }
  return { values, css };
};

const problems = [];
const d = load("theme-desktop.jsonc", DESKTOP, DESKTOP_SECTIONS, "t", problems);
const p = load("theme-phone.jsonc", PHONE, PHONE_SECTIONS, "p", problems);
if (problems.length) {
  console.error("\nThe site was NOT built, because of the following:\n");
  problems.forEach((x, i) => console.error(`  ${i + 1}. ${x}\n`));
  console.error("Fix these and build again. The live site is untouched.\n");
  process.exit(1);
}

export const theme = { desktop: d.values, phone: p.values };
export const themeCss = `/* generated from content/theme-desktop.jsonc and content/theme-phone.jsonc */\n:root{\n${[...d.css, ...p.css].join(";\n")};\n}\n`;
