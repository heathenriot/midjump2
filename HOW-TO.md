# How to change things (no coding needed)

**The one rule:** everything you will ever edit lives in the **`content`** folder. Don't touch `src`, `build.js` or anything else unless someone who knows code tells you to.

**Your safety net:** every time you save a change, Cloudflare first runs a check. If you made a typo, it stops and says what's wrong in plain English (open the failed build's log on Cloudflare). **A failed build never touches the live site**, and every change can be undone from GitHub (Commits → the change → Revert).

After any change: Cloudflare dashboard → your project → **Deployments → Create deployment** (until the GitHub–Cloudflare link is installed, saving alone doesn't publish).

---

## What's where

```
content/
  site.json       email, year, menu names, footer wording
  landing.json    home page words, the scrolling strip, the FAQ
  contact.json    contact page words
  gallery.json    collection page words + the filter tabs (categories)
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

## Add a logo concept to an existing domain
1. Upload the new `.svg` into `content/svg`.
2. Open the domain's file in `content/domains` → pencil icon. In `"logos"` add the file name at the end (comma after the one before it).
3. In `"carouselTweaks"` copy the last `{ ... }` block and paste it after itself (commas between blocks).
4. Commit, then create a deployment.

## Add a new domain
1. Open `content/domains/_template.json` → click the **copy** button.
2. Go to `content/domains` → **Add file → Create new file**. Name it the domain in lowercase, no .com, then `.json` — e.g. `zephyria.json`. Paste.
3. Change: `name`, `atomName`, `categories`, `tier`, `overview`, the logo file names, and `desktopOrder` / `phoneOrder` (a number nobody else has; lowest shows first). Commit.
4. Go to `content/svg` → **Add file → Upload files** → upload the logos whose names you wrote. Commit.
5. Create a deployment. The page, gallery card, sitemap entry and "More from the collection" links appear automatically.

## Add a domain to the home-page scrolling strip
1. Upload its strip logo (e.g. `m_Name.svg`) to `content/svg`.
2. In the domain's file add a line: `"marqueeLogo": "m_Name.svg",`
3. In `content/landing.json` under `"scrollerDomains"` add `{ "domain": "name", "width": 0.60 }` (name = the file name without `.json`). Order here = order in the strip.

## Remove a domain
Delete its file in `content/domains` → commit → deploy. (If it's in the scrolling strip, also delete its line in `content/landing.json`; otherwise the check tells you.) Its logos can stay in `svg`.

## Change a domain's categories or tier
Open its file in `content/domains`. `"categories"` can only use the names in `content/gallery.json` (AI, Cloud, Security, Data, Ventures) spelled exactly like that. `"tier"` is `"A"`, `"B"` or `"C"` and decides how often it appears in "More from the collection".

## Change the order domains appear in
Each `domain.json` has `desktopOrder` (3-column desktop grid) and `phoneOrder` (2-column phone grid). Smaller number = earlier. Numbers must be unique.

## Edit words on the site
Open the matching file in `content` (table above) → pencil icon → change only the text between the quote marks → commit. Keep all quote marks, commas and brackets. A stray `"` inside text must be written `\"`.

## Change the home-page scrolling strip
`content/landing.json` → `"scrollerDomains"`. Each line is a domain file name (without .json) plus a width. That domain's file must have a `"marqueeLogo"` (a logo file in `content/svg`).

## If a build fails
Cloudflare → Deployments → the failed one → View logs. Read the numbered list near the top; it names the file and the problem. Fix that, commit, deploy again. The old site stays up meanwhile.
