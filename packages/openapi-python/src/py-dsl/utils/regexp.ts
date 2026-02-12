/**
 * Matches characters from the start that are not valid Python identifier starts.
 * Python identifiers: starts with letter/underscore, followed by letters/digits/underscores.
 */
const illegalStartCharactersRegExp = /^[^a-zA-Z_]+/;

/**
 * Matches if string contains only digits and optionally decimal point or leading minus.
 */
const numberRegExp = /^-?\d+(\.\d+)?$/;

/**
 * Python identifier pattern: starts with letter or underscore,
 * followed by letters, digits, or underscores.
 * Uses Unicode categories for full Python 3 compliance.
 */
const validPythonIdentifierRegExp = /^[a-zA-Z_][a-zA-Z0-9_]*$/u;

/**
 * Matches if a string looks like a valid Python identifier.
 */
const looksLikeIdentifierRegExp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const regexp = {
  /**
   * Matches characters from the start that are not valid Python identifier starts.
   */
  illegalStartCharacters: illegalStartCharactersRegExp,
  /**
   * Simpler pattern for quick identifier checks.
   */
  looksLikeIdentifier: looksLikeIdentifierRegExp,
  /**
   * Matches if string contains only digits and optionally decimal point or leading minus.
   */
  number: numberRegExp,
  /**
   * Python identifier pattern for validation.
   */
  pythonIdentifier: validPythonIdentifierRegExp,
};
