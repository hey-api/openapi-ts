import type { StringCase } from '~/types/case';

import { toCase } from './to-case';

/**
 * Utilities shared across the package.
 */
export const utils = {
  /**
   * @deprecated use `toCase` instead
   */
  stringCase({
    case: casing,
    stripLeadingSeparators,
    value,
  }: {
    readonly case: StringCase | undefined;
    /**
     * If leading separators have a semantic meaning, we might not want to
     * remove them.
     */
    stripLeadingSeparators?: boolean;
    value: string;
  }) {
    return toCase(value, casing, { stripLeadingSeparators });
  },
  /**
   * Converts the given string to the specified casing.
   */
  toCase,
};
