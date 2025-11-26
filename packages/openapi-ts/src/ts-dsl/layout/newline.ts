import type { AnalysisContext } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

export class NewlineTsDsl extends TsDsl<ts.Identifier> {
  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  protected override _render(): ts.Identifier {
    return this.$node(new IdTsDsl('\n'));
  }
}
