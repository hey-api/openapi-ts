/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { ArgsMixin } from './mixins/args';
import { ExprMixin, registerLazyAccessCallFactory } from './mixins/expr';
import { TypeArgsMixin } from './mixins/type-args';

export class CallTsDsl extends TsDsl<ts.CallExpression> {
  private _callee: MaybeTsDsl<WithString>;

  constructor(
    callee: MaybeTsDsl<WithString>,
    ...args: ReadonlyArray<MaybeTsDsl<WithString> | undefined>
  ) {
    super();
    this._callee = callee;
    this.args(
      ...args.filter((a): a is NonNullable<typeof a> => a !== undefined),
    );
  }

  $render(): ts.CallExpression {
    return ts.factory.createCallExpression(
      this.$node(this._callee),
      this.$generics(),
      this.$args(),
    );
  }
}

export interface CallTsDsl extends ArgsMixin, ExprMixin, TypeArgsMixin {}
mixin(CallTsDsl, ArgsMixin, ExprMixin, TypeArgsMixin);

registerLazyAccessCallFactory((expr, args) => new CallTsDsl(expr, ...args));
