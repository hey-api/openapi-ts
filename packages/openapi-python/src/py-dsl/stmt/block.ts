import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';
import type { DoExpr } from '../mixins/do';
import { DoMixin } from '../mixins/do';
import { LayoutMixin } from '../mixins/layout';

const Mixed = DoMixin(LayoutMixin(PyDsl<py.Block>));

export class BlockPyDsl extends Mixed {
  readonly '~dsl' = 'BlockPyDsl';

  constructor(...items: Array<DoExpr>) {
    super();
    this.do(...items);
  }

  override analyze(ctx: AnalysisContext) {
    super.analyze(ctx);
  }

  override toAst() {
    const statements = this.$do();
    return py.factory.createBlock(statements);
  }
}
