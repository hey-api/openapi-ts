import type { AnalysisContext, NodeName, NodeScope, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';
import { DocMixin } from '../mixins/doc';
import { ReadonlyMixin } from '../mixins/modifiers';
import { OptionalMixin } from '../mixins/optional';
import { TokenTsDsl } from '../token';
import { safePropName } from '../utils/name';

export type TypePropType = NodeName | MaybeTsDsl<ts.TypeNode>;
export type TypePropKind = 'computed' | 'prop';

const Mixed = DocMixin(OptionalMixin(ReadonlyMixin(TsDsl<ts.TypeElement>)));

export class TypePropTsDsl extends Mixed {
  readonly '~dsl' = 'TypePropTsDsl';
  override scope: NodeScope = 'type';

  private _kind: TypePropKind;
  protected _type?: Ref<TypePropType>;

  constructor(name: NodeName, fn: (p: TypePropTsDsl) => void, kind: TypePropKind = 'prop') {
    super();
    this.name.set(name);
    this._kind = kind;
    fn(this);
  }

  /** Element kind. */
  get kind(): TypePropKind {
    return this._kind;
  }

  /** Property name. */
  get propName(): string {
    return this.name.toString();
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._type);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return !this.missingRequiredCalls().length;
  }

  /** Sets the property type. */
  type(type: TypePropType): this {
    this._type = ref(type);
    return this;
  }

  override toAst() {
    this.$validate();
    const name = this.name.toString();
    const node = ts.factory.createPropertySignature(
      this.modifiers,
      this._kind === 'computed'
        ? ts.factory.createComputedPropertyName(this.$node(new IdTsDsl(name)))
        : this.$node(safePropName(name)),
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$type(this._type),
    );
    return this.$docs(node);
  }

  $validate(): asserts this is this & {
    _type: Ref<TypePropType>;
  } {
    const missing = this.missingRequiredCalls();
    if (!missing.length) return;
    const name = this.name.toString();
    throw new Error(`Type property${name ? ` "${name}"` : ''} missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._type) missing.push('.\u200Btype()');
    return missing;
  }
}
