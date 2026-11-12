# How to change things (no coding needed)

**The one rule:** everything you will ever edit lives in the **`content`** folder. Don't touch `src`, `build.js`, `preview.js` or anything else unless someone who knows code tells you to.

**Your safety net:** every time you save a change, Cloudflare first runs a check. If you made a typo, it stops and says what's wrong in plain English (open the failed build's log on Cloudflare). **A failed build never touches the live site**, and every change can be undone from GitHub (Commits → the change → Revert).

After any change: Cloudflare dashboard → your project → **Deployments → Create deployment** (until the GitHub–Cloudflare link is installed, saving alone doesn't publish).

---

## What's where

```
content/
  site.json       email, year, menu names, footer wording
  landing.json    home page words and the FAQ
  contact.json    contact page words
  gallery.json    collection page words + the filter tabs (categories)
  theme-desktop.jsonc    LOOK of the site on computers AND tablets (fonts, colours, sizes, gaps, lines)
  theme-phone.jsonc      LOOK of the site on phones (same idea, its own values)
  gallery-desktop.json   ORDER + logo size/position of the desktop & tablet gallery
  gallery-phone.json     same, for the 2-column phone gallery
  marquee.json           ORDER + size/position of the home-page scrolling logos
  domains/        ONE FILE PER DOMAIN (anthropize.json, nephele.json ...)
    _template.json  copy this to start a new domain
  svg/            EVERY logo, all together in one place
```

Only two folders: `domains` (the details) and `svg` (the pictures).

---

## Replace a logo
1. GitHub → `content` → `svg`. Find the file (use the search box "Go to file" at the top of the repo).
2. **Add file → Upload files**, drag in the new logo **with exactly the same file name** (capitals matter). It replaces the old one. Commit.
3. Create a deployment on Cloudflare.

Different file name? Then also open that domain's file in `content/domains` (pencil icon) and change the name under `"galleryLogo"` and `"logos"`.

## Change the browser-tab icon (favicon)
The icon files are `favicon.ico`, `favicon-32.png` and `apple-touch-icon.png` in `content/svg`. To change them, upload new files with exactly those names (the .ico should be 48x48 or 32x32, the .png files square).

## Add a logo concept to an existing domain
1. Upload the new `.svg` into `content/svg`.
2. Open the domain's file in `content/domains` → pencil icon. In `"logos"` add the file name at the end (comma after the one before it).
3. In `"carouselTweaks"` copy the last `{ ... }` block and paste it after itself (commas between blocks).
4. Commit, then create a deployment.

## Add a new domain
1. Open `content/domains/_template.json` → click the **copy** button.
2. Go to `content/domains` → **Add file → Create new file**. Name it the domain in lowercase, no .com, then `.json` — e.g. `zephyria.json`. Paste.
3. Change: `name`, `atomName`, `categories`, `tier`, `overview`, the logo file names, and save. Then add one line for it in `gallery-desktop.json` and one in `gallery-phone.json` (the build refuses to run until both have it). Commit.
4. Go to `content/svg` → **Add file → Upload files** → upload the logos whose names you wrote. Commit.
5. Create a deployment. The page, gallery card, sitemap entry and "More from the collection" links appear automatically.

## Home-page scrolling strip
Everything is in `content/marquee.json`. Each line is one domain: its strip logo file (in `content/svg`), `width` (room it takes on desktop), and separate `desktop` / `phone` blocks with `scale`, `x`, `y` like the gallery. **Line order = order in the strip.** To add a domain, upload its strip logo to `content/svg` and add a line; to remove one, delete its line.

## Remove a domain
Delete its file in `content/domains`, and its line in both gallery files (and in `marquee.json` if it's there) → commit → deploy. The check tells you if you forget one. Its logos can stay in `svg`.

## Change a domain's categories or tier
Open its file in `content/domains`. `"categories"` can only use the names in `content/gallery.json` (AI, Cloud, Security, Data, Ventures) spelled exactly like that. `"tier"` is `"A"`, `"B"` or `"C"` and decides how often it appears in "More from the collection".

## Change the order or logo position in the gallery
Open `content/gallery-desktop.json` (3 columns) or `content/gallery-phone.json` (2 columns). Each line is one domain; **the order of the lines is the order on the page**. To move a domain, cut its whole line and paste it somewhere else (keep the comma at the end of every line except the last).

On each line: `scale` = logo size (1 = normal, 0.9 = a bit smaller), `x` = move right (+) or left (-), `y` = move down (+) or up (-), in percent, e.g. `"x": "-3%"`.

**Pairing on the phone:** it fills two per row, so lines 1+2 are the first row, 3+4 the second, and so on. Put two domains next to each other to pair them, and nudge each one's `x`/`y` until their wordmarks line up.

## Change how the site looks (fonts, colours, sizes, gaps, lines)
Two files, so you never mix devices up:
- **`content/theme-desktop.jsonc`** = computers **and tablets** (tablets use exactly this file).
- **`content/theme-phone.jsonc`** = phones (screens 639px wide and narrower).

Open one. It is divided into labelled blocks (FONTS, COLOURS, NAVBAR, FOOTER, HOME PAGE, DOMAIN GALLERY PAGE, DOMAIN PAGES, CONTACT PAGE, and so on). Every line has a note on the right saying what it changes. Only change the value after the colon:

```
"logoHeight": "98px",     // Size of the midjump logo (bigger number = bigger logo)
```

- **Fonts:** pick from the three installed fonts only (the file lists them next to each setting). Each kind of text has one slot (headings, body, labels, navbar, footer), so one change updates that kind of text everywhere on that device.
- **Lines** (the dotted frame and dividers) are one line each: `{ "style": "dotted", "width": "1px", "color": "#B3B2A8" }`. Styles: solid, dotted, dashed, none.
- **Move/resize ALL gallery logos at once:** the `masterLogoScale`, `masterLogoX`, `masterLogoY` lines in the GALLERY block. Each domain's own tweak (in `gallery-desktop.json` / `gallery-phone.json`) still applies on top.
- **Undo a change:** delete that line and it goes back to the original look. A typo (a colour without `#`, a size without `px`, a misspelled name, a font that isn't installed) is caught by the build with a plain message that names the line, and the live site is untouched.

## Preview on your own computer (VS Code)
1. Install Node.js (nodejs.org, the LTS version), then in VS Code open the project folder.
2. Open the terminal (Terminal → New Terminal) and type: `node preview.js` then press Enter.
3. Open http://localhost:3000 in your browser. Every time you save a file in `content`, the site rebuilds and the page reloads by itself. If you made a mistake, the terminal tells you what and the last good version stays on screen.
4. Press Ctrl+C in the terminal to stop it.

Tablet check: in the browser, right-click → Inspect → the phone/tablet icon, then pick a tablet width (768 or 1024). Phones are widths under 640.

## Edit words on the site
Open the matching file in `content` (table above) → pencil icon → change only the text between the quote marks → commit. Keep all quote marks, commas and brackets. A stray `"` inside text must be written `\"`.

## If a build fails
Cloudflare → Deployments → the failed one → View logs. Read the numbered list near the top; it names the file and the problem. Fix that, commit, deploy again. The old site stays up meanwhile.
