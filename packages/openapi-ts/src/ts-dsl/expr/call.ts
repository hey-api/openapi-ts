import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';
import { AsMixin } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';
import { TypeArgsMixin } from '../mixins/type-args';
import { f } from '../utils/factories';

export type CallArgs = ReadonlyArray<CallExpr | undefined>;
export type CallExpr = NodeName | MaybeTsDsl<ts.Expression>;
export type CallCtor = (expr: CallExpr, ...args: CallArgs) => CallTsDsl;

const Mixed = ArgsMixin(AsMixin(ExprMixin(TypeArgsMixin(TsDsl<ts.CallExpression>))));

export class CallTsDsl extends Mixed {
  readonly '~dsl' = 'CallTsDsl';

  protected _callExpr: Ref<CallExpr>;

  constructor(expr: CallExpr, ...args: CallArgs) {
    super();
    this._callExpr = ref(expr);
    this.args(...args);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._callExpr);
  }

  override toAst() {
    return ts.factory.createCallExpression(
      this.$node(this._callExpr),
      this.$generics(),
      this.$args(),
    );
  }
}

f.call.set((...args) => new CallTsDsl(...args));
