import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ReadonlyMixin } from '../mixins/modifiers';

type Type = string | MaybeTsDsl<ts.TypeNode>;

const Mixed = DocMixin(ReadonlyMixin(TypeTsDsl<ts.IndexSignatureDeclaration>));

export class TypeIdxSigTsDsl extends Mixed {
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

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  /** Sets the property type. */
  type(type: Type): this {
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
