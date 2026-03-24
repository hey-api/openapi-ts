import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';

import { py } from '../../py-compiler';
import { PyDsl } from '../base';
import { LayoutMixin } from '../mixins/layout';
import { f } from '../utils/factories';

export type SubscriptExpr = NodeName | PyDsl<py.Expression>;
export type SubscriptCtor = (
  value: SubscriptExpr,
  ...slices: Array<SubscriptExpr>
) => SubscriptPyDsl;

const Mixed = LayoutMixin(PyDsl<py.SubscriptExpression>);

export class SubscriptPyDsl extends Mixed {
  readonly '~dsl' = 'SubscriptPyDsl';

  protected _slices: Array<Ref<SubscriptExpr>>;
  protected _value: Ref<SubscriptExpr>;

  constructor(value: SubscriptExpr, ...slices: Array<SubscriptExpr>) {
    super();
    this._slices = slices.map((slice) => ref(slice));
    this._value = ref(value);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._value);
    for (const slice of this._slices) {
      ctx.analyze(slice);
    }
  }

  override toAst() {
    const slice =
      this._slices.length === 1
        ? this.$node(this._slices[0]!)
        : py.factory.createSubscriptSlice(this._slices.map((s) => this.$node(s)));
    return py.factory.createSubscriptExpression(this.$node(this._value), slice);
  }
}

f.slice.set((...args) => new SubscriptPyDsl(...args));
