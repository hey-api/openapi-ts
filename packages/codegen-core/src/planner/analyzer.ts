import { isNodeRef, isSymbolRef } from '../guards';
import type { INode } from '../nodes/node';
import { fromRef, isRef, ref } from '../refs/refs';
import type { Ref } from '../refs/types';
import type { Symbol } from '../symbols/symbol';
import type { NameScopes, Scope } from './scope';
import { createScope } from './scope';
import type { IAnalysisContext, Input } from './types';

export class AnalysisContext implements IAnalysisContext {
  scope: Scope;
  scopes: Scope = createScope();
  symbol?: Symbol;

  constructor(symbol?: Symbol) {
    this.scope = this.scopes;
    this.symbol = symbol;
  }

  addDependency(symbol: Ref<Symbol>): void {
    if (this.symbol !== fromRef(symbol)) {
      this.scope.symbols.push(symbol);
    }
  }

  analyze(input: Input): void {
    const v = isRef(input) ? input : ref(input);
    if (isSymbolRef(v)) {
      this.addDependency(v);
    } else if (isNodeRef(v)) {
      fromRef(v).analyze(this);
    }
  }

  localNames(scope: Scope): NameScopes {
    const names: NameScopes = new Map();
    for (const [name, kinds] of scope.localNames) {
      names.set(name, new Set(kinds));
    }
    if (scope.parent) {
      const parentNames = this.localNames(scope.parent);
      for (const [name, kinds] of parentNames) {
        if (!names.has(name)) {
          names.set(name, kinds);
        } else {
          const existingKinds = names.get(name)!;
          for (const kind of kinds) {
            existingKinds.add(kind);
          }
        }
      }
    }
    return names;
  }

  popScope(): void {
    this.scope = this.scope.parent ?? this.scope;
  }

  pushScope(): void {
    const scope = createScope({ parent: this.scope });
    this.scope.children.push(scope);
    this.scope = scope;
  }

  walkScopes(
    callback: (symbol: Ref<Symbol>, scope: Scope) => void,
    scope: Scope = this.scopes,
  ): void {
    this.scope = scope;
    for (const symbol of scope.symbols) {
      callback(symbol, scope);
    }
    for (const child of scope.children) {
      scope = child;
      this.walkScopes(callback, scope);
    }
    this.scope = this.scopes;
  }
}

export class Analyzer {
  private nodeCache = new WeakMap<INode, AnalysisContext>();

  analyzeNode(node: INode): AnalysisContext {
    const cached = this.nodeCache.get(node);
    if (cached) return cached;

    const ctx = new AnalysisContext(node.symbol);
    node.analyze(ctx);

    this.nodeCache.set(node, ctx);
    return ctx;
  }

  analyze(
    nodes: Iterable<INode>,
    callback?: (ctx: AnalysisContext, node: INode) => void,
  ): void {
    for (const node of nodes) {
      const ctx = this.analyzeNode(node);
      callback?.(ctx, node);
    }
  }
}
