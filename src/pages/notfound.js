// 404 page (/404.html). Cloudflare serves it for unknown URLs (wrangler.jsonc: not_found_handling).
import { layout2, backdrop } from "../lib/layout2.js";

export const notFound = () => {
  const body = `
${backdrop}
<section class="nf" aria-labelledby="ttl">
<div class="wrap">
<h1 id="ttl" class="pg-h1">Page not found</h1>
<p class="nf-p">This page doesn’t exist or has moved. The full portfolio is in the Domain Collection.</p>
<a href="/domains" class="cta">View the collection</a>
</div>
</section>`;
  return layout2({ title: "Page not found | Midjump", description: "This page doesn’t exist or has moved.", urlPath: "/404", body, noindex: true });
};
