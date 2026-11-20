# Makes content/logo-alpha/<logo>.png: each domain's gallery logo with its white background made transparent
# ("colour to alpha", the same as the design canvas used). Re-run after changing a gallery logo:
#   python3 tools/make-logo-alpha.py
# Logos made of several stacked layers (some with multiply blending) are drawn by headless Chrome first.
import re, base64, io, json, glob, os, subprocess, tempfile, shutil
import numpy as np
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, "content/logo-alpha"); os.makedirs(out, exist_ok=True)
def chrome_render(path, svg):
    w = int(float(re.search(r'<svg[^>]*\bwidth="([\d.]+)', svg).group(1)))
    h = int(float(re.search(r'<svg[^>]*\bheight="([\d.]+)', svg).group(1)))
    chrome = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chrome")
    if not chrome: raise SystemExit("needs Google Chrome for layered logo " + path)
    with tempfile.TemporaryDirectory() as td:
        page = os.path.join(td, "p.html"); shot = os.path.join(td, "s.png")
        open(page, "w").write(f'<html><body style="margin:0;background:#fff"><img src="file://{path}" style="display:block;width:{w}px;height:{h}px"></body></html>')
        subprocess.run([chrome, "--headless", "--no-sandbox", "--hide-scrollbars", "--allow-file-access-from-files", f"--window-size={w},{h}", "--screenshot=" + shot, "file://" + page], capture_output=True)
        return np.asarray(Image.open(shot).convert("RGBA")).astype(np.float64)

n = 0
for f in sorted(glob.glob(os.path.join(root, "content/domains/*.json"))):
    if os.path.basename(f).startswith("_"): continue
    logo = json.load(open(f)).get("galleryLogo")
    if not logo: continue
    path = os.path.join(root, "content/svg", logo)
    svg = open(path).read()
    layers = re.findall(r"<image\b", svg)
    m = re.search(r'href="data:im(?:g|age)/png;base64,([^"]+)"', svg)
    if len(layers) == 1 and m:
        a = np.asarray(Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert("RGBA")).astype(np.float64)
    else:
        a = chrome_render(path, svg)
    c = a[..., :3]
    al = (255 - c).max(-1) / 255 * (a[..., 3] / 255)
    safe = np.where(al > 0, al, 1)[..., None]
    rgb = np.where(al[..., None] > 0, 255 - (255 - c) / safe, 255)
    img = np.dstack([np.clip(rgb, 0, 255), al * 255]).round().astype(np.uint8)
    Image.fromarray(img, "RGBA").save(os.path.join(out, logo.replace(".svg", ".png")), optimize=True)
    n += 1
print(n, "logos written to content/logo-alpha/")
