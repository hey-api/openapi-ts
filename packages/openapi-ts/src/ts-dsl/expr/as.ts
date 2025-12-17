import type {
  AnalysisContext,
  AstContext,
  NodeName,
  Ref,
} from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';
import { f } from '../utils/factories';

export type AsExpr = NodeName | MaybeTsDsl<ts.Expression>;
export type AsType = NodeName | TypeTsDsl;
export type AsCtor = (expr: AsExpr, type: AsType) => AsTsDsl;

const Mixed = AsMixin(ExprMixin(TsDsl<ts.AsExpression>));

export class AsTsDsl extends Mixed {
  readonly '~dsl' = 'AsTsDsl';

  protected expr: Ref<AsExpr>;
  protected type: Ref<AsType>;

  constructor(expr: AsExpr, type: AsType) {
    super();
    this.expr = ref(expr);
    this.type = ref(type);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.expr);
    ctx.analyze(this.type);
  }

  override toAst(ctx: AstContext) {
    return ts.factory.createAsExpression(
      this.$node(ctx, this.expr),
      this.$type(ctx, this.type),
    );
  }
}

f.as.set((...args) => new AsTsDsl(...args));
