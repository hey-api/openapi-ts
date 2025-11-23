import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { TokenTsDsl } from '../token';

const Mixed = TypeTsDsl<ts.MappedTypeNode>;

export class TypeMappedTsDsl extends Mixed {
  protected questionToken?: TokenTsDsl<
    | ts.SyntaxKind.QuestionToken
    | ts.SyntaxKind.PlusToken
    | ts.SyntaxKind.MinusToken
  >;
  protected readonlyToken?: TokenTsDsl<
    | ts.SyntaxKind.ReadonlyKeyword
    | ts.SyntaxKind.MinusToken
    | ts.SyntaxKind.PlusToken
  >;
  protected _key?: string | MaybeTsDsl<ts.TypeNode>;
  protected _name?: string;
  protected _type?: string | MaybeTsDsl<ts.TypeNode>;

  constructor(name?: string) {
    super();
    this.name(name);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  /** Sets the key constraint: `[K in Constraint]` */
  key(type: string | MaybeTsDsl<ts.TypeNode>): this {
    this._key = type;
    return this;
  }

  /** Removes `readonly` from the mapped members (`[K in X]-readonly`). */
  mutable(): this {
    this.readonlyToken = new TokenTsDsl().minus();
    return this;
  }

  /** Sets the parameter name: `{ [Name in keyof T]: U }` */
  name(name?: string): this {
    this._name = name;
    return this;
  }

  /** Makes `[K in X]?:` optional. */
  optional(): this {
    this.questionToken = new TokenTsDsl().optional();
    return this;
  }

  /** Makes `[K in X]` readonly */
  readonly(): this {
    this.readonlyToken = new TokenTsDsl().readonly();
    return this;
  }

  /** Removes `?` from the mapped members (`[K in X]-?:`). */
  required(): this {
    this.questionToken = new TokenTsDsl().minus();
    return this;
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Sets the mapped value type: `[K in X]: ValueType` */
  type(type: string | MaybeTsDsl<ts.TypeNode>): this {
    this._type = type;
    return this;
  }

  protected override _render() {
    this.$validate();
    return ts.factory.createMappedTypeNode(
      this.$node(this.readonlyToken),
      ts.factory.createTypeParameterDeclaration(
        undefined,
        this._name,
        this.$type(this._key),
        undefined,
      ),
      undefined,
      this.$node(this.questionToken),
      this.$type(this._type),
      undefined,
    );
  }

  $validate(): asserts this is this & {
    _key: string | MaybeTsDsl<ts.TypeNode>;
    _name: string;
    _type: string | MaybeTsDsl<ts.TypeNode>;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(
      `Mapped type${this._name ? ` "${this._name}"` : ''} missing ${missing.join(' and ')}`,
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
