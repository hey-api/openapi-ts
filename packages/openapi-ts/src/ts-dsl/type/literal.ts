import type { AnalysisContext, NodeScope } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';
import { LiteralTsDsl } from '../expr/literal';

const Mixed = TsDsl<ts.LiteralTypeNode>;

export class TypeLiteralTsDsl extends Mixed {
  readonly '~dsl' = 'TypeLiteralTsDsl';
  override scope: NodeScope = 'type';

  protected value: string | number | boolean | null;

  constructor(value: string | number | boolean | null) {
    super();
    this.value = value;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  override toAst() {
    return ts.factory.createLiteralTypeNode(
      this.$node(new LiteralTsDsl(this.value)),
    );
  }
}
