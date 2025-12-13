import type {
  AnalysisContext,
  AstContext,
  Symbol,
} from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';
import { AsMixin } from '../mixins/as';
import { ExprMixin, setCallFactory } from '../mixins/expr';
import { TypeArgsMixin } from '../mixins/type-args';

export type CallCallee = string | MaybeTsDsl<ts.Expression>;
export type CallArg = Symbol | string | MaybeTsDsl<ts.Expression>;
export type CallArgs = ReadonlyArray<CallArg | undefined>;
export type CallCtor = (callee: CallCallee, ...args: CallArgs) => CallTsDsl;

const Mixed = ArgsMixin(
  AsMixin(ExprMixin(TypeArgsMixin(TsDsl<ts.CallExpression>))),
);

export class CallTsDsl extends Mixed {
  readonly '~dsl' = 'CallTsDsl';

  protected _callee: CallCallee;

  constructor(callee: CallCallee, ...args: CallArgs) {
    super();
    this._callee = callee;
    this.args(...args);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._callee);
  }

  override toAst(ctx: AstContext) {
    return ts.factory.createCallExpression(
      this.$node(ctx, this._callee),
      this.$generics(ctx),
      this.$args(ctx),
    );
  }
}

setCallFactory((...args) => new CallTsDsl(...args));
