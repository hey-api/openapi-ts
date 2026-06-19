import type { AnalysisContext } from '@hey-api/codegen-core';
import tsOld from 'typescript';

import type { ts } from '../../ts-compiler';
import { TsDsl } from '../base';
import { PrefixTsDsl } from '../expr/prefix';
import { AsMixin } from '../mixins/as';

const Mixed = AsMixin(
  TsDsl<
    | tsOld.BigIntLiteral
    | tsOld.BooleanLiteral
    | tsOld.NullLiteral
    | tsOld.NumericLiteral
    | tsOld.PrefixUnaryExpression
    | tsOld.StringLiteral
  >,
);

export class LiteralTsDsl extends Mixed {
  readonly '~dsl' = 'LiteralTsDsl';

  protected value: ts.LiteralValue;

  constructor(value: ts.LiteralValue) {
    super();
    this.value = value;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  override toAst() {
    if (typeof this.value === 'boolean') {
      return this.value ? tsOld.factory.createTrue() : tsOld.factory.createFalse();
    }
    if (typeof this.value === 'number') {
      const expr = tsOld.factory.createNumericLiteral(Math.abs(this.value));
      return this.value < 0 ? this.$node(new PrefixTsDsl(expr).neg()) : expr;
    }
    if (typeof this.value === 'string') {
      return tsOld.factory.createStringLiteral(this.value, true);
    }
    if (typeof this.value === 'bigint') {
      return tsOld.factory.createBigIntLiteral(this.value.toString());
    }
    if (this.value === null) {
      return tsOld.factory.createNull();
    }
    throw new Error(`Unsupported literal: ${String(this.value)}`);
  }
}
