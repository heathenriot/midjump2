# How to change things (no coding needed)

**The one rule:** everything you will ever edit lives in the **`content`** folder. Don't touch `src`, `public`, `build.js` or anything else unless someone who knows code tells you to.

**Your safety net:** every time you save a change, Cloudflare first runs a check. If you made a typo, it stops and says what's wrong in plain English (open the failed build's log on Cloudflare). **A failed build never touches the live site**, and every change can be undone from GitHub (Commits → the change → Revert).

After any change: Cloudflare dashboard → your project → **Deployments → Create deployment** (until the GitHub–Cloudflare link is installed, saving alone doesn't publish).

---

## What's where

```
content/
  site.json          email, year, menu names, footer wording
  landing.json       home page words, the scrolling strip, the FAQ
  contact.json       contact page words
  gallery.json       collection page words + the filter tabs (categories)
  domains/
    anthropize/      ← ONE FOLDER PER DOMAIN
      domain.json      its details (name, categories, tier, text, ordering)
      Anthropize.svg   its logos live right here, next to the details
      Anthropize1.svg
  _new-domain-template/   copy this to start a new domain
```

---

## Replace a logo
1. GitHub → `content` → `domains` → the domain's folder.
2. Click the old logo file → **⋯ (top right) → Delete file** → commit. *(Or skip this and just upload over it, see next step.)*
3. **Add file → Upload files**, drag in the new logo **with exactly the same file name** (capitals matter) → commit.
4. Create a deployment on Cloudflare.

Different file name? Then also open `domain.json` in that folder (pencil icon) and change the name where it appears under `"galleryLogo"` and `"logos"`.

## Add a logo concept to an existing domain
1. Upload the new `.svg` into the domain's folder.
2. Open its `domain.json` → pencil icon. In `"logos"` add the file name at the end (put a comma after the one before it).
3. In `"carouselTweaks"` copy the last `{ ... }` block and paste it after itself (again, commas between blocks).
4. Commit, then create a deployment.

## Add a new domain
1. Go to `content/_new-domain-template` → open `domain.json` → click the **copy button** (copy raw file).
2. Go to `content/domains` → **Add file → Create new file**. In the name box type: `newname/domain.json` (lowercase, no .com — e.g. `zephyria/domain.json`). The slash makes the folder.
3. Paste, then change: `name`, `atomName`, `categories`, `tier`, `overview`, the logo file names, and `desktopOrder` / `phoneOrder` (give each a number nobody else has; the lowest numbers show first). Commit.
4. Go into the new folder → **Add file → Upload files** → upload the logo files whose names you wrote in `domain.json`. Commit.
5. Create a deployment. The new page, gallery card, sitemap entry and "More from the collection" links appear automatically.

If something's missing or misspelled the build tells you exactly what, and nothing breaks.

## Remove a domain
Open its folder → **⋯ → Delete directory** → commit → deploy. (If it's in the home-page scrolling strip, also delete its block in `content/landing.json`, otherwise the check will tell you.)

## Change a domain's categories or tier
Open its `domain.json`. `"categories"` can only use the names in `content/gallery.json` (AI, Cloud, Security, Data, Ventures) spelled exactly like that. `"tier"` is `"A"`, `"B"` or `"C"` and decides how often it appears in "More from the collection".

## Change the order domains appear in
Each `domain.json` has `desktopOrder` (3-column desktop grid) and `phoneOrder` (2-column phone grid). Smaller number = earlier. Numbers must be unique.

## Edit words on the site
Open the matching file in `content` (table above) → pencil icon → change only the text between the quote marks → commit. Keep all quote marks, commas and brackets. A stray `"` inside text must be written `\"`.

## Change the home-page scrolling strip
`content/landing.json` → `"scrollerDomains"`. Each line is a domain folder name plus a width. A domain must have a `"marqueeLogo"` in its own `domain.json` (a logo file in its folder).

## If a build fails
Cloudflare → Deployments → the failed one → View logs. Read the numbered list near the top; it names the file and the problem. Fix that, commit, deploy again. The old site stays up meanwhile.
