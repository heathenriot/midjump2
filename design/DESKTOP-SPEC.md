# Midjump re-skin: desktop design spec

Snapshot of the approved desktop design, 2026-11-18. The design lives on the canvas artifact
**"Domain portfolio — landing page mockup"** (slug `e96297bb-48c8-42de-8fbb-eefc7c042cd3`,
https://claude.ai/artifact/VpXRvrXf11DcDpA4f7vd5t), boards under `project/`:

| Board | Page | Status |
|---|---|---|
| `D-Landing.dc.html` | Landing | approved, lock pending |
| `D-Collection.dc.html` | Domain collection (gallery) | approved |
| `D-Domain.dc.html` | Domain page (built on Triaged.si) | approved |
| `D-Contact.dc.html` | Contact | approved |
| `*-Locked.dc.html` | Reference copies | to be refreshed after the heading decision |

The canvas is the source of truth for anything not written here. This file is the list of values to
carry into `content/theme-desktop.jsonc` / `site.css` when the re-skin is built. It supersedes the
older "Midjump Redesign Directions" canvas named in `HANDOFF.md`.

Rule from the owner: **all copy, SVGs and content stay as they are** unless listed under "Copy changes".

## Global

- Page background `#F2F3F5`. Text `#1A1A18`. Links `#15263E`, hover `#4A5B78` (faded navy, not blue), fade 0.3s.
- Column 1080px (+48px side padding each side). Section spacing 112px (landing currently 104 on canvas; use 112 everywhere unless told otherwise).
- Fonts: Finlandica Text (body, 300/400/500), Questrial (headings, single weight, "semibold" is synthetic), Plus Jakarta Sans (nav links, footer email).
- Text selection: `#15263E` bg / `#F9F8F6` text; on navy surfaces `#E6EAF2` / `#0A0F1D`.

### Header (identical on every page)
- Height 100px. Logo `content/svg/logo-v4.svg`, 44px tall, vertically centred.
- Nav links: Plus Jakarta Sans 500, 18px, letter-spacing -0.015em, gap 36px, 18px above the bottom border.
  Underline only on hover (1px, offset 6px). **No active-page style at all.**
- Band colour: `color-mix(in srgb, #f3f4f6 80%, #F2F3F5)`, full width, no side fades.
- Bottom border: 2px, `#d4d5da45`, fades to transparent over the first 10% and last 9% of the column.

### Hero backdrop (landing silk, repeated on every page)
- Image: the silk (`914edb66…` on canvas; same file as the landing hero). Box = column width x 600px, starting right under the header.
- `object-fit: cover; object-position: right bottom; mix-blend-mode: multiply; filter: brightness(.98) contrast(.92); opacity: .4`.
- Masks (intersected): bottom 25% fade; left fade 39%, right fade 44%.
- Landing: full box, plus a 3px bottom border `#e7e9f078` fading 28% / 40% at the ends.
- Collection, domain, contact: same box behind the page (z-index under content), plus
  - extra bottom fade: starts 150px, length 110px, softness 1 (eased curve in 21 stops: alpha = (1-k)(1-t) + k(1-smootherstep(t))^(1+k), k = softness),
  - diagonal corner fade: `linear-gradient(145deg, #000 40%, transparent 61%)` to remove the bottom-right shape.

### Type scale
- Page H1: Questrial 600 (synthetic), 48px, letter-spacing .1px. Landing hero H1 56px / line-height 1.2.
- Landing hero headline is rendered as an SVG outline (`content/graphics/hero-heading.svg`, Questrial 56px + 1.75 stroke ≈ Chrome synthetic bold) with the real `<h1>` text visually hidden. Left nudge 0.1px.
- **Section H2 (pending decision):** currently Questrial Regular 33px with a 0.35px `-webkit-text-stroke` (paint-order stroke fill) on all pages. Fallback if rejected: Questrial 600, 30–33px on all pages.
- Card titles: Questrial 600 (19px in navy step cards, 22px About/Ideal cards, 26px buy-card label).

### Footer
- `#0c1121` with a radial glow top-right `rgba(58,96,178,.28)`; bottom glow 0. Mark 30px at .9 opacity.
- Email in Plus Jakarta Sans 30px with `#3E4B73` underline; "Curated digital identities, secured through [Escrow]".

## Landing

- Hero text block: padding-top 58px. Subtitle Finlandica 300 21px. CTA "Explore the portfolio": pill, 49px tall, `#141C36`,
  finish "sheen edge + glow" (glow 0.2), hover = transparent bg with navy border/text, no arrow.
- "Selected names" section: 88px below the hero border. Eight cards, same card styling as the collection
  (optical size boost on), **logos navy-tinted at rest, full colour on hover**; hover border `#7a89a8`, lift 1px, shadow 0.25.
- "Acquiring a domain" navy block: padding 52 / 50 / 44 (top / sides / bottom), 28px heading gap, cards matched to the contact steps.
  Trust box: "Secured through" label above the Atom | Escrow logos, right-aligned, label `#bdc7de` at .75 with a static sheen `#E6EAF2` at 53%.
- FAQ: unchanged content; lines extend 60px left with stepped fades.

## Collection
- Title 48px, category pills (border `#BCC3CF`, hover `#5A6A85`, active navy fill), 4-col grid.
- Logos full colour, optical size boost on (`design/optical-boost.json`), order in `design/gallery-order.txt`.
- Card hover: border `#7a89a8`, lift 1px, shadow 0.25. Filter: dim others to 0.2.

## Domain page
- Pills under the title; left column = logo carousel card (384px) then About and Ideal-for cards; right = navy buy card 532px, sticky (24px).
- Second logo in the carousel scaled 0.84 relative to the first (see build notes).
- Buttons side by side: Atom (light, rest sheen 0.6) and Inquiry (outline, light 0.8, tint `#9AA6C2`); glow rest .55 / hover .15; arrow nudge 3.5px; no lift.
- Buy-card label: static sheen `#f7f7f5` at 46%. Colour icons: About A6, Ideal A2, Buy C1, 19px, opacity .65.
- Reuse the contact form states (sending / success / error) on the inquiry card.

## Contact
- Title "Portfolio Inquiries" with extra spacing r→t 0.02em, t→f 0.025em. Intro "Name from the collection" variant. Silk below the intro.
- Navy form card: Name, Email address, Domain(s) of interest, Message; full-width "Send inquiry" with arrow.
- Form states: Sending (spinner), Success (in-card: check ring, "Message received.", "Thank you for your inquiry.", "Send another"),
  Error "below the button" in soft alarm red, button label becomes "Try again".
- "What happens next": three cards (copy in canvas `D-Contact`, "Tailored" set, step 1 "Share your inquiry").

## Copy changes (approved)
- Landing acquiring cards ("Refined"): *Choose your route* / *Pay with protection* / *Take ownership* (exact text in canvas).
  Payment plans are available on every Atom listing and can also be requested.
- Contact intro, field names and the three step cards (see canvas).

## Assets in this repo
- `content/svg/logo-v4.svg` — final wordmark (+15% weight, square dots, round d/p). `logo-v4-light.svg` (+10%, for navy),
  `logo-v4-rounded-dots.svg` (backup), `logo-v4-previous.svg` (before the round d/p).
- `content/graphics/hero-heading.svg` — landing headline outline.
- `design/gallery-order.txt`, `design/optical-boost.json`, `design/build-notes.md`.

## Next
Phone layouts, then tablet, then the build into `src/` + theme files.
