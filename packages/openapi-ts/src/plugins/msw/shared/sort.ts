export interface HandlerInfo {
  name: string;
  path: string;
}

/**
 * Returns 1 for a static segment, 0 for a parameterized segment.
 *
 * Works only with OpenAPI `{param}` format.
 */
function segmentScore(segment: string): number {
  return /\{[^}]+\}/.test(segment) ? 0 : 1;
}

/**
 * Sorts handlers by route specificity.
 *
 * Without this, routes like `/foo/:bar` could appear before `/foo/baz`.
 *
 * Inspired by:
 * @see https://reactrouter.com/6.28.0/start/concepts#ranking-routes
 * @see https://github.com/lukeed/route-sort
 */
export function sortHandlers(handlers: ReadonlyArray<HandlerInfo>): ReadonlyArray<HandlerInfo> {
  return handlers
    .map((info, index) => ({ index, info }))
    .sort((a, b) => {
      const segmentsA = a.info.path.split('/').filter(Boolean);
      const segmentsB = b.info.path.split('/').filter(Boolean);

      // deeper routes are more specific
      if (segmentsA.length !== segmentsB.length) {
        return segmentsB.length - segmentsA.length;
      }

      // static segments beat dynamic ones
      for (let i = 0; i < segmentsA.length; i++) {
        const scoreA = segmentScore(segmentsA[i]!);
        const scoreB = segmentScore(segmentsB[i]!);
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
      }

      // preserve declaration order
      return a.index - b.index;
    })
    .map((entry) => entry.info);
}
