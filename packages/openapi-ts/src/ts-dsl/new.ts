/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { AccessMixin } from './mixins/access';
import { mixin } from './mixins/apply';
import { ArgsMixin } from './mixins/args';
import { TypeArgsMixin } from './mixins/type-args';

export class NewTsDsl extends TsDsl<ts.NewExpression> {
  private classExpr: MaybeTsDsl<WithString>;

  constructor(
    classExpr: MaybeTsDsl<WithString>,
    ...args: ReadonlyArray<MaybeTsDsl<WithString>>
  ) {
    super();
    this.classExpr = classExpr;
    this.args(...args);
  }

  /** Builds the `NewExpression` node. */
  $render(): ts.NewExpression {
    return ts.factory.createNewExpression(
      this.$node(this.classExpr),
      this.$generics(),
      this.$args(),
    );
  }
}

export interface NewTsDsl extends AccessMixin, ArgsMixin, TypeArgsMixin {}
mixin(NewTsDsl, AccessMixin, ArgsMixin, TypeArgsMixin);
