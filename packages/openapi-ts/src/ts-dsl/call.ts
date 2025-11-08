/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { AccessMixin, registerLazyAccessCallFactory } from './mixins/access';
import { mixin } from './mixins/apply';
import { ArgsMixin } from './mixins/args';

export class CallTsDsl extends TsDsl<ts.CallExpression> {
  private _callee: MaybeTsDsl<WithString>;

  constructor(
    callee: MaybeTsDsl<WithString>,
    ...args: ReadonlyArray<MaybeTsDsl<WithString>>
  ) {
    super();
    this._callee = callee;
    this.args(...args);
  }

  $render(): ts.CallExpression {
    return ts.factory.createCallExpression(
      this.$node(this._callee),
      undefined,
      this.$args(),
    );
  }
}

export interface CallTsDsl extends AccessMixin, ArgsMixin {}
mixin(CallTsDsl, AccessMixin, ArgsMixin);

registerLazyAccessCallFactory((expr, args) => new CallTsDsl(expr, ...args));
