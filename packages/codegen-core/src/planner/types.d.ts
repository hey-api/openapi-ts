import type { Ref } from '../refs/types';
import type { Symbol } from '../symbols/symbol';
import type { NameScopes, Scope } from './scope';

export type Input = Ref<object> | object | string | number | undefined;

export type NameConflictResolver = (args: {
  attempt: number;
  baseName: string;
}) => string | null;

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
