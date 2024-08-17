import { EOL } from 'os';

/**
 * Javascript identifier regexp pattern retrieved from
 * {@link} https://developer.mozilla.org/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
 */
const validTypescriptIdentifierRegExp =
  /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u;

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
