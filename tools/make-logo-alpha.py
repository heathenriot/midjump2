# Makes content/logo-alpha/<logo>.png: each domain's gallery logo with its white background made transparent
# ("colour to alpha", the same as the design canvas used). Re-run after changing a gallery logo:
#   python3 tools/make-logo-alpha.py
import re, base64, io, json, glob, os
import numpy as np
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, "content/logo-alpha"); os.makedirs(out, exist_ok=True)
n = 0
for f in sorted(glob.glob(os.path.join(root, "content/domains/*.json"))):
    if os.path.basename(f).startswith("_"): continue
    logo = json.load(open(f)).get("galleryLogo")
    if not logo: continue
    svg = open(os.path.join(root, "content/svg", logo)).read()
    m = re.search(r'href="data:im(?:g|age)/png;base64,([^"]+)"', svg)
    if not m: print("skip (no embedded png):", logo); continue
    a = np.asarray(Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert("RGBA")).astype(np.float64)
    c = a[..., :3]
    al = (255 - c).max(-1) / 255 * (a[..., 3] / 255)
    safe = np.where(al > 0, al, 1)[..., None]
    rgb = np.where(al[..., None] > 0, 255 - (255 - c) / safe, 255)
    img = np.dstack([np.clip(rgb, 0, 255), al * 255]).round().astype(np.uint8)
    Image.fromarray(img, "RGBA").save(os.path.join(out, logo.replace(".svg", ".png")), optimize=True)
    n += 1
print(n, "logos written to content/logo-alpha/")
