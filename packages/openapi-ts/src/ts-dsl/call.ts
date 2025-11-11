/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { AccessMixin, registerLazyAccessCallFactory } from './mixins/access';
import { mixin } from './mixins/apply';
import { ArgsMixin } from './mixins/args';

export class CallTsDsl extends TsDsl<ts.CallExpression> {
  private _callee: MaybeTsDsl<WithString>;
  private _typeArguments?: ReadonlyArray<ts.TypeNode>;

  constructor(
    callee: MaybeTsDsl<WithString>,
    ...args: ReadonlyArray<MaybeTsDsl<WithString>>
  ) {
    super();
    this._callee = callee;
    this.args(...args);
  }

  /** Adds type arguments to the call expression (e.g. `fn<string, number>()`). */
  typeArgs(...args: ReadonlyArray<string | ts.TypeNode>): this {
    this._typeArguments = args.map((arg) =>
      typeof arg === 'string' ? (this.$type(arg) as ts.TypeNode) : arg,
    );
    return this;
  }

  $render(): ts.CallExpression {
    return ts.factory.createCallExpression(
      this.$node(this._callee),
      this._typeArguments,
      this.$args(),
    );
  }
}

export interface CallTsDsl extends AccessMixin, ArgsMixin {}
mixin(CallTsDsl, AccessMixin, ArgsMixin);

registerLazyAccessCallFactory((expr, args) => new CallTsDsl(expr, ...args));
