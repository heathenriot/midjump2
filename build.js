// Builds the website:  node build.js   ->  writes the finished site into dist/
// You normally never edit this file. Content lives in content/, code in src/.
import fs from "node:fs";
import path from "node:path";
import { root, dist, write, copyDir } from "./src/lib/util.js";
import { domains, site } from "./src/lib/data.js";   // runs the checks first
import { landing } from "./src/pages/landing.js";
import { gallery } from "./src/pages/gallery.js";
import { contact } from "./src/pages/contact.js";
import { domainPage, picks } from "./src/pages/domain.js";

fs.rmSync(dist, { recursive: true, force: true });

// shared files (fonts, site logo) -> /assets
copyDir(path.join(root, "public"), path.join(dist, "assets"));
// each domain's logos -> /assets/svg
for (const d of domains) for (const f of d._files) { fs.mkdirSync(path.join(dist, "assets/svg"), { recursive: true }); fs.copyFileSync(path.join(d._dir, f), path.join(dist, "assets/svg", f)); }
fs.copyFileSync(path.join(root, "src/styles/site.css"), path.join(dist, "assets/site.css"));
fs.copyFileSync(path.join(root, "src/js/site.js"), path.join(dist, "assets/site.js"));

write("domains/index.html", gallery());
write("contact/index.html", contact());
for (const d of domains) write(`domains/${d.slug}/index.html`, domainPage(d));
write("index.html", landing());
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["/", "/domains", "/contact", ...domains.map((d) => "/domains/" + d.slug)].map((u) => `<url><loc>${site.url}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
if (process.env.SHOW_PICKS) for (const d of domains) console.log(`| ${d.name} | ${d.categories.join(" · ")} | ${picks[d.slug].map((r) => r.name).join(", ")} |`);
console.log(`Built ${domains.length} domain pages + home, collection and contact.`);
