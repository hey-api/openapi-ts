/**
 * Matches characters from the start as long as they're not allowed.
 */
const illegalStartCharactersRegExp = /^[^$_\p{ID_Start}]+/u;

/**
 * Matches string if it contains only digits and optionally decimal point or
 * leading minus sign.
 */
const numberRegExp = /^-?\d+(\.\d+)?$/;

/**
 * Javascript identifier regexp pattern retrieved from
 * {@link} https://developer.mozilla.org/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
 */
const validTypescriptIdentifierRegExp =
  /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u;

export const regexp = {
  /**
   * Matches characters from the start as long as they're not allowed.
   */
  illegalStartCharacters: illegalStartCharactersRegExp,
  /**
   * Matches string if it contains only digits and optionally decimal point or
   * leading minus sign.
   */
  number: numberRegExp,
  /**
   * Javascript identifier regexp pattern retrieved from
   * {@link} https://developer.mozilla.org/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
   */
  typeScriptIdentifier: validTypescriptIdentifierRegExp,
};
