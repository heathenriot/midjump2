# Build notes (Midjump re-skin)
- Domain pages: SECOND carousel logo scale is relative to the viewer shape; on D3 it was set so the 2nd logo is ~6% narrower than the 1st (factor 0.84 in that card). Re-calibrate per viewer at build.
- Active nav link: NO special styling at all (user nixed it) — plain like other nav links; underline only on hover. Apply site-wide.
- Logo: content/svg/logo-v4.svg (main: +15%, round d/p with ring thinning matched to m/u), logo-v4-light.svg (+10%, light-on-navy), logo-v4-rounded-dots.svg (backup), logo-v4-previous.svg (pre round-d/p).
- Gallery order: order.txt ; optical boosts: boost.json
- Contact h1: extra letter-spacing r→t (0.02em) and t→f (0.025em) in 'Portfolio'. Carry into build.
- Contact form states (D4): Sending (spinner + "Sending…"), Success (in-card swap: check ring, "Message received.", "Thank you for your inquiry.", "Send another" link; or toast variant), Error (soft red notice with mailto). Apply same states to the domain-page inquiry card (D3).
- No domain prefill on /contact (domain pages have their own inquiry form).
- (Superseded by DESKTOP-SPEC.md) Type scale: page H1 48px Questrial 600 (landing hero 56px); section H2 30px Questrial 600 on ALL pages (landing headings were 34/400).
- Landing acquiring cards: "Refined" copy (Choose your route / Pay with protection / Take ownership). Payment plans: available on all Atom listings, can also be requested.
- Nav band + hero backdrop: kept on all pages, see DESKTOP-SPEC.md.
- Hero headline: optional SVG outline (content/graphics/hero-heading.svg, Questrial + 1.75px stroke ≈ Chrome synthetic bold). Keep real <h1> text visually hidden for SEO/accessibility.

## Phone (see design/PHONE-SPEC.md)
- Category tags on domain pages link to /collection filtered by that category (desktop + phone).
- Domain-page logo carousel: add touch swipe on phone (not built on the canvas; arrows + dots only there).
- P1 marquee: pause off-screen / tab hidden / dragging / reduced motion; drag threshold 40 px.
- P2 back-to-top: show only on upward scroll past 1200 px.
- Sticky header everywhere on phone; blur on header::before so the dropdown blurs too.
- html/body overflow-x: clip on phone (decorative layers bleed past the column).
- Old landing card markup sits in a hidden div on P1 and inert props remain on several boards (e.g. leftover
  one-column logo formula on P2, `_d` keys in contact introText props): drop them in the build.
- P1 keeps desktop props nested under `$desktop` only because of the canvas Tweaks limit; irrelevant for the build.
