import { EOL } from 'node:os';

export const escapeComment = (value: string) =>
  value
    .replace(/\*\//g, '*')
    .replace(/\/\*/g, '*')
    .replace(/\r?\n(.*)/g, (_l, w) => EOL + w.trim());
