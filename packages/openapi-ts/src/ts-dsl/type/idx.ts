import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { setTypeIdxFactory, TypeExprMixin } from '../mixins/type-expr';

type Base = string | MaybeTsDsl<ts.TypeNode>;
type Index = string | number | MaybeTsDsl<ts.TypeNode>;

const Mixed = TypeExprMixin(TypeTsDsl<ts.IndexedAccessTypeNode>);

export class TypeIdxTsDsl extends Mixed {
  readonly '~dsl' = 'TypeIdxTsDsl';

  protected _base!: Base;
  protected _index!: Index;

  constructor(base: Base, index: Index) {
    super();
    this.base(base);
    this.index(index);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._base);
    ctx.analyze(this._index);
  }

  base(base: Base): this {
    this._base = base;
    return this;
  }

  index(index: Index): this {
    this._index = index;
    return this;
  }

  override toAst() {
    return ts.factory.createIndexedAccessTypeNode(
      this.$type(this._base),
      this.$type(this._index),
    );
  }
}

setTypeIdxFactory((...args) => new TypeIdxTsDsl(...args));
