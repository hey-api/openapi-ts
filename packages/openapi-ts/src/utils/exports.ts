import type { Casing } from './naming';
import { toCase } from './naming';

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
    readonly case: Casing | undefined;
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
