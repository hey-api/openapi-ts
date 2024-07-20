import { existsSync, mkdirSync } from 'node:fs';

export const ensureDirSync = (path: string) => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
};
