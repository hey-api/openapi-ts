export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Accepts `accessScopes` from two schemas and returns a merged and
 * deduplicated value.
 */
export const mergeSchemaAccessScopes = (
  a: ReadonlyArray<'both' | 'read' | 'write'> | undefined,
  b: ReadonlyArray<'both' | 'read' | 'write'> | undefined,
): ReadonlyArray<'both' | 'read' | 'write'> | undefined => {
  if (!a?.length) {
    return b?.length ? b : undefined;
  }

  if (!b?.length) {
    return a;
  }

  const mergedScopes = new Set(a);

  for (const scope of b) {
    mergedScopes.add(scope);
  }

  return mergedScopes.size > a.length ? Array.from(mergedScopes) : a;
};
