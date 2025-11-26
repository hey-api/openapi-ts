import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';
import { PrefixTsDsl } from '../expr/prefix';
import { AsMixin } from '../mixins/as';

const Mixed = AsMixin(TsDsl<ts.LiteralTypeNode['literal']>);

export class LiteralTsDsl extends Mixed {
  protected value: string | number | boolean | null;

  constructor(value: string | number | boolean | null) {
    super();
    this.value = value;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  protected override _render() {
    if (typeof this.value === 'boolean') {
      return this.value ? ts.factory.createTrue() : ts.factory.createFalse();
    }
    if (typeof this.value === 'number') {
      const expr = ts.factory.createNumericLiteral(Math.abs(this.value));
      return this.value < 0 ? this.$node(new PrefixTsDsl(expr).neg()) : expr;
    }
    if (typeof this.value === 'string') {
      return ts.factory.createStringLiteral(this.value, true);
    }
    if (this.value === null) {
      return ts.factory.createNull();
    }
    throw new Error(`Unsupported literal: ${String(this.value)}`);
  }
}
