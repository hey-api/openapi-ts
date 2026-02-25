import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';

const Mixed = PyDsl<py.ContinueStatement>;

export class ContinuePyDsl extends Mixed {
  readonly '~dsl' = 'ContinuePyDsl';

  override analyze(_ctx: AnalysisContext): void {
    super.analyze(_ctx);
  }

  override toAst() {
    return py.factory.createContinueStatement();
  }
}
