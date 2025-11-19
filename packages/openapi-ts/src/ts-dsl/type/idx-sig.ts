/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { DocMixin } from '../mixins/doc';
import { createModifierAccessor, ReadonlyMixin } from '../mixins/modifiers';

type Type = string | MaybeTsDsl<ts.TypeNode>;

export class TypeIdxSigTsDsl extends TypeTsDsl<ts.IndexSignatureDeclaration> {
  protected modifiers = createModifierAccessor(this);
  protected _key?: Type;
  protected _name: string;
  protected _type?: Type;

  constructor(name: string, fn?: (i: TypeIdxSigTsDsl) => void) {
    super();
    this._name = name;
    fn?.(this);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  /** Sets the key type: `[name: T]` */
  key(type: Type): this {
    this._key = type;
    return this;
  }

  /** Sets the property type. */
  type(type: Type): this {
    this._type = type;
    return this;
  }

  $render(): ts.IndexSignatureDeclaration {
    this.$validate();
    return ts.factory.createIndexSignature(
      this.modifiers.list(),
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
    _key: Type;
    _name: string;
    _type: Type;
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

export interface TypeIdxSigTsDsl extends DocMixin, ReadonlyMixin {}
mixin(TypeIdxSigTsDsl, DocMixin, ReadonlyMixin);
