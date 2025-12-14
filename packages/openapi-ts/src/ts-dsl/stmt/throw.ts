import type { AnalysisContext, AstContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { LiteralTsDsl } from '../expr/literal';

const Mixed = TsDsl<ts.ThrowStatement>;

export class ThrowTsDsl extends Mixed {
  readonly '~dsl' = 'ThrowTsDsl';

  protected error: string | MaybeTsDsl<ts.Expression>;
  protected msg?: string | MaybeTsDsl<ts.Expression>;
  protected useNew: boolean;

  constructor(error: string | MaybeTsDsl<ts.Expression>, useNew = true) {
    super();
    this.error = error;
    this.useNew = useNew;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.error);
    ctx.analyze(this.msg);
  }

  message(value: string | MaybeTsDsl<ts.Expression>): this {
    this.msg = value;
    return this;
  }

  override toAst(ctx: AstContext) {
    const errorNode = this.$node(ctx, this.error);
    const messageNode = this.$node(ctx, this.msg ? [this.msg] : []).map(
      (expr) =>
        typeof expr === 'string'
          ? this.$node(ctx, new LiteralTsDsl(expr))
          : expr,
    );
    if (this.useNew) {
      return ts.factory.createThrowStatement(
        ts.factory.createNewExpression(errorNode, undefined, messageNode),
      );
    }
    const args = messageNode.length
      ? [ts.factory.createCallExpression(errorNode, undefined, messageNode)]
      : [errorNode];
    return ts.factory.createThrowStatement(args[0]!);
  }
}
