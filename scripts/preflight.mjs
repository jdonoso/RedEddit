#!/usr/bin/env node
// Pre-deploy git-state checks. Halts the deploy if anything looks unsafe.

import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

function fail(msg) {
  console.error(`\npreflight FAILED: ${msg}\n`);
  process.exit(1);
}

// 1. Not in a worktree — deploys must come from the main checkout.
//    Worktrees share node_modules and .open-next, so concurrent deploys race.
const gitDir = run('git rev-parse --git-dir');
if (gitDir.includes('worktrees')) {
  fail(`running from a git worktree (${gitDir}). Deploy from the main checkout (cd to the primary repo path).`);
}

// 2. Branch must be main.
const branch = run('git rev-parse --abbrev-ref HEAD');
if (branch !== 'main') {
  fail(`current branch is "${branch}", expected "main". Merge to main before deploying.`);
}

// 3. No uncommitted or untracked changes.
const status = run('git status --porcelain');
if (status) {
  fail(`uncommitted or untracked changes:\n${status}\nCommit or stash before deploying.`);
}

// 4. Up to date with origin/main.
try { run('git fetch --quiet origin main'); } catch { /* offline is OK to warn but not fail */ }
let local, remote;
try {
  local = run('git rev-parse HEAD');
  remote = run('git rev-parse origin/main');
} catch (e) {
  fail(`could not compare with origin/main: ${e.message}`);
}
if (local !== remote) {
  fail(`local main (${local.slice(0,7)}) is out of sync with origin/main (${remote.slice(0,7)}). Pull or push before deploying.`);
}

console.log('preflight: OK (main, clean, in sync with origin)');
