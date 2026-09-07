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
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(SEC)) out.headers.set(k, v);
    return out;
  },
};
