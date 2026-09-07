# Proposal: mount Kanto Tikki at hometikki.preattention.ai/claude

Per the standing rule, this patch is prepared but NOT applied — the main
worker belongs to the gold standard. Applying it is a one-line review for
Codex/Sophia.

## Change to cloudflare/wrangler.jsonc (main repo)
Add an assets binding pointing at the fork's kanto build:

    "assets": { "directory": "../../claude/hometikki-fork/kanto", "binding": "KANTO_ASSETS" }

(or copy the kanto/ folder into the main repo's cloudflare/ working dir at
deploy time — the directory just needs to exist relative to wrangler.)

## Change to cloudflare/src/index.ts (inside the authorized branch)
Before the proxy call, add:

    const url = new URL(request.url);
    if (url.pathname === "/claude" || url.pathname.startsWith("/claude/")) {
      const sub = new Request(
        new URL(url.pathname.replace(/^\/claude\/?/, "/") + url.search, url.origin),
        request
      );
      return env.KANTO_ASSETS.fetch(sub);
    }

Auth, security headers, and everything else stay exactly as they are —
the /claude branch sits AFTER isAuthorized() so the same credentials
gate it. Rollback = remove the branch + binding and redeploy.
