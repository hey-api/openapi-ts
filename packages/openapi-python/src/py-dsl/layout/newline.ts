import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';

export class NewlinePyDsl extends PyDsl<py.EmptyStatement> {
  readonly '~dsl' = 'NewlinePyDsl';

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  override toAst(): py.EmptyStatement {
    return py.factory.createEmptyStatement();
  }
}
