// Kanto Tikki — public unlisted preview at kanto.preattention.ai.
// No auth gate (Sophia's call: link-knowledge only). Kept: noindex so
// search engines never list it, plus the same security headers family.
// Static assets only — no proxy, no origin, no contact with the main site.
const SEC: Record<string, string> = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // Redirect /fork to /fork/ for clean directory serving
    if (url.pathname === '/fork') {
      return Response.redirect(`${url.origin}/fork/`, 301);
    }

    let res = await env.ASSETS.fetch(request);

    // If an asset in /fork/ is not found (e.g. shared essence/* or portraits/*), fall back to root asset
    if (res.status === 404 && url.pathname.startsWith('/fork/')) {
      const fallbackUrl = new URL(request.url);
      fallbackUrl.pathname = fallbackUrl.pathname.replace(/^\/fork/, '');
      const fallbackReq = new Request(fallbackUrl.toString(), request);
      const fallbackRes = await env.ASSETS.fetch(fallbackReq);
      if (fallbackRes.status < 400) {
        res = fallbackRes;
      }
    }

    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(SEC)) out.headers.set(k, v);
    return out;
  },
};
