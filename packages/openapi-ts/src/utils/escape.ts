import { EOL } from 'os';

/**
 * Javascript identifier regexp pattern retrieved from
 * {@link} https://developer.mozilla.org/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
 */
const validTypescriptIdentifierRegex =
  /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u;

export const escapeName = (value: string): string => {
  if (value || value === '') {
    const validName = validTypescriptIdentifierRegex.test(value);
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

export const escapeComment = (value: string, insertAsterisk = true) =>
  value
    .replace(/\*\//g, '*')
    .replace(/\/\*/g, '*')
    .replace(/\r?\n(.*)/g, (_, w) => {
      if (insertAsterisk) {
        return `${EOL} * ${w.trim()}`;
      }
      return EOL + w.trim();
    });

export const escapeDescription = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
