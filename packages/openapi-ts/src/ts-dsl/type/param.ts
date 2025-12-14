import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';

export type TypeParamName = Symbol | string;
export type TypeParamExpr = Symbol | string | boolean | MaybeTsDsl<TypeTsDsl>;

const Mixed = TsDsl<ts.TypeParameterDeclaration>;

export class TypeParamTsDsl extends Mixed {
  readonly '~dsl' = 'TypeParamTsDsl';

  protected constraint?: Ref<TypeParamExpr>;
  protected defaultValue?: Ref<TypeParamExpr>;
  protected name?: Ref<TypeParamName>;

  constructor(name?: TypeParamName, fn?: (name: TypeParamTsDsl) => void) {
    super();
    if (name) this.name = ref(name);
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.name);
    ctx.analyze(this.constraint);
    ctx.analyze(this.defaultValue);
  }

  default(value: TypeParamExpr): this {
    this.defaultValue = ref(value);
    return this;
  }

  extends(constraint: TypeParamExpr): this {
    this.constraint = ref(constraint);
    return this;
  }

  override toAst(ctx: AstContext) {
    if (!this.name) throw new Error('Missing type name');
    return ts.factory.createTypeParameterDeclaration(
      undefined,
      this.$node(ctx, this.name) as ts.Identifier,
      this.$type(ctx, this.constraint),
      this.$type(ctx, this.defaultValue),
    );
  }
}
