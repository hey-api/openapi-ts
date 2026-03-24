import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../py-compiler';
import { PyDsl } from '../base';

const Mixed = PyDsl<py.Literal>;

export class LiteralPyDsl extends Mixed {
  readonly '~dsl' = 'LiteralPyDsl';

  protected value: py.LiteralValue;

  constructor(value: py.LiteralValue) {
    super();
    this.value = value;
  }

  override analyze(_ctx: AnalysisContext): void {
    super.analyze(_ctx);
  }

  override toAst() {
    return py.factory.createLiteral(this.value);
  }
}
