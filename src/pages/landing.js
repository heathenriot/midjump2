// Home page (/). Its words live in content/landing.json.
import { esc } from "../lib/util.js";
import { domains, landingText } from "../lib/data.js";
import { layout } from "../lib/layout.js";

const mqItems = (kind) => [0, 1].map((copy) => landingText.scrollerDomains.map(({ domain: slug, width: ink }) => {
  const d = domains.find((x) => x.slug === slug);
  const slot = kind === "d" ? ` style="width:${(220 * ink + 66).toFixed(1)}px"` : "";
  return `<a href="/domains/${slug}" class="mq-item"${slot}${copy ? ' aria-hidden="true" tabindex="-1"' : ""}><span class="mq-logo"><img src="/assets/svg/${d.marqueeLogo}" alt="" loading="lazy" decoding="async"></span><span class="mq-name">${esc(d.base)}<span class="mq-ext">${esc(d.ext)}</span></span></a>`;
}).join("")).join("");
const arrow = `<svg viewBox="0 0 242.333 242.333" aria-hidden="true"><path d="M162 38 L78 121.2 L162 204.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
const T = landingText;
const br = (a) => a.map(esc).join("<br>");
const num = (i) => String(i + 1).padStart(2, "0");
export const landing = () => {
  const body = `
<div class="c-frame d-only l-d">
<section class="l-hero"><h1 class="mj-fade" style="text-align:center">${br(T.headlineDesktop)}</h1>
<p class="mj-fade mj-d1" style="text-align:center">${br(T.introDesktop)}</p>
<div class="mj-fade mj-d2 l-cta" style="justify-content:center"><a href="/domains" class="mj-hero-btn">${esc(T.buttonLabel)}${arrow}</a></div></section>
<section class="l-band" aria-labelledby="mq-label-d"><h2 id="mq-label-d" class="mj-row-label" style="padding-bottom:44px">${esc(T.scrollerLabel)}</h2>
<p class="mq-hint" aria-hidden="true">&lsaquo;&ensp;Drag to browse&ensp;&rsaquo;</p>
<div class="mq"><div class="mq-vp" data-secs="45"><div class="mq-track">${mqItems("d")}</div></div></div></section>
<section class="l-qa" aria-labelledby="qa-label-d"><h2 id="qa-label-d" class="mj-row-label">${esc(T.faqLabel)}</h2>
<dl>${T.faqDesktop.map(({ q, a }, i) => { const n = num(i); return `<div><dt><span class="n" aria-hidden="true">${n}</span><span>${esc(q)}</span></dt><dd>${esc(a)}</dd></div>`; }).join("")}</dl>
<div class="l-end" aria-hidden="true"></div></section>
</div>
<div class="m-only l-m">
<section class="l-hero"><h1 class="mj-fade">${br(T.headlinePhone)}</h1>
<p class="mj-fade mj-d1">${br(T.introPhone)}</p>
<a href="/domains" class="mj-cta mj-fade mj-d2"><span>${esc(T.buttonLabel)}</span>${arrow}</a></section>
<section class="l-band" aria-labelledby="mq-label-m"><h2 id="mq-label-m" class="row-label" style="padding-bottom:31px">${esc(T.scrollerLabel)}</h2>
<p class="mq-hint" aria-hidden="true">&lsaquo;&ensp;Drag to browse&ensp;&rsaquo;</p>
<div class="mq-vp" data-secs="20"><div class="mq-track">${mqItems("m")}</div></div></section>
<section class="l-qa" aria-labelledby="qa-label-m"><h2 id="qa-label-m" class="row-label">${esc(T.faqLabel)}</h2>
<div class="faq-list">${T.faqPhone.map(({ q, a }, i) => { const n = num(i); return `<div class="faq${i ? "" : " is-open"}"><button type="button" class="faq-q" aria-expanded="${i ? "false" : "true"}"><span class="faq-qt"><span class="faq-n" aria-hidden="true">${n}</span><span>${esc(q)}</span></span><span class="faq-ic" aria-hidden="true"></span></button><div class="faq-a"><div class="faq-ai"><p>${esc(a)}</p></div></div></div>`; }).join("")}</div>
<div class="l-end" aria-hidden="true"></div></section>
</div>`;
  return layout({ title: T.title, description: T.description, urlPath: "/", body, active: "" });
};


