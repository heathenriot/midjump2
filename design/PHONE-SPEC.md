# Midjump re-skin: phone design spec

Snapshot of the approved phone design, 2026-11-20. Same canvas as the desktop
(**"Domain portfolio — landing page mockup"**, slug `e96297bb-48c8-42de-8fbb-eefc7c042cd3`), boards under `project/`:

| Board | Page | Status |
|---|---|---|
| `P-Landing.dc.html` | Landing (P1) | locked |
| `P-Collection.dc.html` | Domain collection (P2) | locked |
| `P-Domain.dc.html` | Domain page, built on Triaged.si (P3) | locked |
| `P-Contact.dc.html` | Contact (P4) | locked |
| `P-*-Locked.dc.html` | Frozen reference copies | final phone |

Boards are 390 px wide; build the phone cutoff at 640 px (tablet starts at 641, see `TABLET-SPEC.md`). Phone rules live in `@media (max-width:600px)` on top of the locked desktop page, so
everything not listed here inherits from `DESKTOP-SPEC.md`. **Exact slider values are the `default`s in each board's
`data-props`** (the Tweaks panel writes the owner's choices there); this file records the structure, the decisions
and the key numbers. On P1 the desktop props are nested under `$desktop` to stay under the panel's 127-prop limit.

## Shared on every phone page

- Side padding 20 px. No horizontal overflow: `html, body { overflow-x: clip }` (several decorative layers bleed past the column on purpose).
- **Header:** sticky, 76 px. Logo left, 30 px tall. 44x44 burger right (three 1.75 px bars, morphs to an X).
  Blur lives on `header::before` (`color-mix(#F3F4F6 88%, transparent)`, `blur(10px) saturate(1.1)`), not on the
  header itself, so the dropdown can blur too (nested backdrop-filters only blur the parent's content).
  Bottom line runs edge to edge.
- **Menu:** drops from under the header with the same blur. Links right-aligned, Questrial 21 px; a small navy square
  slides in beside a link on tap. A transparent full-screen overlay closes it on any outside tap.
- **Hero silk backdrop** (P2-P4): the landing silk under the header, box 576 px tall, opacity .7, position 100% / 34%,
  zoom 1.4, blur 12 px, brightness 1.03 contrast .92, bottom fade from 180 px over 190 px (softness .15, same eased curve as desktop).
  P1 has its own hero silk (zoom 1.5, X 88 %, Y 51 %, blur 8.5, opacity .3, fade bottom 46 %, left 37 %).
- **Section headings:** Questrial 400 + 0.35 px stroke (same as desktop), 26-28 px.
- **Footer:** padding 44/20/28. Email 23 px, tagline 16.5 px, Escrow mark 20.5 px, gap 17 px. Links `#dde3ee` on one
  row, copyright alone on the last row in `#7f8ba6`. Divider solid to 248 px then fades over 120 px.
- Tap targets: cards get the hover lift on `:active` too.

## P1 Landing

- Hero heading as four single-line SVG outlines (`content/graphics/phone/hero-phone-L1..L4-<stroke>.svg`,
  Questrial 46 px, line-height 1.2, letter-spacing .1; strokes 1.15 lighter / **1.44 matched** / 1.85 heavier).
  Real `<h1>` text stays, visually hidden. Gaps: lines 1-2 -2.5 px, lines 3-4 -9 px.
- Subheading 18 px / 300, on one flowing line (the desktop `<br>` hidden; a real space keeps the comma spacing).
- CTA 212 x 46, 15 px / 500.
- **Selected names:** label on two lines, "View all →" underneath. A 2x2 marquee of the eight cards (two pages):
  slides every 3.5 s (slide 0.7 s), draggable/swipeable, dots below. Pauses off-screen (IntersectionObserver),
  when the tab is hidden, while dragging, and under `prefers-reduced-motion`. Full-colour logos (no hover on touch).
  **Logo size matches the P2 two-column cards** (logo scale .93, same 4:3 plate and optical boost).
- **Acquiring a domain:** navy block, heading centred on top; the three cards with number + title on one line and
  text below; colours: numbers `#c9d0df7d` 13.5 px, text `#c8d0e4`, heading + titles `#f9f6ea`. "Secured through
  Atom | Escrow" centred at the bottom under a fading divider. (A "glass" variant exists on the board; not chosen.)
- **FAQ:** heading "Frequently Asked / Questions" centred. Phone wording: "How does purchasing work?",
  "Are payment plans available?". Q1 answer split into two paragraphs.

## P2 Domain collection

- Title "Domain Collection" 40 px at 44 px from the header, with a 1-per-row / 2-per-row switch on the right.
  **Default: one card per row.**
- Category pills wrap onto two rows (no sideways scroll). First pill reads **"All Domains"** (so a filtered view is
  never mistaken for the whole portfolio). Inactive pills: border `#a3adbd`, fill `#F5F6F8` (matches desktop, 2026-11-20), soft shadow.
- Filter mode **Hide others** (dimming makes no sense in one column).
- Faint stretched silk + white glows behind the card list (opacity .31, blur 54, width 220 %, length 1600 px).
- **One-column cards:** 16:9 plates (old site shape). Logo sizing follows the desktop gallery exactly, scaled to the
  plate: each image gets an explicit width = `fileWidth x min(.76/W, .66/H) x .93 x S x opticalBoost x Z` (in % of the
  plate width, Z = 1) and is centred with `left/top: 50%` + `translate(-50%,-50%)`, then offset with `margin`
  (% of plate width) by the desktop baseline position: `(.015 + .93 x (0.18571 - s x k)) x Z - .024`.
  Per-logo nudges for eight logos and the ink data are in `design/data/logo-ink.json`.
  (An absolutely positioned image inside a CSS grid plate resolves its box against the grid area, which is why the
  geometry is set explicitly instead of relying on `object-fit`.)
- Two-column cards: identical to the desktop gallery formula.
- **Back to top:** navy round button (38 px, 18 px from the right, 24 px from the bottom). Appears only when the
  visitor scrolls **up** after passing 1200 px; hides again on scroll down.
- Scroll fade on cards was tried and turned off.

## P3 Domain page

- Title 40 px, category tags as small pills. **Tags link to the gallery filtered to that category.**
- Order: logo carousel (268 px tall, arrows 38 px) → About → Ideal for → divider → buy card → divider → More from the collection.
  Gap between cards 24 px; both dividers have 48 px above and below. The "More from" heading is pulled up 5 px
  (line-height 1.1) so its gap looks equal to the hard-edged card's.
- Second logo concept 12 % larger than on desktop (`phSecondLogo` 1.12).
- Buy card: not sticky, padding 24 px, icon removed and heading centred, 18 px under the heading,
  buttons stacked full width (Send inquiry, then View on Atom.com).
- Related domains: 2x2 grid, desktop card formula.
- No back-to-top (page is ~3 screens).

## P4 Contact

- Title "Portfolio Inquiries" 40 px, intro 17 px.
- Decorative silk under the intro hidden on phone.
- Form card full width, padding 24 px, fields stacked, field text 16 px (stops iOS zoom on focus).
- Success / error messages fit the screen width and wrap (desktop ones are single-line).
- "What happens next": the three step cards stacked, titles allowed to wrap.

## Copy changes (phone and desktop)

- Contact intro (desktop + phone): "Interested in a name from the collection, or have a question about the portfolio?
  Send us a message and we'll get back to you."
- Contact step 1 ends "…we review the details and reply to you **directly**." (was "personally").
- Collection: first pill "All Domains" (phone).

## Phone refinements, 2026-11-21 (checked on a Samsung A54: Chrome zoom makes it lay out at ~330px)
- Two-per-row cards (landing slider, gallery 2-per-row) became **tile + caption**: a light tile `#FAFBFC` holding the logo,
  1.25px border `#cfd5ddbd` drawn as a ring on top (thickness never shrinks the logo), resting shadow at 0.65,
  name underneath, centred, 13.5px, 10px gap; 18px between rows. Gallery one-per-row cards unchanged.
- Hero silk opacity 0.5 (was 0.3), blur 6px (was 8.5). Section headings 24.5px (was 26).
- Acquiring card: step titles 16.5px, text 14px.
- Footer: tag 15.5px, Escrow mark 19px nudged up 0.25px (its capitals match the tag's lowercase height, baseline aligned);
  divider fades out 248 → 283px.
- Gallery (phone): first pill "All"; pills 35px tall, 10px side padding, label 13.5px, count 12px (5px from the label), 6px apart (8px between rows),
  so the tags fit on two lines down to ~316px. One-per-row cards: grey logo tile `#EEEFF2` (1.5px `#CFD5DD` border, radius 8,
  shadow 0.5) inside a light card (`#fafbfc` lightened 20%, border `#ECEEF1`) with a soft glow `#cfd5dda8` at 0.55, size 105%,
  placed per card from the domain name (seed 1). Backdrop silk blur 6px.
- Tile borders are inset outlines (pixel-snapped, even on all sides) rather than a drawn ring.
- Universal phone rules from here on: the stronger hero silk (opacity up, blur 6) on every phone page; acquiring-card sizes
  (title 16.5px, text 14px) also for the domain page's acquiring, About and Ideal-for cards and the contact card + step cards;
  the footer is shared by every page.
