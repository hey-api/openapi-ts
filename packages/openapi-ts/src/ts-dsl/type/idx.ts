import ts from 'typescript';

import type { MaybeTsDsl, WithString } from '../base';
import { TypeTsDsl } from '../base';

export class TypeIdxTsDsl extends TypeTsDsl<ts.IndexedAccessTypeNode> {
  private _base: WithString<MaybeTsDsl<ts.TypeNode>>;
  private _index: WithString<MaybeTsDsl<ts.TypeNode>> | number;

  constructor(
    base: WithString<MaybeTsDsl<ts.TypeNode>>,
    index: WithString<MaybeTsDsl<ts.TypeNode>> | number,
  ) {
    super();
    this._base = base;
    this._index = index;
  }

  base(base: WithString<MaybeTsDsl<ts.TypeNode>>): this {
    this._base = base;
    return this;
  }

  index(index: WithString<MaybeTsDsl<ts.TypeNode>> | number): this {
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
