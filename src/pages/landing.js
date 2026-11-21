// Home page (/). Its words live in content/landing.json; card logo placement in content/logo-fit.json.
import { esc } from "../lib/util.js";
import { card as baseCard } from "../lib/cards.js";
import { domains, landingText as T } from "../lib/data.js";
import { layout2, siteLd } from "../lib/layout2.js";

const bySlug = Object.fromEntries(domains.map((d) => [d.slug, d]));
for (const s of [...T.selected, ...(T.selectedPhone || [])]) if (!bySlug[s]) throw new Error(`content/landing.json "selected" lists "${s}" but there's no content/domains/${s}.json. Check the spelling.`);
const picks = T.selected.map((s) => bySlug[s]);
const card = (d, o = {}) => baseCard(d, { tint: true, ...o });

const num = (i) => String(i + 1).padStart(2, "0");
const [l1, l2] = T.headline;
const words = (line, a, b) => { const p = line.split(" "); const h = Math.ceil(p.length / 2); return `<span class="w${a}">${esc(p.slice(0, h).join(" "))}</span> <span class="w${b}">${esc(p.slice(h).join(" "))}</span>`; };

// Phone slider: two sets of four (2 x 2), filled column by column, plus a copy of the first set for a seamless loop.
const colm = (a) => [a[0], a[2], a[1], a[3]];
const phonePicks = T.selectedPhone ? T.selectedPhone.map((s) => bySlug[s]) : picks;
const setA = colm(phonePicks.slice(0, 4)), setB = colm(phonePicks.slice(4, 8));

export const landing = () => {
  const body = `
<section class="hero">
<div class="wrap"><div class="hero-box">
<span class="hero-line" aria-hidden="true"></span>
<div class="hero-art" aria-hidden="true"><img class="heroimg" src="/assets/graphics/silk.jpg" alt="" fetchpriority="high"></div>
<div class="hero-txt">
<h1 class="hh"><span class="hh-live"><span class="hl1">${words(l1, 1, 2)}</span><br><span class="hl2">${words(l2, 3, 4)}</span></span><img class="hh-svg" src="/assets/graphics/hero-heading.svg" alt="" aria-hidden="true"><span class="hh-svgp" aria-hidden="true">${[[1, 2], [3, 4]].map((r, k) => `<span class="hr hr${k + 1}">${r.map((i) => `<img class="l${i}" src="/assets/graphics/phone/hero-phone-L${i}-1.44.svg" alt="">`).join("")}</span>`).join("")}</span></h1>
<p class="hero-sub">${T.intro.map(esc).join('<span class="fsp"> </span><br>')}</p>
<a href="/domains" class="cta">${esc(T.buttonLabel)}</a>
</div></div></div>
</section>

<section class="sel" aria-labelledby="sel">
<div class="wrap">
<div class="sec-head">
<h2 id="sel" class="sh2">${esc(T.selectedHeading).replace(/ (the collection)$/, '<br class="sbr"> $1')}</h2>
<a href="/domains" class="vfc">${esc(T.viewAll)}<span class="vfc-a" aria-hidden="true"> →</span></a>
</div>
<div class="g4 sel-grid">${picks.map((d) => card(d)).join("")}</div>
<div class="mqv"><div class="g4">${[...setA, ...setB].map((d) => card(d)).join("")}${setA.map((d) => card(d, { hidden: true })).join("")}</div></div>
<div class="mqd">${[0, 1].map((i) => `<button type="button"${i ? "" : ' class="on"'} aria-label="Show set ${i + 1}"></button>`).join("")}</div>
</div>
</section>

<section class="acq-sec" aria-labelledby="how">
<div class="wrap"><div class="navy">
<div class="navy-head">
<h2 id="how" class="sh2">${esc(T.acquiringHeading)}</h2>
<div class="tbox"><span class="tlab">${esc(T.securedThrough)}</span><span class="tlogos"><span class="atm" role="img" aria-label="Atom.com"></span><span class="tdiv" aria-hidden="true"></span><span class="esc2" role="img" aria-label="Escrow.com"></span></span></div>
</div>
<div class="g3 acq">${T.steps.map((s, i) => `<div><span>${num(i)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join("")}</div>
</div></div>
</section>

<section class="qa-sec" aria-labelledby="qa">
<div class="wrap"><div class="split">
<h2 id="qa" class="sh2">${T.faqHeading.map(esc).reduce((acc, w, i) => acc + (i ? `<span class="fsp"> </span><br class="${i === 1 ? "fb1" : "fb2"}">` : "") + w, "")}</h2>
<div class="faql">${T.faq.map(({ q, qPhone, a }, i) => `<div class="faq"><button type="button" class="faq-q" id="faq-q${i}" aria-expanded="false" aria-controls="faq-a${i}"><span class="faq-n">${num(i)}</span><span class="qt">${qPhone ? `<span class="qd">${esc(q)}</span><span class="qm">${esc(qPhone)}</span>` : esc(q)}</span><span class="plus" aria-hidden="true">+</span></button><div class="faq-a" id="faq-a${i}" role="region" aria-labelledby="faq-q${i}"><div class="faq-ai">${(Array.isArray(a) ? a : [a]).map((p) => `<p>${esc(p)}</p>`).join("")}</div></div></div>`).join("")}</div>
</div></div>
</section>`;
  return layout2({ title: T.title, description: T.description, urlPath: "/", body, page: "home", extraHead: siteLd() });
};
