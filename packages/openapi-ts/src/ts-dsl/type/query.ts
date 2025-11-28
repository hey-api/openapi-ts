import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TypeTsDsl } from '../base';
import {
  registerLazyAccessTypeQueryFactory,
  TypeExprMixin,
} from '../mixins/type-expr';

const Mixed = TypeExprMixin(TypeTsDsl<ts.TypeQueryNode>);

export class TypeQueryTsDsl extends Mixed {
  protected _expr: string | MaybeTsDsl<TypeTsDsl | ts.Expression>;

  constructor(expr: string | MaybeTsDsl<TypeTsDsl | ts.Expression>) {
    super();
    this._expr = expr;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isTsDsl(this._expr)) this._expr.analyze(ctx);
  }

  protected override _render() {
    const expr = this.$node(this._expr);
    return ts.factory.createTypeQueryNode(expr as unknown as ts.EntityName);
  }
}

registerLazyAccessTypeQueryFactory((...args) => new TypeQueryTsDsl(...args));
