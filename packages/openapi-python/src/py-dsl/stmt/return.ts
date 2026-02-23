import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { f } from '../utils/factories';

export type ReturnExpr = NodeName | MaybePyDsl<py.Expression>;
export type ReturnCtor = (expr?: ReturnExpr) => ReturnPyDsl;

const Mixed = PyDsl<py.ReturnStatement>;

export class ReturnPyDsl extends Mixed {
  readonly '~dsl' = 'ReturnPyDsl';

  protected _returnExpr?: Ref<ReturnExpr>;

  constructor(expr?: ReturnExpr) {
    super();
    if (expr) this._returnExpr = ref(expr);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._returnExpr);
  }

  override toAst() {
    return py.factory.createReturnStatement(this.$node(this._returnExpr));
  }
}

f.return.set((...args) => new ReturnPyDsl(...args));
