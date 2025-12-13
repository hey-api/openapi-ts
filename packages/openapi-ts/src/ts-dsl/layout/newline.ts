import type { AnalysisContext, AstContext } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

export class NewlineTsDsl extends TsDsl<ts.Identifier> {
  readonly '~dsl' = 'NewlineTsDsl';

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  override toAst(ctx: AstContext): ts.Identifier {
    return this.$node(ctx, new IdTsDsl('\n'));
  }
}
