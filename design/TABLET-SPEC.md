# Midjump re-skin: tablet design spec

Snapshot of the approved tablet design, 2026-11-20. Same canvas as desktop and phone
(slug `e96297bb-48c8-42de-8fbb-eefc7c042cd3`), boards under `project/`:

| Board | Page | Width | Status |
|---|---|---|---|
| `T-Landing.dc.html` / `T-Landing-L.dc.html` | Landing (T1) | 820 / 1024 | locked |
| `T-Collection.dc.html` / `T-Collection-L.dc.html` | Domain collection (T2) | 820 / 1024 | locked |
| `T-Domain.dc.html` / `T-Domain-L.dc.html` | Domain page (T3) | 820 / 1024 | locked |
| `T-Contact.dc.html` / `T-Contact-L.dc.html` | Contact (T4) | 820 / 1024 | locked |
| `T-*-Locked.dc.html` | Frozen reference copies | | final tablet |

## Approach

Tablet is the **desktop design reflowing**, not a separate layout. Each board is the locked desktop page plus a
tablet layer:

- `@media (min-width:641px) and (max-width:1024px)`: applies to both orientations.
- `@media (min-width:641px) and (max-width:900px)`: portrait-only fixes. Below 900px the desktop's own fallback
  rules collapse grids to one column too early, so this layer restores multi-column layouts at tighter sizes.
- Breakpoints for the build: phone ≤ 640, tablet 641–1024, desktop ≥ 1025 (same as the old site). The phone boards
  were drawn at ≤ 600; move that cutoff to 640.
- A landscape iPad Air (1180) gets desktop; the 1080 column fits.

Exact slider values are the `default`s in each board's `data-props`. Tablet-specific controls are at the top of
each board's list (sections "Tablet", "Tablet spacing", "Hero graphic", "Tablet: tags & background").

## Shared

- Side padding 32 px. Footer: 48 px above the logo on landing, 56 px on the other pages. Section spacing 88 px
  (landing: 72 px from the hero divider to "Selected names").
- Header: desktop header unchanged (nav links stay visible).
- **Hero silk** runs edge to edge (box extends 32 px past the column on both sides). Its edge fades live on the
  *box*, not the image, so moving/zooming/rotating the image never exposes a hard edge.

## T1 Landing

- Hero graphic (both widths): opacity .4, brightness .9, contrast .92, blur 5.5 px, zoom 1.3, anchor 100% / 28%,
  move (5 px, −140 px), rotate 0, fades top 0 / bottom 40% / left 60% / right 44%.
- `belowHeroLift` 150 px: the hero divider and everything below slide up over the lower part of the graphic
  (hero box stays 600 px; next section layered above). A second fade ends at the divider (90 px long).
- Selected names: 4 per row on both widths, names 14.5 px in portrait. Logos full colour (no hover on touch).
- Portrait: acquiring block keeps three cards across (padding 30/32/16, head gap 22, titles 17 px wrapping,
  text 15 px); heading 30 px left, "Secured through" + Atom | Escrow at the right edge, scaled down
  (label 12.5 px, Atom 11.5, Escrow 15). FAQ heading on one centred line (30 px), list centred, max 560 px.

## T2 Domain collection

- Hero = landing snapshot, tuned: blur 16, zoom 1, anchor 100% / 100%, move (−10, −150); extra fade behind the
  cards from 250 px over 200 px.
- Portrait 3 per row, landscape 4. Unselected pills: fill `#F5F6F8` (matches desktop, 2026-11-20), border `#a3adbd`, soft shadow.
- Blurred silk + white glows behind the card list (silk .31, glow .5), cards have a faint resting shadow.
- Floating back-to-top (44 px, 24 px right / 28 px bottom), shown only on upward scroll past 1200 px.

## T3 Domain page

- Hero snapshot from T2 (switchable to T1 or custom on the board).
- Portrait: **two columns**: left (carousel, About, Ideal for) + 340 px buy card on the right, still sticky;
  buy-card buttons stacked full width. Logo card 320 px tall with tighter inner padding and an 8 px downward
  nudge so logos keep their size and sit centred. Buy-card top glow lowered to .18 (narrow card). Ideal for card
  gets the phone's 2 px accent line (`#7A89A8`); card icons 17 px at 35% opacity.
- Landscape: desktop two-column layout.

## T4 Contact

- Portrait: two columns (38% / rest, gap 28): title 42 px + intro 17.5 px + silk graphic on the left, form card on
  the right (padding 30). Steps three across, titles wrap. The silk is visible from the left because of the
  two-column layout (that is the page's hero graphic).
- Error message ("floating toast under button") wraps to two lines, 330 px wide; icon and close button never shrink.

## Cross-device changes made during tablet work

- Buy-card icon removed on the domain page (desktop, phone, tablet).
- Domain extension in the page title lightened to `#8A9099` on every device.
- Toast icons `flex: none` on phone and tablet contact.
