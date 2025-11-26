import { debug } from '../debug';
import type { INode } from '../nodes/node';
import type { Symbol } from './symbol';

export interface IAnalysisContext {
  /** Register a dependency on another symbol. */
  addDependency(symbol: Symbol): void;
  /** Local names declared by nodes within the analyzed symbol. */
  localNames: Set<string>;
  /** Root symbol for the current top‑level analysis pass. */
  root: Symbol;
  /** Collected symbol references discovered during analysis. */
  symbols: Set<Symbol>;
}

export class AnalysisContext implements IAnalysisContext {
  localNames: Set<string> = new Set();
  root: Symbol;
  symbols: Set<Symbol> = new Set();

  constructor(symbol: Symbol) {
    this.root = symbol;
  }

  addDependency(symbol: Symbol): void {
    if (this.root !== symbol) {
      this.symbols.add(symbol);
    }
  }
}

export class Analyzer {
  private nodeCache = new WeakMap<INode, AnalysisContext>();

  analyzeNode(node: INode): AnalysisContext {
    const cached = this.nodeCache.get(node);
    if (cached) return cached;

    if (!node.symbol) {
      const message = `Analyzer: cannot analyze node "${node}" without a defining symbol.`;
      debug(message, 'analyzer');
      throw new Error(message);
    }

    const ctx = new AnalysisContext(node.symbol);
    node.analyze(ctx);

    this.nodeCache.set(node, ctx);
    return ctx;
  }

  analyze(
    nodes: ReadonlyArray<INode>,
    callback?: (ctx: AnalysisContext) => void,
  ): void {
    for (const node of nodes) {
      const ctx = this.analyzeNode(node);
      callback?.(ctx);
    }
  }
}
