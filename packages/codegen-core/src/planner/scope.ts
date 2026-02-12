import type { Ref } from '../refs/types';
import type { Symbol } from '../symbols/symbol';
import type { SymbolKind } from '../symbols/types';

export type NameScopes = Map<string, Set<SymbolKind>>;

export type Scope = {
  /** Child scopes. */
  children: Array<Scope>;
  /** Resolved names in this scope. */
  localNames: NameScopes;
  /** Parent scope, if any. */
  parent?: Scope;
  /** Symbols registered in this scope. */
  symbols: Array<Ref<Symbol>>;
};

export type AssignOptions = {
  /** The primary scope in which to assign a symbol's final name. */
  scope: Scope;
  /** Additional scopes to update as side effects when assigning a symbol's final name. */
  scopesToUpdate: ReadonlyArray<Scope>;
};

export const createScope = (
  args: {
    localNames?: NameScopes;
    parent?: Scope;
  } = {},
): Scope => ({
  children: [],
  localNames: args.localNames || new Map(),
  parent: args.parent,
  symbols: [],
});
