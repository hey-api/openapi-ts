/**
 * Accepts `accessScopes` from two schemas and returns a merged and
 * deduplicated value.
 */
export const mergeSchemaAccessScopes = (
  a: ReadonlyArray<'read' | 'write'> | undefined,
  b: ReadonlyArray<'read' | 'write'> | undefined,
): ReadonlyArray<'read' | 'write'> | undefined => {
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
