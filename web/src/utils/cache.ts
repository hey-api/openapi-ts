import fs from 'node:fs';
import path from 'node:path';

const TTL = 5 * 60 * 1000;
const FS_TTL = 60 * 60 * 1000;
const FS_CACHE_DIR = '.cache/heyapi';
const USE_FS_CACHE = import.meta.env.DEV;

const memory = new Map<string, { ts: number; value: unknown }>();

function fsPath(key: string): string {
  return path.join(FS_CACHE_DIR, `${key.replaceAll(':', '__')}.json`);
}

function readFs<T>(key: string): T | undefined {
  if (!USE_FS_CACHE) return;
  try {
    const raw = fs.readFileSync(fsPath(key), 'utf-8');
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < FS_TTL) return data as T;
  } catch {
    // miss or malformed
  }
}

function writeFs<T>(key: string, value: T): void {
  if (!USE_FS_CACHE) return;
  try {
    fs.mkdirSync(FS_CACHE_DIR, { recursive: true });
    fs.writeFileSync(fsPath(key), JSON.stringify({ data: value, ts: Date.now() }), 'utf-8');
  } catch {
    // noop
  }
}

export function getCached<T>(key: string): T | null | undefined {
  const entry = memory.get(key);
  if (entry && Date.now() - entry.ts <= TTL) return entry.value as T | null;

  const fs = readFs<T | null>(key);
  if (fs !== undefined) {
    memory.set(key, { ts: Date.now(), value: fs });
    return fs;
  }
}

export function setCached<T>(key: string, value: T | null): void {
  memory.set(key, { ts: Date.now(), value });
  writeFs(key, value);
}
