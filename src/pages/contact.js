// Contact page (/contact). Words: content/contact.json. Look: src/styles/v2-contact.css.
import { esc } from "../lib/util.js";
import { site, contactText as C } from "../lib/data.js";
import { layout2, backdrop } from "../lib/layout2.js";

// "Portfolio": a touch more space r→t and t→f (from the design)
const heading = esc(C.heading).replace(/^Portfolio/, 'Po<span style="letter-spacing:0.02em">r</span><span style="letter-spacing:0.025em">t</span>folio');
const check = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12.5l3.5 3.5 7.5-8"/></svg>`;
const mail = `<a href="mailto:${site.email}" class="toast-a">${site.email}</a>`;
const num = (i) => String(i + 1).padStart(2, "0");

export const contact = () => {
  const F = C.fields;
  const body = `
${backdrop}
<div class="cpg"><div class="shl ctl">
<section aria-labelledby="ctitle">
<div class="wrap c-wrap">
<div class="toast c-ok" role="status" hidden><span class="toast-i" aria-hidden="true">${check}</span><span><b>Message received.</b> Thank you for your inquiry.</span><button type="button" class="toast-x" aria-label="Dismiss">×</button></div>
<div class="duo">
<div class="lcol">
<h1 id="ctitle">${heading}</h1>
<p class="intro">${esc(C.intro)}</p>
<div class="silk" aria-hidden="true"><img src="/assets/graphics/silk.jpg" alt=""></div>
</div>
<section class="navy efl" aria-label="Contact form">
<form class="c-form" data-key="${site.formKey}">
<input class="hp" type="text" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="flds stk">
<label class="fld"><input class="inp" type="text" name="name" placeholder="${esc(F.name)}" aria-label="${esc(F.name)}" autocomplete="name" required></label>
<label class="fld"><input class="inp" type="email" name="email" placeholder="${esc(F.email)}" aria-label="${esc(F.email)}" autocomplete="email" required></label>
<label class="fld full"><input class="inp" type="text" name="domains" placeholder="${esc(F.domains)}" aria-label="${esc(F.domains)}"></label>
<label class="fld full"><textarea class="inp" name="message" rows="4" placeholder="${esc(F.message)}" aria-label="${esc(F.message)}" required></textarea></label>
<div class="btns full"><button type="submit" class="btn"><span class="shn" aria-hidden="true"><i class="shr"></i></span><i class="spin" aria-hidden="true"></i><span class="bl">${esc(C.button)}</span><span class="va" aria-hidden="true">→</span></button></div>
</div>
</form>
<div class="toast err tfl t-red" role="alert" hidden><span class="toast-i" aria-hidden="true">!</span><span>Something went wrong. Please email ${mail} instead.</span><button type="button" class="toast-x" aria-label="Dismiss">×</button></div>
</section>
</div>
<div class="steps cards">
<div class="sdiv" aria-hidden="true"></div>
<h2 class="slbl">${esc(C.stepsHeading)}</h2>
<div class="sgrid">${C.steps.map((s, i) => `<div class="step"><span class="snum">${num(i)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join("")}</div>
</div>
</div></section>
</div></div>`;
  return layout2({ title: C.title, description: C.description, urlPath: "/contact", body, active: "/contact", page: "contact" });
};
