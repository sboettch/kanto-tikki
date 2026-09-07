# kanto.preattention.ai — live in three commands, zero contact with main

Unlisted public preview: no password (link-knowledge only), noindex header
so search engines never list it. Hostname isolation keeps the main site
untouchable from here: Codex's worker owns `hometikki`, this one owns
`kanto`; the deploy just adds the `kanto` DNS record + cert automatically.

    cd /Volumes/T9/bayarearealestate/claude/hometikki-fork/kanto/deploy
    bash build.sh          # stages the app into ./public (app files only)
    npx wrangler login     # the Cloudflare account that holds preattention.ai
    npx wrangler deploy

→ https://kanto.preattention.ai after ~a minute of DNS/TLS provisioning.
Updates later: bash build.sh && npx wrangler deploy.
Want the gate back someday? git history has the basic-auth worker (61614e5).
