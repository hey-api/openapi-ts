import type { Graph, NodeInfo } from './graph';

export type WalkCallbackFn = (pointer: string, nodeInfo: NodeInfo) => void;

export type GetPointerPriorityFn = (pointer: string) => number;

export type PointerGroupMatch<T extends string = string> =
  | { kind: T; matched: true }
  | { kind?: undefined; matched: false };

export type WalkOptions<T extends string = string> = {
  /**
   * Optional priority function used to compute a numeric priority for each
   * pointer. Lower values are emitted earlier. Useful to customize ordering
   * beyond the built-in group preferences.
   */
  getPointerPriority?: GetPointerPriorityFn;
  /**
   * Optional function to match a pointer to a group name.
   *
   * @param pointer The pointer string
   * @returns The group name, or undefined if no match
   */
  matchPointerToGroup?: (pointer: string) => PointerGroupMatch<T>;
  /**
   * Order of walking schemas.
   *
   * The "declarations" option ensures that schemas are walked in the order
   * they are declared in the input document. This is useful for scenarios where
   * the order of declaration matters, such as when generating code that relies
   * on the sequence of schema definitions.
   *
   * The "topological" option ensures that schemas are walked in an order
   * where dependencies are visited before the schemas that depend on them.
   * This is useful for scenarios where you need to process or generate
   * schemas in a way that respects their interdependencies.
   *
   * @default 'topological'
   */
  order?: 'declarations' | 'topological';
  /**
   * Optional grouping preference for walking. When provided, walk function
   * will prefer emitting kinds listed earlier in this array when it is safe
   * to do so (it will only apply the preference when doing so does not
   * violate dependency ordering).
   */
  preferGroups?: ReadonlyArray<T>;
};

export type WalkFn = (
  graph: Graph,
  callback: WalkCallbackFn,
  options?: WalkOptions,
) => void;
