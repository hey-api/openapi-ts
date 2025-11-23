import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import {
  registerLazyAccessTypeIdxFactory,
  TypeExprMixin,
} from '../mixins/type-expr';

const Mixed = TypeExprMixin(TypeTsDsl<ts.IndexedAccessTypeNode>);

export class TypeIdxTsDsl extends Mixed {
  protected _base: string | MaybeTsDsl<ts.TypeNode>;
  protected _index: string | MaybeTsDsl<ts.TypeNode> | number;

  constructor(
    base: string | MaybeTsDsl<ts.TypeNode>,
    index: string | MaybeTsDsl<ts.TypeNode> | number,
  ) {
    super();
    this._base = base;
    this._index = index;
  }

  base(base: string | MaybeTsDsl<ts.TypeNode>): this {
    this._base = base;
    return this;
  }

  index(index: string | MaybeTsDsl<ts.TypeNode> | number): this {
    this._index = index;
    return this;
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  protected override _render() {
    return ts.factory.createIndexedAccessTypeNode(
      this.$type(this._base),
      this.$type(this._index),
    );
  }
}

registerLazyAccessTypeIdxFactory((...args) => new TypeIdxTsDsl(...args));
