import type { PathLike } from 'node:fs';
import fs from 'node:fs';

export const ensureDirSync = (path: PathLike) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};
