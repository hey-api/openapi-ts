import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';

export class TypeQueryTsDsl extends TypeTsDsl<ts.TypeQueryNode> {
  private expr: string | MaybeTsDsl<ts.Expression>;

  constructor(expr: string | MaybeTsDsl<ts.Expression>) {
    super();
    this.expr = expr;
  }

  $render(): ts.TypeQueryNode {
    const exprName = this.$node(this.expr);
    if (!ts.isEntityName(exprName)) {
      throw new Error(
        'TypeQueryTsDsl: expression must resolve to an EntityName',
      );
    }
    return ts.factory.createTypeQueryNode(exprName);
  }
}
