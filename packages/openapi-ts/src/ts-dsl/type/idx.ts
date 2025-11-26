import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TypeTsDsl } from '../base';
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

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isTsDsl(this._base)) this._base.analyze(ctx);
    if (isTsDsl(this._index)) this._index.analyze(ctx);
  }

  base(base: Base): this {
    this._base = base;
    return this;
  }

  index(index: Index): this {
    this._index = index;
    return this;
  }

  protected override _render() {
    return ts.factory.createIndexedAccessTypeNode(
      this.$type(this._base),
      this.$type(this._index),
    );
  }
}

registerLazyAccessTypeIdxFactory((...args) => new TypeIdxTsDsl(...args));
