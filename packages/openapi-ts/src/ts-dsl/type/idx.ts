import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl, TypeTsDsl } from '../base';
import {
  registerLazyAccessTypeIdxFactory,
  TypeExprMixin,
} from '../mixins/type-expr';

type Base = string | MaybeTsDsl<ts.TypeNode>;
type Index = string | number | MaybeTsDsl<ts.TypeNode>;

const Mixed = TypeExprMixin(TypeTsDsl<ts.IndexedAccessTypeNode>);

export class TypeIdxTsDsl extends Mixed {
  protected _base!: Base;
  protected _index!: Index;

  constructor(base: Base, index: Index) {
    super();
    this.base(base);
    this.index(index);
  }

  base(base: Base): this {
    this._base = base;
    if (this._base instanceof TsDsl) this._base.setParent(this);
    return this;
  }

  index(index: Index): this {
    this._index = index;
    if (this._index instanceof TsDsl) this._index.setParent(this);
    return this;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
    if (this._base instanceof TsDsl) {
      this._base.traverse(visitor);
    }
    if (this._index instanceof TsDsl) {
      this._index.traverse(visitor);
    }
  }

  protected override _render() {
    return ts.factory.createIndexedAccessTypeNode(
      this.$type(this._base),
      this.$type(this._index),
    );
  }
}

registerLazyAccessTypeIdxFactory((...args) => new TypeIdxTsDsl(...args));
