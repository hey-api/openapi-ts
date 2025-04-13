type Filter = RegExp | ReadonlyArray<string>;
type Filters = ReadonlyArray<Filter> | undefined;

const isFiltersMatch = ({
  $ref,
  filters,
  schema,
}: {
  $ref: string;
  filters: NonNullable<Filters>;
  schema: Record<string, unknown>;
}): boolean => {
  for (const filter of filters) {
    if (filter instanceof RegExp) {
      filter.lastIndex = 0;
      if (filter.test($ref)) {
        return true;
      }
    } else {
      const field = filter[0] || '';
      const value = filter[1];
      if (value === undefined) {
        if (schema[field]) {
          return true;
        }
      } else if (schema[field] === value) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Exclude takes precedence over include.
 */
export const canProcessRef = ({
  excludeFilters,
  includeFilters,
  ...state
}: {
  $ref: string;
  excludeFilters: Filters;
  includeFilters: Filters;
  schema: Record<string, unknown>;
}): boolean => {
  if (!excludeFilters && !includeFilters) {
    return true;
  }

  if (excludeFilters) {
    if (isFiltersMatch({ ...state, filters: excludeFilters })) {
      return false;
    }
  }

  if (includeFilters) {
    return isFiltersMatch({ ...state, filters: includeFilters });
  }

  return true;
};

const createFilter = (matcher: string): Filter => {
  if (matcher.startsWith('@')) {
    return matcher.slice(1).split(':');
  }

  return new RegExp(matcher);
};

export const createFilters = (
  matchers: ReadonlyArray<string> | string | undefined,
): Filters => {
  if (!matchers) {
    return;
  }

  if (typeof matchers === 'string') {
    return [createFilter(matchers)];
  }

  return matchers.map((matcher) => createFilter(matcher));
};
