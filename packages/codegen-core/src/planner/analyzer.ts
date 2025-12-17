import { isNodeRef, isSymbolRef } from '../guards';
import type { INode, StructuralRelationship } from '../nodes/node';
import { fromRef, isRef, ref } from '../refs/refs';
import type { Ref } from '../refs/types';
import type { Symbol } from '../symbols/symbol';
import type { NameScopes, Scope } from './scope';
import { createScope } from './scope';
import type { IAnalysisContext, Input } from './types';

export class AnalysisContext implements IAnalysisContext {
  /**
   * Stack of parent nodes during analysis.
   *
   * The top of the stack is the current semantic container.
   */
  private _parentStack: Array<INode> = [];

  scope: Scope;
  scopes: Scope = createScope();
  symbol?: Symbol;

  constructor(node: INode) {
    this._parentStack.push(node);
    this.scope = this.scopes;
    this.symbol = node.symbol;
  }

  /**
   * Get the current semantic parent (top of stack).
   */
  get currentParent(): INode | undefined {
    return this._parentStack[this._parentStack.length - 1];
  }

  /**
   * Register a child node under the current parent.
   */
  addChild(
    child: INode,
    relationship: StructuralRelationship = 'container',
  ): void {
    const parent = this.currentParent;
    if (!parent) return;

    if (!parent.structuralChildren) {
      parent.structuralChildren = new Map();
    }
    parent.structuralChildren.set(child, relationship);

    if (!child.structuralParents) {
      child.structuralParents = new Map();
    }
    child.structuralParents.set(parent, relationship);
  }

  addDependency(symbol: Ref<Symbol>): void {
    if (this.symbol !== fromRef(symbol)) {
      this.scope.symbols.push(symbol);
    }
  }

  analyze(input: Input): void {
    const value = isRef(input) ? input : ref(input);
    if (isSymbolRef(value)) {
      const symbol = fromRef(value);
      // avoid adding self as child
      if (symbol.node && this.currentParent !== symbol.node) {
        this.addChild(symbol.node, 'reference');
      }
      this.addDependency(value);
    } else if (isNodeRef(value)) {
      const node = fromRef(value);
      this.addChild(node, 'container');
      this.pushParent(node);
      node.analyze(this);
      this.popParent();
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

  /**
   * Pop the current semantic parent.
   * Call this when exiting a container node.
   */
  popParent(): void {
    this._parentStack.pop();
  }

  popScope(): void {
    this.scope = this.scope.parent ?? this.scope;
  }

  /**
   * Push a node as the current semantic parent.
   */
  pushParent(node: INode): void {
    this._parentStack.push(node);
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

    node.root = true;
    const ctx = new AnalysisContext(node);
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
