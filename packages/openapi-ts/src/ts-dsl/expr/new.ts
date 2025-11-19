/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { ArgsMixin } from '../mixins/args';
import { ExprMixin } from '../mixins/expr';
import { TypeArgsMixin } from '../mixins/type-args';

export class NewTsDsl extends TsDsl<ts.NewExpression> {
  protected classExpr: string | MaybeTsDsl<ts.Expression>;

  constructor(
    classExpr: string | MaybeTsDsl<ts.Expression>,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
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

export interface NewTsDsl extends ArgsMixin, ExprMixin, TypeArgsMixin {}
mixin(NewTsDsl, ArgsMixin, ExprMixin, TypeArgsMixin);
