// One-off generator: builds src/data/domains.json from the old repo's per-domain files,
// the final category mapping (from the canvas) and the tier list. Usage:
//   node tools/make-data.mjs <dir with per-domain .js> <old domains.jsx> <canvas gallery board html>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [dir, jsx, board] = process.argv.slice(2);

const src = fs.readFileSync(jsx, "utf8");
const portfolio = [];
for (const m of src.matchAll(/\{\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*logo:\s*"([^"]+)",\s*scale:\s*([\d.]+)\s*,\s*y:\s*"([^"]+)"\s*,\s*mscale:\s*([\d.]+)\s*,\s*my:\s*"([^"]+)"\s*,\s*mx:\s*"([^"]+)"/g))
  portfolio.push({ name: m[1], slug: m[2], logo: m[3], scale: +m[4], y: m[5], mscale: +m[6], my: m[7], mx: m[8] });

const g2 = await import(pathToFileURL(path.join(dir, "gallery2col.js")));
const cl = (await import(pathToFileURL(path.join(dir, "carouselLogos.js")))).CAROUSEL_LOGOS;
const html = fs.readFileSync(board, "utf8");
const gm = html.match(/var groups = (\{[\s\S]*?\n    \});/);
const groups = Function("return " + gm[1])();

const tiers = {
  A: "CrossModality.com Nephele.ai Enforcing.si Reinforcing.si Guardrailed.com Anthropize.com CoTaught.com FlexiToken.com Optronical.com BroughtIn.com Encodably.com Webveyor.com",
  B: "Distroless.com Replaceably.com CoTrained.com Cloudveyor.com DetectionLayer.com CloudIndexing.com BioDefensive.com Multitemporal.com Deductional.com Descriptional.com CrossTemporal.com HitPrompt.com eHustles.com Precognic.com Throughlane.com PromptAider.com CloudAider.com Asynchronic.com",
};
const tierOf = (n) => (tiers.A.split(" ").includes(n) ? "A" : tiers.B.split(" ").includes(n) ? "B" : "C");

const out = [];
for (const p of portfolio) {
  const mod = (await import(pathToFileURL(path.join(dir, p.slug + ".js")))).default;
  const p2 = g2.GALLERY_2COL[p.logo];
  const dot = p.name.indexOf(".");
  out.push({
    name: p.name, base: p.name.slice(0, dot), ext: p.name.slice(dot), slug: p.slug,
    atomName: mod.atomName, logos: mod.logos, galleryLogo: p.logo,
    desk: { scale: p.scale, y: p.y },
    phone: p2 ? { scale: p2.scale, y: p2.y, x: p2.x } : { scale: p.mscale, y: p.my, x: p.mx },
    order2col: g2.ORDER_2COL.indexOf(p.slug),
    logoFx: mod.logos.map((l) => cl[l] || {}),
    seoDescription: mod.seoDescription, overview: mod.overview,
    categories: Object.keys(groups).filter((k) => groups[k].includes(p.name)),
    tier: tierOf(p.name),
  });
}
fs.writeFileSync("src/data/domains.json", JSON.stringify(out, null, 1));
const miss = out.filter((d) => d.order2col < 0).map((d) => d.slug);
console.log(out.length, "domains; no 2col order:", miss.join(",") || "none");
console.log("no categories:", out.filter((d) => !d.categories.length).map((d) => d.name).join(",") || "none");
for (const k of Object.keys(groups)) console.log(k, out.filter((d) => d.categories.includes(k)).length);
