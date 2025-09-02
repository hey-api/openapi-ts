/**
 * Wraps an ID in namespace to avoid collisions when replacing it.
 *
 * @param id Stringified ID to use.
 * @returns The wrapped placeholder ID.
 */
const wrapId = (id: string): string => `_heyapi_${id}_`;

/**
 * Returns a RegExp instance to match ID placeholders.
 *
 * @returns RegExp instance to match ID placeholders.
 */
export const createPlaceholderRegExp = (): RegExp =>
  new RegExp(wrapId('\\d+'), 'g');

/**
 * Generates a placeholder ID.
 *
 * @param id the numeric ID to use.
 * @returns The wrapped placeholder ID.
 */
export const idToPlaceholder = (id: number): string => wrapId(String(id));

/**
 * @returns The replaced source string.
 */
export const replacePlaceholders = ({
  source,
  substitutions,
}: {
  source: string;
  /**
   * Map of IDs and their final names.
   */
  substitutions: Record<string, string>;
}): string =>
  source.replace(
    createPlaceholderRegExp(),
    (match) => substitutions[match] || match,
  );
