import ts from 'typescript';

import type { MaybeTsDsl, TsDsl } from '../base';
import { TypeTsDsl } from '../base';

export class TypeQueryTsDsl extends TypeTsDsl<ts.TypeQueryNode> {
  private expr: string | MaybeTsDsl<TsDsl>;

  constructor(expr: string | MaybeTsDsl<TsDsl>) {
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
