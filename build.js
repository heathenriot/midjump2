// Builds the website:  node build.js   ->  writes the finished site into dist/
// You normally never edit this file. Content lives in content/, code in src/.
import fs from "node:fs";
import path from "node:path";
import { root, dist, write, copyDir } from "./src/lib/util.js";
import { domains, site } from "./src/lib/data.js";   // runs the content checks first
import { themeCss } from "./src/lib/theme.js";        // runs the theme checks
import { landing } from "./src/pages/landing.js";
import { gallery } from "./src/pages/gallery.js";
import { contact } from "./src/pages/contact.js";
import { domainPage, picks } from "./src/pages/domain.js";

fs.rmSync(dist, { recursive: true, force: true });

// fonts and all logos -> /assets
copyDir(path.join(root, "src/fonts"), path.join(dist, "assets/fonts"));
copyDir(path.join(root, "content/svg"), path.join(dist, "assets/svg"));
fs.writeFileSync(path.join(dist, "assets/site.css"), themeCss + "\n" + fs.readFileSync(path.join(root, "src/styles/site.css"), "utf8"));
fs.copyFileSync(path.join(root, "content/svg/favicon.ico"), path.join(dist, "favicon.ico"));   // browsers ask for /favicon.ico at the site root
fs.copyFileSync(path.join(root, "src/js/site.js"), path.join(dist, "assets/site.js"));

write("domains/index.html", gallery());
write("contact/index.html", contact());
for (const d of domains) write(`domains/${d.slug}/index.html`, domainPage(d));
write("index.html", landing());
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["/", "/domains", "/contact", ...domains.map((d) => "/domains/" + d.slug)].map((u) => `<url><loc>${site.url}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
if (process.env.SHOW_PICKS) for (const d of domains) console.log(`| ${d.name} | ${d.categories.join(" · ")} | ${picks[d.slug].map((r) => r.name).join(", ")} |`);
console.log(`Built ${domains.length} domain pages + home, collection and contact.`);
