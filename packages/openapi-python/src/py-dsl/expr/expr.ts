import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { isNode, isSymbol, ref } from '@hey-api/codegen-core';

import type { py } from '../../py-compiler';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { ExprMixin } from '../mixins/expr';
import { f } from '../utils/factories';

export type ExprId = NodeName | MaybePyDsl<py.Expression>;
export type ExprCtor = (id: ExprId) => ExprPyDsl;

const Mixed = ExprMixin(PyDsl<py.Expression>);

export class ExprPyDsl extends Mixed {
  readonly '~dsl' = 'ExprPyDsl';

  protected _exprInput: Ref<ExprId>;

  constructor(id: ExprId) {
    super();
    this._exprInput = ref(id);
    if (typeof id === 'string' || isSymbol(id)) {
      this.name.set(id);
    } else if (isNode(id)) {
      this.name.set(id.name);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._exprInput);
  }

  override toAst() {
    return this.$node(this._exprInput);
  }
}

f.expr.set((...args) => new ExprPyDsl(...args));
