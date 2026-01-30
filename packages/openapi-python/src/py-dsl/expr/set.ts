import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { LayoutMixin } from '../mixins/layout';

const Mixed = LayoutMixin(PyDsl<py.SetExpression>);

export class SetPyDsl extends Mixed {
  readonly '~dsl' = 'SetPyDsl';

  protected _elements: Array<MaybePyDsl<py.Expression>> = [];

  constructor(...elements: Array<MaybePyDsl<py.Expression>>) {
    super();
    this._elements = elements;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const el of this._elements) {
      ctx.analyze(el);
    }
  }

  element(expr: MaybePyDsl<py.Expression>): this {
    this._elements.push(expr);
    return this;
  }

  elements(...exprs: ReadonlyArray<MaybePyDsl<py.Expression>>): this {
    this._elements.push(...exprs);
    return this;
  }

  override toAst(): py.SetExpression {
    const astElements = this._elements.map((el) => this.$node(el) as py.Expression);
    return py.factory.createSetExpression(astElements);
  }
}
