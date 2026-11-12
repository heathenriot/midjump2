# Midjump rebuild: handoff note for a fresh Claude session

Written 2026-11-13 by the previous session. Read this first, then `HOW-TO.md` and `README.md`. This file is about *how we work*; those two are about *how the site works*.

## 1. The project in one paragraph

Redesign and rebuild **midjump.com**, a portfolio site for a collection of ~49 premium brandable domain names (each has logos, a description and an acquisition inquiry). The owner is **heathenriot** (GitHub), tweaks by eye, in small steps, and is very particular about pixels, colours and spacing.

- **Design canvas:** artifact "Midjump Redesign Directions", slug `f53def6c-81f1-4be9-9998-5b7ee22b985f`, https://claude.ai/artifact/XHSm5TGQUnGNKVenMWGxdL. Boards are `.dc.html` files under `project/`. It is the design source of truth: the user tweaks things there first, then we port to code.
- **Code rebuild:** https://github.com/heathenriot/midjump2 (public, branch `main`). Working dir `/home/claude/midjump2`.
- **Test site:** https://midjump2.heathenriot.workers.dev (Cloudflare Workers).
- **Live site:** midjump.com is the OLD site and is **untouched** until a later, reversible cut-over. The user sometimes screenshots the old site to show a target (e.g. "this tall"); treat it as a reference, not as a bug.
- **Old code, for reference only:** private repos `heathenriot/midjump1` (newest) and `heathenriot/midjump`. Attach with `mcp__claude-code-remote__add_repo`, clone to `/home/claude/midjump1`. Use it to check "how did the old version do X" (that is how we found the old `::selection` colour and `user-select:none` behaviour).
- **Claude Project "midjump"** holds docs `claude/rebuild-status.md`, `claude/portfolio-tiers.md`, `claude/redesign-decisions.md`. They are **stale** (nothing about logo, favicon, marquee, FAQ, colour changes). Offer to refresh them; don't trust them over the code.

## 2. How the repo works

Static site generator, no framework. `node build.js` writes `dist/`. `node preview.js` serves it locally with rebuild. Deploy = `npx wrangler deploy` (Cloudflare). **Pushes do NOT auto-deploy** (the Cloudflare GitHub app isn't installed), so after every push remind the user to create a new deployment in the Cloudflare dashboard (Deployments → Create deployment). The user will eventually download the repo zip and edit in VS Code.

```
content/              EVERYTHING the owner edits (JSON, no code)
  site.json landing.json contact.json gallery.json marquee.json
  gallery-desktop.json gallery-phone.json     order + logo size/position
  theme-desktop.jsonc theme-phone.jsonc       the LOOK (colours, sizes, gaps, lines)
  domains/*.json      one file per domain (+ _template.json)
  svg/                every logo
src/
  lib/theme-schema.js  list of every theme setting: [section,key,type,default,description]
  lib/theme.js         validates the jsonc against the schema (typos -> "did you mean")
  lib/data.js layout.js util.js
  pages/               landing.js domain.js gallery.js contact.js (HTML as template strings)
  styles/site.css      the ONE stylesheet; reads only CSS variables
  js/site.js           FAQ accordion, gallery, viewer behaviour
  fonts/               Finlandica Text, Questrial, Plus Jakarta Sans
```

### The theme system (most important thing to understand)
- `site.css` contains **no hard-coded design values**. Every value is a CSS var generated from the theme files via the schema.
- Desktop vars: `--t-<section>-<key-in-kebab-case>` (e.g. `domain.viewerHeight` → `--t-domain-viewer-height`). Phone vars: `--p-…`. Types: `color size num font line case`. A `line` setting also emits `-width/-style/-color`.
- **To add a setting you must touch 3 places, keeping defaults identical:** `src/lib/theme-schema.js` (the desktop list near the top, the phone list further down; the same `[section,key]` appears once in each), the matching `.jsonc` (with a `//` comment), and `site.css` using the var. Removing a setting: remove from all three, or validation fails on unknown keys.
- COLOR validation accepts hex and rgba.

### Responsive model
- **Desktop layout also serves tablets.** Phone is ≤ 639px: markup uses `.d-only` / `.m-only` (and `.l-d` / `.l-m` on landing); phone-only CSS lives inside `@media (max-width:639px)` and reads `--p-*` vars.
- Phone and desktop are tuned **independently**. Always ask or state which one a change applies to; if the user says "mobile" or "desktop" only touch that one. When ambiguous, pick the sensible one, say which, and offer the other.

## 3. How we iterate (the loop)

1. The user sends a short, casual request, often several items and often a screenshot ("shave some space under the buttons", "FAQ fonts smaller"). Nudges are usually 1-5px; "very slightly" means ~1-3%.
2. Make the change through the **theme settings first** (schema + jsonc + css), not by hard-coding.
3. `node build.js`, then **verify** (see §5). Never claim a visual result you haven't measured or looked at; say "I haven't looked at it in a browser" when you haven't.
4. Commit and push straight to `main` (no PRs). Confirm the push with `git ls-remote origin refs/heads/main` equal to `git rev-parse HEAD` (the checkout has no tracking info, so `git status` can't tell you).
5. Reply in 2-4 short sentences: what changed, the commit, "create a new Cloudflare deployment", and a one-line offer if there's a natural next step. No recaps of steps. The user reads on a phone.

### Commit format
Short imperative subject, then a blank line and these two trailers:
```
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_<current session id>
```
(Use the session URL given in the current session's system reminder, not the one from this note.)

### Opinions
The user often asks "what do you think?" (e.g. should the More link stay, should a hover turn navy). Give a short honest recommendation with the reason, then do what they decide. They are fine with "leave it as is".

## 4. Canvas (Design type) workflow
- Edit via `mcp__claude-artifacts__edit_version` with `path` (e.g. `project/L-Final.dc.html`), `base_version` = the live version, exact `old_text`/`new_text`.
- The user's open tab **auto-saves new versions every few seconds**: call `get_artifact` right before every edit. A 409 means the version moved (response includes `live`); a 422 "old_text not found" usually means the user changed saved defaults inside `data-props`: re-read that line and retry.
- `data-props` is an HTML attribute with `&quot;` escapes. Tweak editors: enum (options), range (min/max/step/unit), boolean, color, each with a `section`. Style holes `{{prop}}` work inside interpolated `style="--var: {{x}}; …"` strings.
- After publishing, tell the user to reload their canvas tab (stale code in an open tab made sliders look dead once).
- Don't render or screenshot the canvas unless asked; say "I haven't looked at the board".
- Boards: `L-Final.dc.html` (desktop landing, has the FAQ accordion), `L-MobileF.dc.html` (phone landing, finalised), tablet boards `L-TabletF` / `L-TabletFL` still have the OLD process list (offered, never requested).
- Typical use: user wants to *play* with a design, so build it with tweak controls, let them settle values, then port the final values to the theme files.

## 5. Verification tooling (recreate in /tmp if missing; /tmp may not survive)

Headless Chrome (`google-chrome --headless --no-sandbox`). Two gotchas: a headless window can't go below ~500px wide, so **real phone widths must be measured inside an `<iframe style="width:390px">`** served from the `dist` root (CSS paths are absolute `/assets/...`); and `pkill` prints "Terminated" (harmless).

`/tmp/shot1.sh dist outdir port width page…` screenshots (window 1440×7000, or 390×9000 for phone; crop with PIL afterwards, pages are mostly blank below content):
```bash
#!/bin/bash
D=$1; O=$2; P=$3; w=$4; shift 4; mkdir -p $O
(cd $D && python3 -m http.server $P >/dev/null 2>&1 &) ; sleep 1
for pg in "$@"; do
  n=$(echo "$pg" | tr '/?=' '___'); [ -z "$n" ] && n=home
  h=7000; [ $w = 390 ] && h=9000
  google-chrome --headless --no-sandbox --hide-scrollbars --window-size=$w,$h --virtual-time-budget=4000 --screenshot=$O/${n}_$w.png "http://localhost:$P/$pg" >/dev/null 2>&1
done
pkill -f "http.server $P"
```
`/tmp/measure.sh distdir port width page selector` prints an element's height: copy `dist` to /tmp/mm, inject a `<script>` before `</body>` that appends `<pre id=H>` with `getBoundingClientRect().height` of the selector on load, serve it, `--dump-dom`, grep the `<pre id="H">` text.

Handy test pages: `domains/agenticaider` (a domain page), `` (home), `collection`, `contact`. Useful selectors: `.dm-view` (viewer section incl. arrows), `.dm-viewer`, `.dm-sent`, `.dm-acq`.

## 6. Design decisions already made (don't relitigate)
- **Colour:** brand navy `#253A79` everywhere on desktop and phone (logo, nav links, arrows, atom logo, FAQ open state, selection highlight). Hover navy `#3A4E8C`. "Send inquiry" buttons use a lighter blue `#536FB0` (hover `#44609E`), text `#F3F2EE`, so the two buttons are distinct but both blue.
- **Selection / interaction:** `::selection` navy with `#F9F8F6` text (settings `colors.selectionBackground/selectionText`, desktop and phone). Buttons, links, images, logos, marquee cards, gallery tabs, related cards and FAQ rows are `user-select:none`; images not draggable.
- **Fields:** dotted underline turns **solid, same colour** on focus (no blue).
- **Gallery:** active category label turns navy, no dot underneath. Logo scale: desktop `masterLogoScale` 1.04, phone 1.08. Related ("More from the collection") thumbnails are greyscale at rest on **desktop only**, full colour on hover.
- **Domain page:** "Back to portfolio" links were removed (nav has Portfolio). "More from the collection" is centred and a real link on desktop and phone. Desktop viewer height 229px (the whole viewer section ≈324px, matched to a screenshot of the old site). Phone acquisition sentence is different text ("Purchase securely via Atom.com, or contact Midjump to arrange a direct transaction through Escrow.com.") at 14px so it holds three lines at ~320px (the owner's Samsung A21).
- **Landing:** desktop CTA stays quiet (cream, outline fades on hover) with the arrow turning navy on hover (`landing.buttonHoverChevronColor`). Desktop and tablet FAQ is an accordion (single-open, starts closed, number column / question / plus-minus, open row fill `#ECEBE5`, open question navy, active number black, ring around the icon only when open). Phone FAQ is a separate, smaller accordion (question 10.5px, answer 13px).
- **Phone marquee:** logos sit on cards (`#F3F2EE`, 1.5px `#F8F8F7` border, soft shadow), band `#EDECE6`, hero `#F3F2EE`, card names `#1E1E1C`.
- **Headings:** page titles on non-landing pages were shrunk (desktop gallery/contact 38px, domain name 42px; phone 23px) with rebalanced padding; phone nav height 87.5px.
- **Logos:** `content/svg/logo3.svg` (desktop) is the phone artwork in navy with the original viewBox `0 0 1388.4 541.5`; `logo-phone.svg` unchanged.

## 7. Current state and open items
- Latest pushed commit at time of writing: `708cd18` (phone acquisition padding 26px + smaller phone FAQ text). Everything the user asked for has been pushed. Nothing is pending from them.
- Offered but **not requested** (don't do unasked): tablet canvas boards still need the new FAQ; refresh the Project docs and `HOW-TO.md` for the logo/favicon/marquee/FAQ/colour changes; per-domain share images, schema.org markup, `/about` redirect, SVG optimisation (~6 MB total), Web3Forms key restriction, installing the Cloudflare GitHub app so pushes auto-deploy, a real-phone check, and the final reversible cut-over of midjump.com.
- The user said "FAQ q&a fonts smaller" without saying which; I did the phone one. If they come back saying it's still big, ask about desktop/tablet.

## 8. Style of working with this user
- Casual lowercase messages, many small asks per message, frequently typos; read for intent.
- They check on a real phone (Samsung A21, narrow) and on desktop; narrow-width wrapping matters.
- Be concrete about numbers (px before/after, setting names) and name the file/setting so they can tune it themselves later in VS Code.
- Be honest about what was and wasn't verified. Offer, don't push, extra work.
