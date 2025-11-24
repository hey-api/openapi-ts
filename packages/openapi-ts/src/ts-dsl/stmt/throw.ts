import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { LiteralTsDsl } from '../expr/literal';

const Mixed = TsDsl<ts.ThrowStatement>;

export class ThrowTsDsl extends Mixed {
  protected error: string | MaybeTsDsl<ts.Expression>;
  protected msg?: string | MaybeTsDsl<ts.Expression>;
  protected useNew: boolean;

  constructor(error: string | MaybeTsDsl<ts.Expression>, useNew = true) {
    super();
    this.error = error;
    this.useNew = useNew;
  }

  message(value: string | MaybeTsDsl<ts.Expression>): this {
    this.msg = value;
    return this;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    const errorNode = this.$node(this.error);
    const messageNode = this.$node(this.msg ? [this.msg] : []).map((expr) =>
      typeof expr === 'string' ? this.$node(new LiteralTsDsl(expr)) : expr,
    );
    if (this.useNew) {
      return ts.factory.createThrowStatement(
        ts.factory.createNewExpression(errorNode, undefined, messageNode),
      );
    }
    const args = messageNode.length
      ? [ts.factory.createCallExpression(errorNode, undefined, messageNode)]
      : [errorNode];
    return ts.factory.createThrowStatement(args[0]!);
  }
}
