import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';

const Mixed = PyDsl<py.Identifier>;

export class IdPyDsl extends Mixed {
  readonly '~dsl' = 'IdPyDsl';

  constructor(name: NodeName) {
    super();
    this.name.set(name);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.name);
  }

  override toAst() {
    return py.factory.createIdentifier(this.name.toString());
  }
}
