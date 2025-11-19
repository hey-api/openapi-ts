/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import {
  registerLazyAccessTypeIdxFactory,
  TypeExprMixin,
} from '../mixins/type-expr';

export class TypeIdxTsDsl extends TypeTsDsl<ts.IndexedAccessTypeNode> {
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

  $render(): ts.IndexedAccessTypeNode {
    return ts.factory.createIndexedAccessTypeNode(
      this.$type(this._base),
      this.$type(this._index),
    );
  }
}

export interface TypeIdxTsDsl extends TypeExprMixin {}
mixin(TypeIdxTsDsl, TypeExprMixin);

registerLazyAccessTypeIdxFactory((...args) => new TypeIdxTsDsl(...args));
