# Deployment Playbook

## TL;DR

```bash
npm run deploy:staging   # build + deploy to staging + smoke tests
# verify staging in a browser
npm run deploy:prod      # only after staging passes
wrangler tail rededit    # watch prod for 2-5 min
```

If anything fails, the chain halts before reaching production. There are no manual steps on Windows anymore — `fix-next-env.mjs`, `patch-package`, and `preflight.mjs` cover the gotchas that used to cause incidents.

---

## What the scripts do

| Script | Purpose |
|---|---|
| `scripts/preflight.mjs` | Blocks deploys from worktrees, off-main branches, dirty trees, or out-of-sync `origin/main` |
| `scripts/fix-next-env.mjs` | Rebuilds `.open-next/cloudflare/next-env.mjs` from `.env.production` after every CF build (Windows-only OpenNext bug appends instead of replaces) |
| `scripts/smoke-test.mjs` | Hits `/`, `/api/posts`, `/api/comments/{id}`, `/api/discover` against the deployed URL. Non-zero exit halts the deploy chain. |
| `patches/` | Persists node_modules patches via `patch-package`. Re-applied automatically on `npm install` via the `postinstall` hook. |

## URLs

- Staging: https://rededit-staging.rededdit.workers.dev
- Production (Cloudflare): https://rededit.rededdit.workers.dev
- Production (Vercel): auto-deploys on every push to `main` (separate target — see below)

## Rollback

```bash
wrangler deployments list           # find a known-good version id
wrangler rollback <version-id>      # instant
```

Rollback is per-environment. For staging: `wrangler rollback --env staging <id>`.

For Vercel: use the Vercel dashboard ("Promote previous deployment").

---

## Vercel asymmetry — read this

Pushing to `main` triggers **two** independent deploys:

1. **Cloudflare** — only if you run `npm run deploy:*` locally (or, post-Phase 2, via GitHub Actions). Has a staging gate.
2. **Vercel** — auto-deploys to production on every push. **No staging gate.**

Differences that matter:

- Cloudflare Workers is edge by default; Vercel uses Lambda by default. Vercel needs `export const runtime = 'edge'` on API routes to bypass Reddit's IP block of Lambda IPs.
- Removing the edge runtime to fix Cloudflare bundling silently breaks Vercel.
- Until CI/CD on Linux lands (Phase 2), do NOT re-add `export const runtime = 'edge'` — the Windows OpenNext build mishandles it.

## Rules

1. **Production is dual-target.** Cloudflare AND Vercel both serve traffic. Verify both after a deploy.
2. **Never deploy to Cloudflare prod without staging passing first.**
3. **Never add `export const runtime = 'edge'` to API routes** until Phase 2 (Linux CI) is in place.
4. **Never declare separate edge functions in `open-next.config.ts`** without matching `wrangler.jsonc` worker routes — this caused incident `3ff2d3cb`.
5. **Deploys run from the main checkout, never a worktree.** Preflight enforces this — multiple worktrees share `.open-next/` and race.

## When something breaks at deploy

1. Check which target failed (Cloudflare or Vercel).
2. For Cloudflare: smoke test output points at the failing endpoint. Check `wrangler tail` for runtime errors.
3. For Vercel: check the Vercel dashboard build/runtime logs.
4. If both: it's a code bug, not a build/deploy issue.
5. Roll back on the affected target while investigating.

## Drift policy

Any binding, env var, secret, or compat flag added to top-level `wrangler.jsonc` MUST also be added under `env.staging`. Any new Cloudflare secret set via `wrangler secret put` in prod must also be set with `--env staging`.
