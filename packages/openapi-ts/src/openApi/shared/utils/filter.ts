/**
 * Exclude takes precedence over include.
 */
export const canProcessRef = ({
  $ref,
  excludeRegExp,
  includeRegExp,
}: {
  $ref: string;
  excludeRegExp?: RegExp;
  includeRegExp?: RegExp;
}): boolean => {
  if (!excludeRegExp && !includeRegExp) {
    return true;
  }

  if (excludeRegExp) {
    excludeRegExp.lastIndex = 0;
    if (excludeRegExp.test($ref)) {
      return false;
    }
  }

  if (includeRegExp) {
    includeRegExp.lastIndex = 0;
    return includeRegExp.test($ref);
  }

  return true;
};
