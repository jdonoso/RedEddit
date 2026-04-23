#!/usr/bin/env node
// Truncate .open-next/cloudflare/next-env.mjs to one canonical block.
//
// OpenNext on Windows appends to this file every build instead of replacing it,
// causing "Multiple exports with the same name" errors at deploy time.
// This script rebuilds the file from .env.production so the URL is never stale.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const envPath = resolve(repoRoot, '.env.production');
const targetPath = resolve(repoRoot, '.open-next/cloudflare/next-env.mjs');

if (!existsSync(targetPath)) {
  console.error(`fix-next-env: ${targetPath} does not exist (skipping — was opennextjs-cloudflare build run?)`);
  process.exit(0);
}

const envText = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';
const publicVars = {};
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  if (key.startsWith('NEXT_PUBLIC_')) publicVars[key] = value;
}

const out =
  `export const production = ${JSON.stringify(publicVars)};\n` +
  `export const development = {};\n` +
  `export const test = {};\n`;

writeFileSync(targetPath, out, 'utf-8');
console.log(`fix-next-env: wrote canonical ${targetPath} (${Object.keys(publicVars).length} public var(s))`);
