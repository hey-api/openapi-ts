/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { ArgsMixin } from '../mixins/args';
import { AsMixin } from '../mixins/as';
import { ExprMixin, registerLazyAccessCallFactory } from '../mixins/expr';
import { TypeArgsMixin } from '../mixins/type-args';

export class CallTsDsl extends TsDsl<ts.CallExpression> {
  protected _callee: string | MaybeTsDsl<ts.Expression>;

  constructor(
    callee: string | MaybeTsDsl<ts.Expression>,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression> | undefined>
  ) {
    super();
    this._callee = callee;
    this.args(
      ...args.filter((a): a is NonNullable<typeof a> => a !== undefined),
    );
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.CallExpression {
    return ts.factory.createCallExpression(
      this.$node(this._callee),
      this.$generics(),
      this.$args(),
    );
  }
}

export interface CallTsDsl
  extends ArgsMixin,
    AsMixin,
    ExprMixin,
    TypeArgsMixin {}
mixin(CallTsDsl, ArgsMixin, AsMixin, ExprMixin, TypeArgsMixin);

registerLazyAccessCallFactory((expr, args) => new CallTsDsl(expr, ...args));
