/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type */
import ts from 'typescript';

import { TsDsl } from '../base';
import { PrefixTsDsl } from '../expr/prefix';
import { mixin } from '../mixins/apply';
import { AsMixin } from '../mixins/as';

export class LiteralTsDsl extends TsDsl<ts.LiteralTypeNode['literal']> {
  protected value: string | number | boolean | null;

  constructor(value: string | number | boolean | null) {
    super();
    this.value = value;
  }

  $render(): ts.LiteralTypeNode['literal'] {
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

export interface LiteralTsDsl extends AsMixin {}
mixin(LiteralTsDsl, AsMixin);
