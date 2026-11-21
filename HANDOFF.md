# Midjump: handoff note for a fresh Claude session

Written 2026-11-21. **The re-skin design is finished and built.** The next phase is fine-tuning the page *content* (copy, domain descriptions, SEO text), with occasional small design touch-ups.

## 1. The project

- **What:** midjump.com, a portfolio of ~49 premium brandable domain names. Each domain has logos, an About / Ideal-for description and an inquiry form.
- **Owner:** heathenriot. Tweaks by eye in small steps, very particular about pixels and spacing.
- **Repo:** https://github.com/heathenriot/midjump2, branch `main`. Push straight to `main`, no PRs.
  - Attach it with `add_repo` (owner `heathenriot`, repo `midjump2`, access push) and clone it.
- **Test site:** https://midjump2.heathenriot.workers.dev (Cloudflare Workers).
  - **Pushes don't auto-deploy.** After every push, remind the user to create a new deployment in Cloudflare.
- **Live site:** midjump.com is still the OLD site. It switches over later, reversibly.
- **Commits:** a short subject, then the attribution trailers given in the current session's system reminder.

## 2. How the site is built

`node build.js` writes `dist/`. `node preview.js` serves it locally.

- **Breakpoints:** phone ≤640px, tablet 641–1024px, desktop ≥1025px.
- **Page frame:** `src/lib/layout2.js` (header, phone menu, footer, favicons).
- **Pages:** `src/pages/` (`landing.js`, `gallery.js`, `domain.js`, `contact.js`). The HTML is template strings.
- **Styles:** `/assets/v2.css`, built from four files in this order:
  1. `content/theme.css`: the main values (colours, column, section gap, hero silk per size, card and tile variables).
  2. `src/styles/v2.css`: shared styles, landing and gallery.
  3. `src/styles/v2-domain.css`: domain pages.
  4. `src/styles/v2-contact.css`: contact page.
  - Tablet and phone rules sit next to each part, in `@media` blocks.
  - The domain and contact files were generated from the boards (`tools/gen-*.py`), then hand-edited below their "hand-written" line. Edit them by hand now; don't re-run the generators.
- **Script:** `src/js/v2.js` (phone menu, FAQ, gallery tabs and 1/2-per-row switch, domain carousel, Web3Forms forms, phone slider, back-to-top).
- **Logos on cards:** `content/logo-alpha/*.png` (white made transparent, rebuilt by `tools/make-logo-alpha.py`), positioned by `content/logo-fit.json`.
- **Graphics:** `content/graphics/`. Silk, mesh, Escrow mask, mark, and the hero headline SVGs (`phone/hero-phone-L1..L4-1.44.svg`). Desktop also uses those four pieces, joined in two rows at the font's natural word spacing.
- **Favicons:** `content/svg/favicon.svg` switches navy/light with the browser's theme. `favicon.ico`, `favicon-32.png` and `apple-touch-icon.png` are navy-tile fallbacks.
- **Old, unused system** (safe to delete in a clean-up pass, offered but never requested): `src/lib/layout.js`, `src/styles/site.css`, `src/js/site.js`, `src/lib/theme*.js`, `content/theme-*.jsonc`, `content/gallery-desktop.json`, `gallery-phone.json`, `marquee.json`.

## 3. Where the words live (the content phase)

All copy is JSON under `content/`.
- `site.json`: email, Web3Forms key, menu labels, footer tagline.
- `landing.json`: title and description (SEO), headline, intro, button, Selected heading and slugs, "View all", acquiring heading, "Secured through", the 3 steps, FAQ (questions can have a short phone version `qm`; answers are arrays of paragraphs).
- `gallery.json`: title, description, heading, category labels, "All" for phone, display `order`.
- `contact.json`: title, description, heading, intro, field placeholders, button, steps heading, steps.
- `domains/<slug>.json`, one per domain (see `_template.json`): `name`, `atomName` (the Atom.com link), `categories`, `logos`, and `overview`, where `overview[0]` is "About the domain" and `overview[1]` is "Ideal for".
  - The page's meta description is built from the first ~120 characters of Ideal for (falling back to About).

**Length matters:** long FAQ answers, step text and domain descriptions change card heights. The phone (the user tests on a Samsung A54 at about 320–330px CSS) is the tightest case. Check the wrapping after copy changes.

## 4. Design boards (only if a design revision is needed)

- **Canvas artifact** "Domain portfolio — landing page mockup": slug `e96297bb-48c8-42de-8fbb-eefc7c042cd3`, https://claude.ai/artifact/VpXRvrXf11DcDpA4f7vd5t. Backup copy: slug `150703a3-f0b3-49c5-9fe8-ce2ed3eaf938`.
- **Boards:** D1–D4 desktop, T1–T4 tablet (portrait and landscape), P1–P4 phone, each with a `-Locked` reference copy. **D-Hero** is a small desktop hero test board; its values are what's live now.
- **Boards vs site:** the boards were the design source, but the site has moved past some of them:
  - **Landing acquiring section:** no outer navy card on desktop or phone, with step cards on the page. Desktop has one glow and one border sheen across all three cards. The phone layout is on P1 (Phone: acquiring layout); the desktop version was built straight into the site.
  - **Desktop hero:** taken from D-Hero.
  - **Contact phone card padding:** 28/30px top and bottom.
  - Trust the code over the boards.
- **Canvas gotchas:**
  - The user's open tab autosaves every ~10s. Always re-read a board right before editing it, and expect 409s.
  - Write the `data-props` JSON with `&quot;` escapes and **raw** Unicode, never `°`-style escapes.
  - Prefer one `{{hole}}` per CSS variable.
  - Keep a board under 127 props; the Tweaks panel shows no more.
  - **D-Landing's sliders stopped responding** after edits and were restored to a pre-edit copy. The cause was never found. For new experiments, make a **small new board** (like D-Hero) instead of editing the big ones.

## 5. Working with this user

- Casual lowercase messages, several asks per message, often with a screenshot. Read for intent.
- Nudges are usually 0.5–5px. Be concrete: px before → after, and which file or variable, so they can tune it themselves later.
- Say which size(s) a change affects (phone/tablet/desktop). If they say "mobile", touch only phone.
- They ask "what's your take?" a lot. Give a short honest recommendation with the reason, then do what they decide.
- They like sliders on boards for visual decisions. For copy, just edit the JSON.
- **Verify with headless Chrome** (`google-chrome --headless --no-sandbox --hide-scrollbars --window-size=W,H --screenshot=…` against `python3 -m http.server` in `dist`). Never claim you checked something you didn't look at.
- Untested: a real successful form send (contact page and a domain page). Ask the user to try one.
- Final replies: short. What changed, the commit, "create a new Cloudflare deployment".

## 6. Detailed specs, if ever needed

`design/DESKTOP-SPEC.md`, `TABLET-SPEC.md`, `PHONE-SPEC.md` and `build-notes.md`. They describe the locked boards; the code is newer where they differ.
