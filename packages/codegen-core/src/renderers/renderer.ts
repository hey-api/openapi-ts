/**
 * Wraps an ID in namespace to avoid collisions when replacing it.
 *
 * @param symbolId Stringified symbol ID to use.
 * @returns The wrapped placeholder ID.
 */
export const wrapId = (symbolId: string): string => `_heyapi_${symbolId}_`;

/**
 * Unwraps an ID from namespace.
 *
 * @param wrappedId The wrapped placeholder ID.
 * @returns Stringified ID to use.
 */
const unwrapId = (wrappedId: string): string =>
  wrappedId.slice('_heyapi_'.length, -1);

/**
 * Returns a RegExp instance to match ID placeholders.
 *
 * @returns RegExp instance to match ID placeholders.
 */
const createPlaceholderRegExp = (): RegExp => new RegExp(wrapId('\\d+'), 'g');

/**
 *
 * @param source The source string to replace.
 * @param replacerFn Accepts a symbol ID, returns resolved symbol name.
 * @returns The replaced source string.
 */
export const replaceWrappedIds = (
  source: string,
  replacerFn: (symbolId: number) => string | undefined,
): string =>
  source.replace(createPlaceholderRegExp(), (match) => {
    const symbolId = Number.parseInt(unwrapId(match), 10);
    return replacerFn(symbolId) || match;
  });
