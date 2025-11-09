/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { AccessMixin } from './mixins/access';
import { mixin } from './mixins/apply';
import { ArgsMixin } from './mixins/args';
import { GenericsMixin } from './mixins/generics';

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
      // @ts-expect-error --- generics are not officially supported on 'new' expressions yet
      this.$type(this._generics),
      this.$args(),
    );
  }
}

export interface NewTsDsl extends AccessMixin, ArgsMixin, GenericsMixin {}
mixin(NewTsDsl, AccessMixin, ArgsMixin, GenericsMixin);
