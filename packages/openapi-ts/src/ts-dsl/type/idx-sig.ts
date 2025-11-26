import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TypeTsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ReadonlyMixin } from '../mixins/modifiers';

export type TypeIdxSigName = string;
export type TypeIdxSigType = string | MaybeTsDsl<ts.TypeNode>;

const Mixed = DocMixin(ReadonlyMixin(TypeTsDsl<ts.IndexSignatureDeclaration>));

export class TypeIdxSigTsDsl extends Mixed {
  protected _key?: TypeIdxSigType;
  protected _name: TypeIdxSigName;
  protected _type?: TypeIdxSigType;

  constructor(name: TypeIdxSigName, fn?: (i: TypeIdxSigTsDsl) => void) {
    super();
    this._name = name;
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isTsDsl(this._key)) this._key.analyze(ctx);
    if (isTsDsl(this._type)) this._type.analyze(ctx);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  /** Sets the key type: `[name: T]` */
  key(type: TypeIdxSigType): this {
    this._key = type;
    return this;
  }

  /** Sets the property type. */
  type(type: TypeIdxSigType): this {
    this._type = type;
    return this;
  }

  protected override _render() {
    this.$validate();
    return ts.factory.createIndexSignature(
      this.modifiers,
      [
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          this._name,
          undefined,
          this.$type(this._key),
        ),
      ],
      this.$type(this._type),
    );
  }

  $validate(): asserts this is this & {
    _key: TypeIdxSigType;
    _name: TypeIdxSigName;
    _type: TypeIdxSigType;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(
      `Index signature${this._name ? ` "${this._name}"` : ''} missing ${missing.join(' and ')}`,
    );
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._key) missing.push('.key()');
    if (!this._name) missing.push('.name()');
    if (!this._type) missing.push('.\u200Btype()');
    return missing;
  }
}
