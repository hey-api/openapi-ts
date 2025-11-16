import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';

export class TypeIdxTsDsl extends TypeTsDsl<ts.IndexedAccessTypeNode> {
  private _base: string | MaybeTsDsl<ts.TypeNode>;
  private _index: string | MaybeTsDsl<ts.TypeNode> | number;

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

  $render(): ts.IndexedAccessTypeNode {
    return ts.factory.createIndexedAccessTypeNode(
      this.$type(this._base),
      this.$type(this._index),
    );
  }
}
