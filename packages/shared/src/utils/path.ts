/**
 * After these structural segments, the next segment has a known role.
 * This is what makes a property literally named "properties" safe —
 * it occupies the name position, never the structural position.
 */
const STRUCTURAL_ROLE: Record<string, 'name' | 'index'> = {
  items: 'index',
  patternProperties: 'name',
  properties: 'name',
};

/**
 * These structural segments have no following name/index —
 * they are the terminal structural node. Append a suffix
 * to disambiguate from the parent.
 */
const STRUCTURAL_SUFFIX: Record<string, string> = {
  additionalProperties: 'Value',
};

type RootContextConfig = {
  /** How many consecutive semantic segments follow before structural walking begins */
  names: number;
  /** How many leading segments to skip (the root keyword + any category segment) */
  skip: number;
};

/**
 * Root context configuration.
 */
const ROOT_CONTEXT: Record<string | number, RootContextConfig> = {
  components: { names: 1, skip: 2 }, // components/schemas/{name}
  definitions: { names: 1, skip: 1 }, // definitions/{name}
  paths: { names: 2, skip: 1 }, // paths/{path}/{method}
  webhooks: { names: 2, skip: 1 }, // webhooks/{name}/{method}
};

/**
 * Sanitizes a path segment for use in a derived name.
 *
 * Handles API path segments like `/api/v1/users/{id}` → `ApiV1UsersId`.
 */
function sanitizeSegment(segment: string | number): string {
  const str = String(segment);
  if (str.startsWith('/')) {
    return str
      .split('/')
      .filter(Boolean)
      .map((part) => {
        const clean = part.replace(/[{}]/g, '');
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      })
      .join('');
  }
  return str;
}

export interface PathToNameOptions {
  /**
   * When provided, replaces the root semantic segments with this anchor.
   * Structural suffixes are still derived from path.
   */
  anchor?: string;
}

/**
 * Derives a composite name from a path.
 *
 * Examples:
 *   .../User                                    → 'User'
 *   .../User/properties/address                 → 'UserAddress'
 *   .../User/properties/properties              → 'UserProperties'
 *   .../User/properties/address/properties/city → 'UserAddressCity'
 *   .../Pet/additionalProperties                → 'PetValue'
 *   .../Order/properties/items/items/0          → 'OrderItems'
 *   paths//event/get/properties/query           → 'EventGetQuery'
 *
 * With anchor:
 *   paths//event/get/properties/query, { anchor: 'event.subscribe' }
 *                                               → 'event.subscribe-Query'
 */
export function pathToName(
  path: ReadonlyArray<string | number>,
  options?: PathToNameOptions,
): string {
  const names: Array<string> = [];
  let index = 0;

  const rootContext = ROOT_CONTEXT[path[0]!];
  if (rootContext) {
    index = rootContext.skip;

    if (options?.anchor) {
      // Use anchor as base name, skip past root semantic segments
      names.push(options.anchor);
      index += rootContext.names;
    } else {
      // Collect consecutive semantic name segments
      for (let n = 0; n < rootContext.names && index < path.length; n++) {
        names.push(sanitizeSegment(path[index]!));
        index++;
      }
    }
  } else {
    // Unknown root
    if (options?.anchor) {
      names.push(options.anchor);
      index++;
    } else if (index < path.length) {
      names.push(sanitizeSegment(path[index]!));
      index++;
    }
  }

  while (index < path.length) {
    const segment = String(path[index]);

    const role = STRUCTURAL_ROLE[segment];
    if (role === 'name') {
      // Next segment is a semantic name — collect it
      index++;
      if (index < path.length) {
        names.push(sanitizeSegment(path[index]!));
      }
    } else if (role === 'index') {
      // Next segment is a numeric index — skip it
      index++;
      if (index < path.length && typeof path[index] === 'number') {
        index++;
      }
      continue;
    } else if (STRUCTURAL_SUFFIX[segment]) {
      names.push(STRUCTURAL_SUFFIX[segment]);
    }

    index++;
  }

  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
  return decodeURI(names.join('-'));
}
