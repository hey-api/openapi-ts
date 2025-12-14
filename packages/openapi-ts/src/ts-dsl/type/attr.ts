import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { isRef, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { TypeExprMixin } from '../mixins/type-expr';

type Base = Symbol | string | MaybeTsDsl<ts.EntityName>;
type Right = Symbol | string | ts.Identifier;

const Mixed = TypeExprMixin(TsDsl<ts.QualifiedName>);

export class TypeAttrTsDsl extends Mixed {
  readonly '~dsl' = 'TypeAttrTsDsl';

  protected _base?: Ref<Base>;
  protected _right!: Ref<Right>;

  constructor(base: Base | Ref<Base>, right: string | ts.Identifier);
  constructor(right: Right);
  constructor(base: Base | Ref<Base>, right?: Right) {
    super();
    if (right) {
      this.base(base);
      this.right(right);
    } else {
      this.base();
      this.right(base as Right);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._base);
    ctx.analyze(this._right);
  }

  base(base?: Base | Ref<Base>): this {
    if (isRef(base)) {
      this._base = base;
    } else {
      this._base = base ? ref(base) : undefined;
    }
    return this;
  }

  right(right: Right): this {
    this._right = ref(right);
    return this;
  }

  override toAst(ctx: AstContext) {
    if (!this._base) {
      throw new Error('TypeAttrTsDsl: missing base for qualified name');
    }
    const left = this.$node(ctx, this._base);
    if (!ts.isEntityName(left)) {
      throw new Error('TypeAttrTsDsl: base must be an EntityName');
    }
    return ts.factory.createQualifiedName(
      left,
      this.$node(ctx, this._right) as ts.Identifier,
    );
  }
}
