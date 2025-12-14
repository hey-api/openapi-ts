import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ReadonlyMixin } from '../mixins/modifiers';
import { OptionalMixin } from '../mixins/optional';
import { TokenTsDsl } from '../token';
import { safePropName } from '../utils/name';

export type TypePropName = string;
export type TypePropType = Symbol | string | MaybeTsDsl<ts.TypeNode>;

const Mixed = DocMixin(OptionalMixin(ReadonlyMixin(TsDsl<ts.TypeElement>)));

export class TypePropTsDsl extends Mixed {
  readonly '~dsl' = 'TypePropTsDsl';

  protected name: TypePropName;
  protected _type?: Ref<TypePropType>;

  constructor(name: TypePropName, fn: (p: TypePropTsDsl) => void) {
    super();
    this.name = name;
    fn(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._type);
  }

  /** Sets the property type. */
  type(type: TypePropType): this {
    this._type = ref(type);
    return this;
  }

  override toAst(ctx: AstContext) {
    if (!this._type) {
      throw new Error(`Type not specified for property '${this.name}'`);
    }
    const node = ts.factory.createPropertySignature(
      this.modifiers,
      this.$node(ctx, safePropName(this.name)),
      this._optional ? this.$node(ctx, new TokenTsDsl().optional()) : undefined,
      this.$type(ctx, this._type),
    );
    return this.$docs(ctx, node);
  }
}
