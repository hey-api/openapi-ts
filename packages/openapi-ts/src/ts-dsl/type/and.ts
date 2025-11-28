import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { isTsDsl, TypeTsDsl } from '../base';

type Type = Symbol | string | ts.TypeNode | TypeTsDsl;

const Mixed = TypeTsDsl<ts.IntersectionTypeNode>;

export class TypeAndTsDsl extends Mixed {
  protected _types: Array<Type> = [];

  constructor(...nodes: Array<Type>) {
    super();
    this.types(...nodes);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const t of this._types) {
      if (isSymbol(t)) {
        ctx.addDependency(t);
      } else if (isTsDsl(t)) {
        t.analyze(ctx);
      }
    }
  }

  types(...nodes: Array<Type>): this {
    this._types.push(...nodes);
    return this;
  }

  protected override _render() {
    const flat: Array<ts.TypeNode> = [];

    for (const n of this._types) {
      const t = this.$type(n);
      if (ts.isIntersectionTypeNode(t)) {
        flat.push(...t.types);
      } else {
        flat.push(t);
      }
    }

    return ts.factory.createIntersectionTypeNode(flat);
  }
}
