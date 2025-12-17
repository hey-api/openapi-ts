import type {
  AnalysisContext,
  AstContext,
  NodeScope,
} from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';
import { TypeExprMixin } from '../mixins/type-expr';
import { f } from '../utils/factories';

export type TypeQueryExpr = string | MaybeTsDsl<TypeTsDsl | ts.Expression>;
export type TypeQueryCtor = (expr: TypeQueryExpr) => TypeQueryTsDsl;

const Mixed = TypeExprMixin(TsDsl<ts.TypeQueryNode>);

export class TypeQueryTsDsl extends Mixed {
  readonly '~dsl' = 'TypeQueryTsDsl';
  override scope: NodeScope = 'type';

  protected _expr: TypeQueryExpr;

  constructor(expr: TypeQueryExpr) {
    super();
    this._expr = expr;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._expr);
  }

  override toAst(ctx: AstContext) {
    const expr = this.$node(ctx, this._expr);
    return ts.factory.createTypeQueryNode(expr as unknown as ts.EntityName);
  }
}

f.type.query.set((...args) => new TypeQueryTsDsl(...args));
