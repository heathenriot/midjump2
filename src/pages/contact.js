// Contact page (/contact).
import { esc } from "../lib/util.js";
import { site, contactText } from "../lib/data.js";
import { layout } from "../lib/layout.js";

/* ---------- contact ---------- */
export const contact = () => {
  const body = `
<div class="c-frame">
<section class="c-title d-only"><h1 class="mj-fade">${esc(contactText.heading)}</h1></section>
<section class="mj-title m-only"><h1 class="mj-fade">${esc(contactText.heading)}</h1></section>
<section class="c-form" aria-label="Contact form"><div class="c-inner">
<p class="c-intro">${esc(contactText.intro)}</p>
<div class="c-wrap">
<form class="mj-form" id="mj-contact" data-key="${site.formKey}">
<input class="mj-hp" type="text" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="mj-field"><input class="mj-input" type="text" name="firstName" placeholder="First name" aria-label="First name" autocomplete="given-name" required></label>
<label class="mj-field"><input class="mj-input" type="text" name="lastName" placeholder="Last name" aria-label="Last name" autocomplete="family-name" required></label>
<label class="mj-field"><input class="mj-input" type="email" name="email" placeholder="Email address" aria-label="Email address" autocomplete="email" required></label>
<label class="mj-field"><textarea class="mj-input" name="message" rows="4" placeholder="Enter your message" aria-label="Message" required></textarea></label>
<div class="c-actions"><button type="submit" class="mj-send"><span>Send inquiry</span><svg class="mj-chev" viewBox="0 0 242.333 242.333" aria-hidden="true"><path d="M80 38 L164 121.2 L80 204.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>
<p class="mj-err" role="alert" hidden>Something went wrong. Please email ${site.email} instead.</p>
</form>
<div class="mj-note" role="status" aria-live="polite"><p class="t">Message received.</p><p class="s">Thank you for your inquiry.</p><button type="button" class="mj-again">Send another</button></div>
</div>
</div></section>
</div>`;
  return layout({ title: contactText.title, description: contactText.description, urlPath: "/contact", body, active: "/contact" });
};


