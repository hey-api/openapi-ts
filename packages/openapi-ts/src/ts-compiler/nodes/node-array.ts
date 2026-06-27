import type { TsNode } from './base';

export function createNodeArray<T extends TsNode>(
  elements?: ReadonlyArray<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasTrailingComma?: boolean,
): ReadonlyArray<T> {
  return elements ?? [];
}
