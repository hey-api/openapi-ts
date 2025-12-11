import type { Ref } from '../refs/types';
import type { Symbol } from '../symbols/symbol';
import type { SymbolKind } from '../symbols/types';

export type AssignOptions = {
  /** The primary scope in which to assign a symbol's final name. */
  scope: NameScopes;
  /** Additional scopes to update as side effects when assigning a symbol's final name. */
  scopesToUpdate: ReadonlyArray<NameScopes>;
};

export type Input = Ref<object> | object | string | number | undefined;

export type NameScopes = Map<string, Set<SymbolKind>>;

export type NameConflictResolver = (args: {
  attempt: number;
  baseName: string;
}) => string | null;

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

export interface IAnalysisContext {
  /** Register a dependency on another symbol. */
  addDependency(symbol: Ref<Symbol>): void;
  /** Register a dependency on another symbol or analyze further. */
  analyze(input: Input): void;
  /** Get local names in the current scope. */
  localNames(scope: Scope): NameScopes;
  /** Pop the current local scope. */
  popScope(): void;
  /** Push a new local scope. */
  pushScope(): void;
  /** Current local scope. */
  scope: Scope;
  /** Stack of local name scopes. */
  scopes: Scope;
  /** Top-level symbol for the current analysis pass. */
  symbol?: Symbol;
  /** Walks all symbols in the scope tree in depth-first order. */
  walkScopes(
    callback: (symbol: Ref<Symbol>, scope: Scope) => void,
    scope?: Scope,
  ): void;
}
