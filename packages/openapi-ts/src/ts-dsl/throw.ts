import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';

export class ThrowTsDsl extends TsDsl<ts.ThrowStatement> {
  private error: string | MaybeTsDsl<ts.Expression>;
  private msg?: string | MaybeTsDsl<ts.Expression>;
  private useNew: boolean;

  constructor(error: string | MaybeTsDsl<ts.Expression>, useNew = true) {
    super();
    this.error = error;
    this.useNew = useNew;
  }

  message(value: string | MaybeTsDsl<ts.Expression>): this {
    this.msg = value;
    return this;
  }

  $render(): ts.ThrowStatement {
    const errorNode = this.$node(this.error);
    const messageNode = this.$node(this.msg ? [this.msg] : []).map((expr) =>
      typeof expr === 'string' ? ts.factory.createStringLiteral(expr) : expr,
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
