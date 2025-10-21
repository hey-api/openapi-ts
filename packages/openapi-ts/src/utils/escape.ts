import { EOL } from 'node:os';

import { validTypescriptIdentifierRegExp } from './regexp';

export const escapeName = (value: string): string => {
  if (value || value === '') {
    validTypescriptIdentifierRegExp.lastIndex = 0;
    const validName = validTypescriptIdentifierRegExp.test(value);
    if (!validName) {
      return `'${value}'`;
    }
  }
  return value;
};

export const unescapeName = (value: string): string => {
  if (value && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, value.length - 1);
  }
  return value;
};

export const escapeComment = (value: string) =>
  value
    .replace(/\*\//g, '*')
    .replace(/\/\*/g, '*')
    .replace(/\r?\n(.*)/g, (_l, w) => EOL + w.trim());
