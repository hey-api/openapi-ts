import type { AnalysisContext, AstContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';

const Mixed = TypeTsDsl<ts.TupleTypeNode>;

export class TypeTupleTsDsl extends Mixed {
  readonly '~dsl' = 'TypeTupleTsDsl';

  protected _elements: Array<string | ts.TypeNode | TypeTsDsl> = [];

  constructor(...nodes: Array<string | ts.TypeNode | TypeTsDsl>) {
    super();
    this.elements(...nodes);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const type of this._elements) {
      ctx.analyze(type);
    }
  }

  elements(...types: Array<string | ts.TypeNode | TypeTsDsl>): this {
    this._elements.push(...types);
    return this;
  }

  override toAst(ctx: AstContext) {
    return ts.factory.createTupleTypeNode(
      this._elements.map((t) => this.$type(ctx, t)),
    );
  }
}
