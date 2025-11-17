import ts from 'typescript';

import type { MaybeTsDsl, WithString } from '../base';
import { TypeTsDsl } from '../base';

export class TypeQueryTsDsl extends TypeTsDsl<ts.TypeQueryNode> {
  private expr: MaybeTsDsl<WithString>;

  constructor(expr: MaybeTsDsl<WithString>) {
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
