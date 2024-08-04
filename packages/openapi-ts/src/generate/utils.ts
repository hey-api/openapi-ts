import { existsSync, mkdirSync, type PathLike } from 'node:fs';

export const ensureDirSync = (path: PathLike) => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
};
