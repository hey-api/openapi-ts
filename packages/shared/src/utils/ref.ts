const jsonPointerSlash = /~1/g;
const jsonPointerTilde = /~0/g;

/**
 * Returns the reusable component name from `$ref`.
 */
export function refToName($ref: string): string {
  const path = jsonPointerToPath($ref);
  const name = path[path.length - 1]!;
  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
  return decodeURI(name);
}

/**
 * Encodes a path segment for use in a JSON Pointer (RFC 6901).
 *
 * - Replaces all '~' with '~0'.
 * - Replaces all '/' with '~1'.
 *
 * This ensures that path segments containing these characters are safely
 * represented in JSON Pointer strings.
 *
 * @param segment - The path segment (string or number) to encode.
 * @returns The encoded segment as a string.
 */
export function encodeJsonPointerSegment(segment: string | number): string {
  return String(segment).replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Converts a JSON Pointer string (RFC 6901) to an array of path segments.
 *
 * - Removes the leading '#' if present.
 * - Splits the pointer on '/'.
 * - Decodes '~1' to '/' and '~0' to '~' in each segment.
 * - Returns an empty array for the root pointer ('#' or '').
 *
 * @param pointer - The JSON Pointer string to convert (e.g., '#/components/schemas/Foo').
 * @returns An array of decoded path segments.
 */
export function jsonPointerToPath(pointer: string): ReadonlyArray<string> {
  let clean = pointer.trim();
  if (clean.startsWith('#')) {
    clean = clean.slice(1);
  }
  if (clean.startsWith('/')) {
    clean = clean.slice(1);
  }
  if (!clean) {
    return [];
  }
  return clean
    .split('/')
    .map((part) =>
      part.replace(jsonPointerSlash, '/').replace(jsonPointerTilde, '~'),
    );
}

/**
 * Normalizes a JSON Pointer string to a canonical form.
 *
 * - Ensures the pointer starts with '#'.
 * - Removes trailing slashes (except for root).
 * - Collapses multiple consecutive slashes into one.
 * - Trims whitespace from the input.
 *
 * @param pointer - The JSON Pointer string to normalize.
 * @returns The normalized JSON Pointer string.
 */
export function normalizeJsonPointer(pointer: string): string {
  let normalized = pointer.trim();
  if (!normalized.startsWith('#')) {
    normalized = `#${normalized}`;
  }
  // Remove trailing slashes (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  // Collapse multiple slashes
  normalized = normalized.replace(/\/+/g, '/');
  return normalized;
}

/**
 * Encode path as JSON Pointer (RFC 6901).
 *
 * @param path
 * @returns
 */
export function pathToJsonPointer(
  path: ReadonlyArray<string | number>,
): string {
  const segments = path.map(encodeJsonPointerSegment).join('/');
  return '#' + (segments ? `/${segments}` : '');
}

/**
 * Checks if a $ref points to a top-level component (not a deep path reference).
 *
 * Top-level component references:
 * - OpenAPI 3.x: #/components/{type}/{name} (3 segments)
 * - OpenAPI 2.0: #/definitions/{name} (2 segments)
 *
 * Deep path references (4+ segments for 3.x, 3+ for 2.0) should be inlined
 * because they don't have corresponding registered symbols.
 *
 * @param $ref - The $ref string to check
 * @returns true if the ref points to a top-level component, false otherwise
 */
export function isTopLevelComponentRef($ref: string): boolean {
  const path = jsonPointerToPath($ref);

  // OpenAPI 3.x: #/components/{type}/{name} = 3 segments
  if (path[0] === 'components') {
    return path.length === 3;
  }

  // OpenAPI 2.0: #/definitions/{name} = 2 segments
  if (path[0] === 'definitions') {
    return path.length === 2;
  }

  return false;
}

export function resolveRef<T>({
  $ref,
  spec,
}: {
  $ref: string;
  spec: Record<string, any>;
}): T {
  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
  const path = jsonPointerToPath(decodeURI($ref));

  let current = spec;

  for (const part of path) {
    const segment = part as keyof typeof current;
    if (current[segment] === undefined) {
      throw new Error(`Reference not found: ${$ref}`);
    }
    current = current[segment];
  }

  return current as T;
}
