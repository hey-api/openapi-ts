import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';
import { AsMixin } from '../mixins/as';
import { ExprMixin, registerLazyAccessCallFactory } from '../mixins/expr';
import { TypeArgsMixin } from '../mixins/type-args';

const Mixed = ArgsMixin(
  AsMixin(ExprMixin(TypeArgsMixin(TsDsl<ts.CallExpression>))),
);

export class CallTsDsl extends Mixed {
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

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createCallExpression(
      this.$node(this._callee),
      this.$generics(),
      this.$args(),
    );
  }
}

registerLazyAccessCallFactory((expr, args) => new CallTsDsl(expr, ...args));
