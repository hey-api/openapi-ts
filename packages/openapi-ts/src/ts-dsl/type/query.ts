import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { registerLazyAccessTypeQueryFactory } from '../mixins/type-expr';

export class TypeQueryTsDsl extends TypeTsDsl<ts.TypeQueryNode> {
  private _expr: string | MaybeTsDsl<TypeTsDsl | ts.Expression>;

  constructor(expr: string | MaybeTsDsl<TypeTsDsl | ts.Expression>) {
    super();
    this._expr = expr;
  }

  $render(): ts.TypeQueryNode {
    const expr = this.$node(this._expr);
    return ts.factory.createTypeQueryNode(expr as unknown as ts.EntityName);
  }
}

registerLazyAccessTypeQueryFactory((...args) => new TypeQueryTsDsl(...args));
