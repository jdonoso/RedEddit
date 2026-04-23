#!/usr/bin/env node
// End-to-end smoke tests. Run after every deploy.
// Usage: node scripts/smoke-test.mjs https://rededit-staging.rededdit.workers.dev

const base = process.argv[2];
if (!base) {
  console.error('usage: node scripts/smoke-test.mjs <base-url>');
  process.exit(2);
}

let failures = 0;
function pass(name) { console.log(`  ✓ ${name}`); }
function fail(name, why) { console.error(`  ✗ ${name} — ${why}`); failures += 1; }

async function getJson(path) {
  const url = base + path;
  const res = await fetch(url);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, text, json, url };
}

console.log(`Smoke testing ${base}`);

// 1. Home page renders.
{
  const url = base + '/';
  const res = await fetch(url);
  const body = await res.text();
  if (res.status !== 200) fail('GET /', `status ${res.status}`);
  else if (!body.includes('<html')) fail('GET /', 'response missing <html>');
  else pass('GET /');
}

// 2. /api/posts returns posts.
let firstPost = null;
{
  const r = await getJson('/api/posts?limit=10&sort=hot');
  if (r.status !== 200) fail('GET /api/posts', `status ${r.status}: ${r.text.slice(0,200)}`);
  else if (!r.json || !Array.isArray(r.json.posts)) fail('GET /api/posts', 'no posts array');
  else if (r.json.posts.length === 0) fail('GET /api/posts', 'posts array is empty (Reddit upstream issue or all filtered)');
  else { firstPost = r.json.posts[0]; pass(`GET /api/posts (${r.json.posts.length} posts)`); }
}

// 3. /api/comments works on a real post from check 2.
if (firstPost && firstPost.id && firstPost.subreddit) {
  const r = await getJson(`/api/comments/${firstPost.id}?subreddit=${firstPost.subreddit}`);
  if (r.status !== 200) fail('GET /api/comments/{id}', `status ${r.status}: ${r.text.slice(0,200)}`);
  else if (!r.json || !r.json.post || !Array.isArray(r.json.comments)) fail('GET /api/comments/{id}', 'missing post or comments');
  else pass(`GET /api/comments/${firstPost.id}`);
} else {
  fail('GET /api/comments/{id}', 'skipped — /api/posts did not return a usable post');
}

// 4. /api/discover returns expected shape.
{
  const r = await getJson('/api/discover?subs=pics,gaming');
  if (r.status !== 200) fail('GET /api/discover', `status ${r.status}: ${r.text.slice(0,200)}`);
  else if (!r.json || !Array.isArray(r.json.suggestedSubs) || !Array.isArray(r.json.feed)) fail('GET /api/discover', 'missing feed/suggestedSubs');
  else pass(`GET /api/discover (${r.json.suggestedSubs.length} subs, ${r.json.feed.length} posts)`);
}

if (failures > 0) {
  console.error(`\nSmoke FAILED: ${failures} check(s) failed against ${base}`);
  process.exit(1);
}
console.log(`\nSmoke OK: all checks passed against ${base}`);
