# Deployment Playbook

## What has broken, and why

Every production incident in this project traced back to the same root mistake: **code was deployed to production without being tested in a production-like environment first**. The Windows-specific build bugs made it worse by introducing silent errors that only appeared at deploy time.

Specific failures:

| Incident | Cause |
|---|---|
| API 404s in `3ff2d3cb` | `open-next.config.ts` excluded API routes from the default bundle but didn't deploy them as separate workers |
| Duplicate exports in `next-env.mjs` | OpenNext appends (not replaces) this file on Windows every time `wrangler deploy` is run back-to-back |
| "Cannot use edge runtime" build error | `export const runtime = 'edge'` on API routes produces no `.nft.json`, which Windows path bugs caused to land in the wrong bundle |
| Node_modules patches lost | Patches to `createServerBundle.js` and `helper.js` are not committed and are wiped by `npm install` |

---

## The correct sequence for every deploy

```
code change → commit → next build → opennextjs-cloudflare build → deploy staging → verify → deploy production
```

Never skip a step. Never deploy production directly from a Windows build that hasn't been verified on staging.

---

## Step-by-step

### 1. Code changes
- Work in a git worktree (Claude Code creates these automatically for each session)
- Test the dev server (`npm run dev`) before committing
- Commit to a feature branch, then merge to `main`

### 2. Next.js build
```bash
npm run build
```
- Check that all API routes appear as `ƒ (Dynamic)` **without** the edge runtime marker
- If any route shows `λ (Edge)` or similar, the `export const runtime = 'edge'` declaration is still present — remove it before continuing

### 3. Verify node_modules patches are in place
These two files have manually applied patches that are not committed. Check them after any `npm install`:

**`node_modules/@opennextjs/aws/dist/build/helper.js`** — line ~346 should be:
```js
try { fs.rmSync(options.outputDir, { recursive: true, force: true }); } catch (_) {}
```

**`node_modules/@opennextjs/cloudflare/dist/cli/build/open-next/createServerBundle.js`** — lines ~39 and ~58-68 should normalize backslashes with `.replace(/\\/g, '/')`.

If either patch is missing, re-apply it manually before building.

### 4. OpenNext build
```bash
npx opennextjs-cloudflare build
```
- Confirm the output says only **one** server function: `default`
- If it lists `api-posts`, `api-discover`, or `api-comments` as separate functions, stop — `open-next.config.ts` still has the broken separate function declarations

### 5. Fix `next-env.mjs` (Windows-only bug)
**Every time** on Windows, OpenNext appends to this file instead of replacing it. Before deploying, always check:
```bash
cat .open-next/cloudflare/next-env.mjs
```
It must have **exactly 3 lines**. If it has 6 or 9, truncate it:
```
export const production = {"NEXT_PUBLIC_REDDIT_PROXY_URL":"https://rededit-proxy.rededdit.workers.dev"};
export const development = {};
export const test = {};
```

### 6. Deploy to staging
```bash
npx wrangler deploy --env staging
```
- Staging URL: `https://rededit-staging.rededdit.workers.dev`
- Staging uses the same `rededit-proxy` service binding as production

### 7. Verify staging (do not skip)
Open staging URL and confirm:
- [ ] Home page loads posts
- [ ] Subreddit page loads posts  
- [ ] Clicking a post opens comments
- [ ] Discover page loads and subreddit links work
- [ ] Time filters (4h / 12h / 1d / 1w) change what posts are shown
- [ ] Sort modes (hot / new / top) all work

If any check fails → **stop, do not deploy to production**, investigate and fix.

### 8. Deploy to production
```bash
npx wrangler deploy
```
- Production URL: `https://rededit.rededdit.workers.dev`

### 9. Verify production
Repeat the staging checklist on the production URL.

---

## Rollback

If production breaks:
```bash
# List recent deployments
npx wrangler deployments list

# Roll back to a specific version
npx wrangler rollback <version-id>
```

Rollback is instant. The last known-good version ID is noted in each deploy session.

---

## Known Windows-specific gotchas

| Issue | When it occurs | Fix |
|---|---|---|
| `next-env.mjs` duplicate exports | Every consecutive `wrangler deploy` on Windows | Manually truncate to 3 lines before deploying |
| `createServerBundle.js` path mismatch | After `npm install` | Re-apply the `.replace(/\\/g, '/')` patch |
| `helper.js` EPERM on `.open-next` delete | After `npm install` | Re-apply the `try/catch` patch |
| WSL hanging | Occasionally | Run deploy steps natively on Windows (with above patches) |

---

## Rules

1. **Never deploy to production without staging passing first.**
2. **Never add `export const runtime = 'edge'` to API routes.** CF Workers is already edge; the declaration breaks OpenNext's bundling.
3. **Never declare edge function routes in `open-next.config.ts`** unless `wrangler.jsonc` routes are also configured to deploy those separate workers.
4. **The `next-env.mjs` check is mandatory before every production deploy on Windows.**
