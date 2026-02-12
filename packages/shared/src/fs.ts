import type { PathLike } from 'node:fs';
import fs from 'node:fs';

export function ensureDirSync(path: PathLike): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}
