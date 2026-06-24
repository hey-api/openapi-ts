import path from 'node:path';

export const getSpecsPath = (): string =>
  path.join(import.meta.dirname, '..', '..', '..', '..', 'specs');
