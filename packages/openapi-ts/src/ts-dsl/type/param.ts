import type { AnalysisContext, Ref, Symbol } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';

export type TypeParamName = Symbol | string;
export type TypeParamExpr = Symbol | string | boolean | MaybeTsDsl<TypeTsDsl>;

const Mixed = TypeTsDsl<ts.TypeParameterDeclaration>;

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

  override toAst() {
    if (!this.name) throw new Error('Missing type name');
    return ts.factory.createTypeParameterDeclaration(
      undefined,
      // @ts-expect-error need to improve types
      this.$node(this.name),
      this.$type(this.constraint),
      this.$type(this.defaultValue),
    );
  }
}
