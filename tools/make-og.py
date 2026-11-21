"""Sharing images (the picture in link previews on WhatsApp, iMessage, LinkedIn, X, Slack...).

Writes content/og/site.jpg (home, collection, contact) and content/og/<domain>.jpg (one per domain page),
1200 x 630. Run it after adding a domain or changing a gallery logo:

    node build.js && python3 tools/make-og.py && node build.js

Needs Playwright + Chrome (pip install playwright). It renders small HTML pages with the site's own
fonts, colours and logos from dist/, then screenshots them.
"""
import json, sys, threading, functools, http.server, socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST, OUT = ROOT / "dist", ROOT / "content" / "og"

FONTS = """
@font-face{font-family:Questrial;src:url(/assets/fonts/Questrial-Regular.woff2)}
@font-face{font-family:Fin;src:url(/assets/fonts/FinlandicaText-Regular.woff2);font-weight:400}
@font-face{font-family:Fin;src:url(/assets/fonts/FinlandicaText-Light.woff2);font-weight:300}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden;background:#F2F3F5}
body{position:relative;font-family:Fin,sans-serif;color:#1A1A18}
.silk{position:absolute;inset:0;background:url(/assets/graphics/silk.jpg) 88% 60%/cover;opacity:.42;filter:blur(5px) brightness(.98) contrast(.92);
  -webkit-mask-image:linear-gradient(90deg,transparent 18%,#000 62%);mask-image:linear-gradient(90deg,transparent 18%,#000 62%)}
.logo{position:absolute;left:80px;top:66px;height:50px}
.url{position:absolute;left:82px;bottom:62px;font-size:22px;color:#565C64;letter-spacing:.01em}
"""

def site_html():
    return f"""<!doctype html><style>{FONTS}
.hh{{position:absolute;left:80px;top:196px;width:640px}}
.sub{{position:absolute;left:82px;top:400px;font-size:27px;line-height:1.45;font-weight:300;color:#2a2c30;max-width:640px}}
</style><div class="silk"></div><img class="logo" src="/assets/svg/logo-v4.svg">
<img class="hh" src="/assets/graphics/hero-heading.svg">
<p class="sub">A collection of signature domain names, curated for startups, enterprises, and emerging ventures.</p>
<p class="url">midjump.com</p>"""

def domain_html(d):
    base, ext = d["name"].rsplit(".", 1)
    src = "/assets/logo-alpha/" + d["galleryLogo"].split("/")[-1].rsplit(".", 1)[0] + ".png"
    size = 76 if len(base) <= 11 else 64 if len(base) <= 14 else 56
    return f"""<!doctype html><style>{FONTS}
.plate{{position:absolute;left:80px;top:150px;width:470px;height:352px;border-radius:24px;background:#FAFBFC;border:1.5px solid #cfd5ddbd;
  box-shadow:0 2px 4px rgba(12,24,54,.04),0 24px 44px -26px rgba(12,24,54,.28);overflow:hidden;display:flex;align-items:center;justify-content:center}}
.plate img{{width:74%;height:66%;object-fit:contain}}
.txt{{position:absolute;left:612px;right:60px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}}
.nm{{font-family:Questrial,sans-serif;font-size:{size}px;line-height:1.05;letter-spacing:-.005em;color:#1A1A18;white-space:nowrap}}
.nm span{{color:#565C64}}
.av{{margin-top:22px;font-size:27px;font-weight:300;color:#2a2c30}}
.tags{{margin-top:30px;display:flex;gap:10px;flex-wrap:wrap}}
.tags b{{font-weight:400;font-size:19px;color:#15263E;border:1.25px solid #a3adbd;border-radius:999px;padding:7px 18px}}
.logo{{top:auto;bottom:56px;left:auto;right:62px;height:36px}}
</style><div class="silk"></div>
<div class="plate"><img src="{src}"></div>
<div class="txt"><p class="nm">{base}<span>.{ext}</span></p><p class="av">Premium domain, available for acquisition</p>
<div class="tags">{''.join(f'<b>{c}</b>' for c in d['categories'])}</div></div>
<img class="logo" src="/assets/svg/logo-v4.svg">
<script>document.fonts.ready.then(()=>{{const n=document.querySelector('.nm');let f=parseFloat(getComputedStyle(n).fontSize);while(n.scrollWidth>n.clientWidth&&f>40)n.style.fontSize=(f-=1)+'px';}})</script>"""

def main(only=None):
    OUT.mkdir(exist_ok=True)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=str(DIST))
    srv = socketserver.TCPServer(("127.0.0.1", 0), handler); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    tmp = DIST / "_og"; tmp.mkdir(exist_ok=True)
    jobs = [("site", site_html())]
    for f in sorted((ROOT / "content/domains").glob("*.json")):
        if f.name.startswith("_"): continue
        jobs.append((f.stem, domain_html(json.loads(f.read_text()))))
    if only: jobs = [j for j in jobs if j[0] in only]
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": 1200, "height": 630})
        for name, html in jobs:
            (tmp / f"{name}.html").write_text(html)
            pg.goto(f"http://127.0.0.1:{port}/_og/{name}.html"); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(200)
            pg.screenshot(path=str(OUT / f"{name}.jpg"), type="jpeg", quality=88)
        b.close()
    srv.shutdown()
    print(f"Wrote {len(jobs)} sharing images to content/og/")

if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
