// Home page (/). Its words live in content/landing.json.
import { esc } from "../lib/util.js";
import { marquee, landingText } from "../lib/data.js";
import { theme } from "../lib/theme.js";
import { layout } from "../lib/layout.js";

const mqItems = (kind) => [0, 1].map((copy) => marquee.map(({ d, domain: slug, logo, width: ink, desktop, phone }) => {
  const t = (kind === "d" ? desktop : phone) || {};
  const fx = [["s", t.scale, 1], ["x", t.x, "0%"], ["y", t.y, "0%"]].filter(([, v, def]) => v !== undefined && String(v) !== String(def)).map(([k, v]) => `--${k}:${v}`).join(";");
  const slot = "";
  return `<a href="/domains/${slug}" class="mq-item"${slot}${copy ? ' aria-hidden="true" tabindex="-1"' : ""}><span class="mq-logo"><img src="/assets/svg/${logo}" alt=""${fx ? ` style="${fx}"` : ""} loading="lazy" decoding="async"></span><span class="mq-name">${esc(d.base)}<span class="mq-ext">${esc(d.ext)}</span></span></a>`;
}).join("")).join("");
const arrow = `<svg viewBox="0 0 242.333 242.333" aria-hidden="true"><path d="M162 38 L78 121.2 L162 204.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
const T = landingText;
const br = (a) => a.map(esc).join("<br>");
const num = (i) => String(i + 1).padStart(2, "0");
export const landing = () => {
  const body = `
<div class="c-frame d-only l-d">
<section class="l-hero"><h1 class="mj-fade">${br(T.headlineDesktop)}</h1>
<p class="mj-fade mj-d1">${br(T.introDesktop)}</p>
<div class="mj-fade mj-d2 l-cta"><a href="/domains" class="mj-hero-btn">${esc(T.buttonLabel)}${arrow}</a></div></section>
<section class="l-band" aria-labelledby="mq-label-d"><h2 id="mq-label-d" class="mj-row-label">${esc(T.scrollerLabel)}</h2>
<p class="mq-hint" aria-hidden="true">&lsaquo;&ensp;Drag to browse&ensp;&rsaquo;</p>
<div class="mq"><div class="mq-vp" data-secs="${theme.desktop.landing.marqueeSeconds}"><div class="mq-track">${mqItems("d")}</div></div></div></section>
<section class="l-qa" aria-labelledby="qa-label-d"><h2 id="qa-label-d" class="mj-row-label">${esc(T.faqLabel)}</h2>
<div class="faq-list">${T.faq.map(({ q, a }, i) => { const n = num(i); return `<div class="faq"><button type="button" class="faq-q" id="faq-d-q${i}" aria-expanded="false" aria-controls="faq-d-a${i}"><span class="faq-n" aria-hidden="true">${n}</span><span class="faq-qt">${esc(q)}</span><span class="faq-ic" aria-hidden="true"></span></button><div class="faq-a" id="faq-d-a${i}" role="region" aria-labelledby="faq-d-q${i}"><div class="faq-ai"><p>${esc(a)}</p></div></div></div>`; }).join("")}</div>
<div class="l-end" aria-hidden="true"></div></section>
</div>
<div class="m-only l-m">
<section class="l-hero"><h1 class="mj-fade">${br(T.headlinePhone)}</h1>
<p class="mj-fade mj-d1">${br(T.introPhone)}</p>
<a href="/domains" class="mj-cta mj-fade mj-d2"><span>${esc(T.buttonLabel)}</span>${arrow}</a></section>
<section class="l-band" aria-labelledby="mq-label-m"><h2 id="mq-label-m" class="row-label">${esc(T.scrollerLabel)}</h2>
<p class="mq-hint" aria-hidden="true">&lsaquo;&ensp;Drag to browse&ensp;&rsaquo;</p>
<div class="mq-vp" data-secs="${theme.phone.landing.marqueeSeconds}"><div class="mq-track">${mqItems("m")}</div></div></section>
<section class="l-qa" aria-labelledby="qa-label-m"><h2 id="qa-label-m" class="row-label">${esc(T.faqLabel)}</h2>
<div class="faq-list">${T.faq.map(({ q, qPhone, a }, i) => { const n = num(i); return `<div class="faq"><button type="button" class="faq-q" aria-expanded="false"><span class="faq-qt"><span class="faq-n" aria-hidden="true">${n}</span><span>${esc(qPhone || q)}</span></span><span class="faq-ic" aria-hidden="true"></span></button><div class="faq-a"><div class="faq-ai"><p>${esc(a)}</p></div></div></div>`; }).join("")}</div>
<div class="l-end" aria-hidden="true"></div></section>
</div>`;
  return layout({ title: T.title, description: T.description, urlPath: "/", body, active: "" });
};


