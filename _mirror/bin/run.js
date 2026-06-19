#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, '..', 'dist', 'run.mjs');

if (!fs.existsSync(target)) {
  console.error('openapi-ts not built (expect dist/run.mjs)');
  process.exit(1);
}

const res = spawnSync(process.execPath, [target, ...process.argv.slice(2)], {
  stdio: 'inherit',
});
process.exit(res.status ?? 0);
