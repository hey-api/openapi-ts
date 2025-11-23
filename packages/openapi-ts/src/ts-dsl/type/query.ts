/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import {
  registerLazyAccessTypeQueryFactory,
  TypeExprMixin,
} from '../mixins/type-expr';

export class TypeQueryTsDsl extends TypeTsDsl<ts.TypeQueryNode> {
  protected _expr: string | MaybeTsDsl<TypeTsDsl | ts.Expression>;

  constructor(expr: string | MaybeTsDsl<TypeTsDsl | ts.Expression>) {
    super();
    this._expr = expr;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.TypeQueryNode {
    const expr = this.$node(this._expr);
    return ts.factory.createTypeQueryNode(expr as unknown as ts.EntityName);
  }
}

export interface TypeQueryTsDsl extends TypeExprMixin {}
mixin(TypeQueryTsDsl, TypeExprMixin);

registerLazyAccessTypeQueryFactory((...args) => new TypeQueryTsDsl(...args));
