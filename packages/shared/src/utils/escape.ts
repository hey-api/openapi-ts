import { EOL } from 'node:os';

export function escapeComment(value: string) {
  return value
    .replace(/\*\//g, '*')
    .replace(/\/\*/g, '*')
    .replace(/\r?\n(.*)/g, (_l, w) => EOL + w.trim());
}
