import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';

export type LiteralValue = string | number | boolean | null;

const Mixed = PyDsl<py.Literal>;

export class LiteralPyDsl extends Mixed {
  readonly '~dsl' = 'LiteralPyDsl';

  protected value: LiteralValue;

  constructor(value: LiteralValue) {
    super();
    this.value = value;
  }

  override analyze(_ctx: AnalysisContext): void {
    super.analyze(_ctx);
  }

  override toAst(): py.Literal {
    return py.factory.createLiteral(this.value);
  }
}
