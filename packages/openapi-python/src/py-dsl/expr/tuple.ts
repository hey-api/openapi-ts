import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';

import { py } from '../../py-compiler';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { LayoutMixin } from '../mixins/layout';

export type TupleElement = NodeName | MaybePyDsl<py.Expression>;

const Mixed = LayoutMixin(PyDsl<py.TupleExpression>);

export class TuplePyDsl extends Mixed {
  readonly '~dsl' = 'TuplePyDsl';

  protected _elements: Array<Ref<TupleElement>> = [];

  constructor(...elements: Array<TupleElement>) {
    super();
    this._elements = elements.map((element) => ref(element));
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const el of this._elements) {
      ctx.analyze(el);
    }
  }

  element(expr: TupleElement): this {
    this._elements.push(ref(expr));
    return this;
  }

  elements(...exprs: ReadonlyArray<TupleElement>): this {
    this._elements.push(...exprs.map((expr) => ref(expr)));
    return this;
  }

  override toAst() {
    const astElements = this._elements.map((el) => this.$node(el));
    return py.factory.createTupleExpression(astElements);
  }
}
