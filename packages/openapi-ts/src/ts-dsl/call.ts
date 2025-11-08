/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { AwaitTsDsl } from './await';
import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { ArgsMixin } from './mixins/args';

export class CallTsDsl extends TsDsl<ts.CallExpression> {
  private callee: MaybeTsDsl<WithString>;

  constructor(
    callee: MaybeTsDsl<WithString>,
    ...args: ReadonlyArray<MaybeTsDsl<WithString>>
  ) {
    super();
    this.callee = callee;
    this.args(...args);
  }

  /** Await the result of the call expression. */
  await(): AwaitTsDsl {
    return new AwaitTsDsl(this);
  }

  $render(): ts.CallExpression {
    return ts.factory.createCallExpression(
      this.$node(this.callee),
      undefined,
      this.$args(),
    );
  }
}

export interface CallTsDsl extends ArgsMixin {}
mixin(CallTsDsl, ArgsMixin);
