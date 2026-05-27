import type { Ref } from '../refs/types';
import type { Symbol } from '../symbols/symbol';
import type { SymbolKind } from '../symbols/types';

export type NameScopes = Map<string, Set<SymbolKind>>;

export type Scope = {
  /** Soft conflicts, inherited names from children symbols. */
  childNames: NameScopes;
  /** Child scopes. */
  children: Array<Scope>;
  /** Hard conflicts, declared names in this scope. */
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

export function createScope(
  args: Pick<Partial<Scope>, 'childNames' | 'localNames' | 'parent'> = {},
): Scope {
  return {
    childNames: args.childNames || new Map(),
    children: [],
    localNames: args.localNames || new Map(),
    parent: args.parent,
    symbols: [],
  };
}

export function registerName(scope: Scope, name: string, kind: SymbolKind): void {
  const kinds = scope.localNames.get(name) ?? new Set();
  kinds.add(kind);
  scope.localNames.set(name, kinds);
}

export function registerChildName(scope: Scope, name: string, kind: SymbolKind): void {
  const kinds = scope.childNames.get(name) ?? new Set();
  kinds.add(kind);
  scope.childNames.set(name, kinds);
}
