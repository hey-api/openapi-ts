import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { isNode, isSymbol, ref } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
// import { AsMixin } from '../mixins/as';
// import { ExprMixin } from '../mixins/expr';
// import { OperatorMixin } from '../mixins/operator';
// import { TypeExprMixin } from '../mixins/type-expr';

type Id = NodeName | MaybePyDsl<py.Expression>;

const Mixed = PyDsl<py.Expression>;
// const Mixed = AsMixin(ExprMixin(OperatorMixin(TypeExprMixin(PyDsl<PyExpression>))));

export class ExprPyDsl extends Mixed {
  readonly '~dsl' = 'ExprPyDsl';

  protected _exprInput: Ref<Id>;

  constructor(id: Id) {
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
