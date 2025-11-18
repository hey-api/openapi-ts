import ts from 'typescript';

import { TsDsl } from '../base';

export class StmtTsDsl extends TsDsl<ts.Statement> {
  protected _inner: ts.Expression | ts.Statement | TsDsl<any>;

  constructor(inner: ts.Expression | ts.Statement | TsDsl<any>) {
    super();
    this._inner = inner;
  }

  $render(): ts.Statement {
    const node = this.$node(this._inner);
    return ts.isStatement(node)
      ? node
      : ts.factory.createExpressionStatement(node);
  }
}
