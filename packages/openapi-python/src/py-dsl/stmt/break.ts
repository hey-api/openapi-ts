import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';

const Mixed = PyDsl<py.BreakStatement>;

export class BreakPyDsl extends Mixed {
  readonly '~dsl' = 'BreakPyDsl';

  override analyze(_ctx: AnalysisContext): void {
    super.analyze(_ctx);
  }

  override toAst() {
    return py.factory.createBreakStatement();
  }
}
