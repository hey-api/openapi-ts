import ts from 'typescript';

import { AwaitTsDsl } from './await';
import type { ExprInput, MaybeTsDsl } from './base';
import { TsDsl } from './base';

export class CallTsDsl extends TsDsl<ts.CallExpression> {
  private callee: MaybeTsDsl<ExprInput>;
  private callArgs: ReadonlyArray<MaybeTsDsl<ExprInput>> = [];

  constructor(
    callee: MaybeTsDsl<ExprInput>,
    ...args: ReadonlyArray<MaybeTsDsl<ExprInput>>
  ) {
    super();
    this.callee = callee;
    if (args.length) this.callArgs = args;
  }

  /** Adds one or more arguments to the call expression. */
  args(...args: ReadonlyArray<MaybeTsDsl<ExprInput>>): this {
    this.callArgs = args;
    return this;
  }

  /** Await the result of the call expression. */
  await(): AwaitTsDsl {
    return new AwaitTsDsl(this);
  }

  $render(): ts.CallExpression {
    const calleeNode = this.$node(this.callee);
    const argsNodes = this.$node(this.callArgs).map((arg) => this.$expr(arg));
    return ts.factory.createCallExpression(calleeNode, undefined, argsNodes);
  }
}
