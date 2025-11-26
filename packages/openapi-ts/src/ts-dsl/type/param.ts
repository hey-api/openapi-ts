import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TypeTsDsl } from '../base';

export type TypeParamName = Symbol | string;
export type TypeParamExpr = Symbol | string | boolean | MaybeTsDsl<TypeTsDsl>;

const Mixed = TypeTsDsl<ts.TypeParameterDeclaration>;

export class TypeParamTsDsl extends Mixed {
  protected name?: TypeParamName;
  protected constraint?: TypeParamExpr;
  protected defaultValue?: TypeParamExpr;

  constructor(name?: TypeParamName, fn?: (name: TypeParamTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this.name)) ctx.addDependency(this.name);
    if (isSymbol(this.constraint)) {
      ctx.addDependency(this.constraint);
    } else if (isTsDsl(this.constraint)) {
      this.constraint.analyze(ctx);
    }
    if (isSymbol(this.defaultValue)) {
      ctx.addDependency(this.defaultValue);
    } else if (isTsDsl(this.defaultValue)) {
      this.defaultValue.analyze(ctx);
    }
  }

  default(value: TypeParamExpr): this {
    this.defaultValue = value;
    return this;
  }

  extends(constraint: TypeParamExpr): this {
    this.constraint = constraint;
    return this;
  }

  protected override _render() {
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
