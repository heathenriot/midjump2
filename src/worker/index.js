// Tiny Cloudflare Worker. It only runs when no page or file matches the request (pages are served directly).
// 1. Old midjump.com links used capital letters (/domains/CloudIndexing). Send any address with capitals to its
//    lowercase version with a permanent (301) redirect, so old Google results and links keep working.
// 2. Everything else that doesn't exist gets the 404 page.
// Retired domains and the old /about page are redirected in dist/_redirects (written by build.js).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (/[A-Z]/.test(url.pathname)) {
      url.pathname = url.pathname.toLowerCase();
      return Response.redirect(url.toString(), 301);
    }
    const page = await env.ASSETS.fetch(new URL("/404", url));
    return new Response(page.body, { status: 404, headers: page.headers });
  },
};
