import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TypeTsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ReadonlyMixin } from '../mixins/modifiers';
import { OptionalMixin } from '../mixins/optional';
import { TokenTsDsl } from '../token';
import { safePropName } from '../utils/prop';

export type TypePropName = string;
export type TypePropType = Symbol | string | MaybeTsDsl<ts.TypeNode>;

const Mixed = DocMixin(OptionalMixin(ReadonlyMixin(TypeTsDsl<ts.TypeElement>)));

export class TypePropTsDsl extends Mixed {
  protected name: TypePropName;
  protected _type?: TypePropType;

  constructor(name: TypePropName, fn: (p: TypePropTsDsl) => void) {
    super();
    this.name = name;
    fn(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this._type)) {
      ctx.addDependency(this._type);
    } else if (isTsDsl(this._type)) {
      this._type.analyze(ctx);
    }
  }

  /** Sets the property type. */
  type(type: TypePropType): this {
    this._type = type;
    return this;
  }

  protected override _render() {
    if (!this._type) {
      throw new Error(`Type not specified for property '${this.name}'`);
    }
    return ts.factory.createPropertySignature(
      this.modifiers,
      this.$node(safePropName(this.name)),
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$type(this._type),
    );
  }
}
