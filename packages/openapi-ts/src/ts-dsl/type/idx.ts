import type {
  AnalysisContext,
  AstContext,
  NodeScope,
} from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { TypeExprMixin } from '../mixins/type-expr';
import { f } from '../utils/factories';

type Base = string | MaybeTsDsl<ts.TypeNode>;
type Index = string | number | MaybeTsDsl<ts.TypeNode>;
export type TypeIdxCtor = (base: Base, index: Index) => TypeIdxTsDsl;

const Mixed = TypeExprMixin(TsDsl<ts.IndexedAccessTypeNode>);

export class TypeIdxTsDsl extends Mixed {
  readonly '~dsl' = 'TypeIdxTsDsl';
  override scope: NodeScope = 'type';

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

  override toAst(ctx: AstContext) {
    return ts.factory.createIndexedAccessTypeNode(
      this.$type(ctx, this._base),
      this.$type(ctx, this._index),
    );
  }
}

f.type.idx.set((...args) => new TypeIdxTsDsl(...args));
