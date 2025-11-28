import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import { isTsDsl, TypeTsDsl } from '../base';

const Mixed = TypeTsDsl<ts.TupleTypeNode>;

export class TypeTupleTsDsl extends Mixed {
  protected _elements: Array<string | ts.TypeNode | TypeTsDsl> = [];

  constructor(...nodes: Array<string | ts.TypeNode | TypeTsDsl>) {
    super();
    this.elements(...nodes);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const t of this._elements) {
      if (isTsDsl(t)) t.analyze(ctx);
    }
  }

  elements(...types: Array<string | ts.TypeNode | TypeTsDsl>): this {
    this._elements.push(...types);
    return this;
  }

  protected override _render() {
    return ts.factory.createTupleTypeNode(
      this._elements.map((t) => this.$type(t)),
    );
  }
}
