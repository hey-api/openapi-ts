import type { AnalysisContext, NodeScope } from '@hey-api/codegen-core';
import tsOld from 'typescript';

import type { ts } from '../../ts-compiler';
import { TsDsl } from '../base';
import { LiteralTsDsl } from '../expr/literal';
import { DocMixin } from '../mixins/doc';

const Mixed = DocMixin(TsDsl<tsOld.LiteralTypeNode>);

export class TypeLiteralTsDsl extends Mixed {
  readonly '~dsl' = 'TypeLiteralTsDsl';
  override scope: NodeScope = 'type';

  protected value: ts.LiteralValue;

  constructor(value: ts.LiteralValue) {
    super();
    this.value = value;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  override toAst() {
    return this.$docs(
      tsOld.factory.createLiteralTypeNode(this.$node(new LiteralTsDsl(this.value))),
    );
  }
}
