// Live preview on your own computer:   node preview.js     (or:  npm run dev)
// Open http://localhost:3000 . It rebuilds when you save a file in content/ or src/, and the page reloads by itself.
// If you make a mistake, the problem is printed here and the last good version stays on screen.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dist = path.join(root, "dist");
const PORT = process.env.PORT || 3000;
let version = 0;

const build = () => {
  const r = spawnSync(process.execPath, ["build.js"], { cwd: root, encoding: "utf8" });
  console.log(`\n[${new Date().toLocaleTimeString()}] ` + (r.status === 0 ? "Rebuilt. " + r.stdout.trim() : "BUILD FAILED. Showing the last good version.\n" + r.stderr));
  if (r.status === 0) version++;
};

const newest = (dir) => { let m = 0; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.name === "node_modules" || e.name === "dist" || e.name.startsWith(".")) continue; const p = path.join(dir, e.name); m = Math.max(m, e.isDirectory() ? newest(p) : fs.statSync(p).mtimeMs); } return m; };
const watched = ["content", "src", "build.js"].map((p) => path.join(root, p));
const stamp = () => Math.max(...watched.map((p) => (fs.statSync(p).isDirectory() ? newest(p) : fs.statSync(p).mtimeMs)));

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain" };
const reload = `<script>(function(){var v;setInterval(function(){fetch("/__v").then(function(r){return r.text()}).then(function(t){if(v&&t!==v)location.reload();v=t}).catch(function(){})},800)})()</script>`;

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/__v") { res.end(String(version)); return; }
  let f = path.join(dist, url);
  if (!f.startsWith(dist)) { res.statusCode = 403; res.end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.statusCode = 404; res.end("Not found"); return; }
  const ext = path.extname(f);
  res.setHeader("Content-Type", types[ext] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  if (ext === ".html") res.end(fs.readFileSync(f, "utf8").replace("</body>", reload + "</body>")); else res.end(fs.readFileSync(f));
}).listen(PORT, () => console.log(`Preview running at http://localhost:${PORT}  (press Ctrl+C to stop)`));

build();
let last = stamp();
setInterval(() => { const s = stamp(); if (s !== last) { last = s; build(); } }, 700);
