interface HandlerMeta {
  name: string;
  path: string;
}

/**
 * Returns 1 for a static segment, 0 for a parameterized segment.
 * Works with OpenAPI `{param}` format.
 */
const segmentScore = (segment: string): number => (/\{[^}]+\}/.test(segment) ? 0 : 1);

/**
 * Sorts handler metadata by route specificity so that more specific routes
 * appear before less specific ones in the generated `getAllMocks` handler array.
 *
 * MSW matches handlers top-to-bottom, so without sorting a dynamic route like
 * `/api/permissions/:userId` would shadow `/api/permissions/all`.
 *
 * Algorithm inspired by React Router v6 and route-sort:
 * @see https://reactrouter.com/explanation/route-matching
 * @see https://github.com/lukeed/route-sort
 *
 * Rules, applied in priority order:
 * 1. More path segments (deeper routes) come first.
 * 2. At equal depth, static segments beat dynamic ones (left-to-right).
 * 3. At equal specificity, preserve original declaration order (stable sort).
 */
export const sortHandlersBySpecificity = <T extends HandlerMeta>(
  handlers: ReadonlyArray<T>,
): Array<T> => {
  const indexed = handlers.map((handler, index) => ({ handler, index }));

  indexed.sort((a, b) => {
    const segmentsA = a.handler.path.split('/').filter(Boolean);
    const segmentsB = b.handler.path.split('/').filter(Boolean);

    // Rule 1: deeper routes are more specific
    if (segmentsA.length !== segmentsB.length) {
      return segmentsB.length - segmentsA.length;
    }

    // Rule 2: at equal depth, static segments beat dynamic ones (left-to-right)
    for (let i = 0; i < segmentsA.length; i++) {
      const scoreA = segmentScore(segmentsA[i]!);
      const scoreB = segmentScore(segmentsB[i]!);
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
    }

    // Rule 3: preserve declaration order
    return a.index - b.index;
  });

  return indexed.map((entry) => entry.handler);
};
