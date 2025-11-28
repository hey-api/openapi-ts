import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
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
  protected _callee: CallCallee;

  constructor(callee: CallCallee, ...args: CallArgs) {
    super();
    this._callee = callee;
    this.args(...args);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isTsDsl(this._callee)) this._callee.analyze(ctx);
  }

  protected override _render() {
    return ts.factory.createCallExpression(
      this.$node(this._callee),
      this.$generics(),
      this.$args(),
    );
  }
}

setCallFactory((...args) => new CallTsDsl(...args));
