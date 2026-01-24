import type {
  AnalysisContext,
  NodeName,
  NodeScope,
  Ref,
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

export type TypePropType = NodeName | MaybeTsDsl<ts.TypeNode>;
export type TypePropKind = 'prop';

const Mixed = DocMixin(OptionalMixin(ReadonlyMixin(TsDsl<ts.TypeElement>)));

export class TypePropTsDsl extends Mixed {
  readonly '~dsl' = 'TypePropTsDsl';
  override scope: NodeScope = 'type';

  protected _type?: Ref<TypePropType>;

  constructor(name: NodeName, fn: (p: TypePropTsDsl) => void) {
    super();
    this.name.set(name);
    fn(this);
  }

  /** Element kind. */
  get kind(): TypePropKind {
    return 'prop';
  }

  /** Property name. */
  get propName(): string {
    return this.name.toString();
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

  override toAst() {
    const name = this.name.toString();
    if (!this._type || !name) {
      throw new Error(`Type not specified for property '${name}'`);
    }
    const node = ts.factory.createPropertySignature(
      this.modifiers,
      this.$node(safePropName(name)),
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$type(this._type),
    );
    return this.$docs(node);
  }
}
