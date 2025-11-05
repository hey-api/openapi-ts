/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { ExprInput, TypeInput } from './base';
import { TsDsl } from './base';
import { LiteralTsDsl } from './literal';
import { mixin } from './mixins/apply';
import { GenericsMixin } from './mixins/generics';
import { OptionalMixin } from './mixins/optional';

export abstract class BaseTypeTsDsl<
  T extends ts.TypeNode | ts.TypeParameterDeclaration,
> extends TsDsl<T> {
  protected base?: ts.EntityName;
  protected constraint?: TypeInput;
  protected defaultValue?: TypeInput;

  constructor(base?: ExprInput<ts.Identifier>) {
    super();
    if (base) this.base = this.$expr(base);
  }

  default(value: TypeInput): this {
    this.defaultValue = value;
    return this;
  }

  extends(constraint: TypeInput): this {
    this.constraint = constraint;
    return this;
  }
}

export class TypeReferenceTsDsl extends BaseTypeTsDsl<ts.TypeNode> {
  private objectBuilder?: TypeObjectTsDsl;

  constructor(
    name?: ExprInput<ts.Identifier>,
    fn?: (base: TypeReferenceTsDsl) => void,
  ) {
    super(name);
    if (fn) fn(this);
  }

  /** Starts an object type literal (e.g. `{ foo: string }`). */
  object(fn: (o: TypeObjectTsDsl) => void): this {
    this.objectBuilder = new TypeObjectTsDsl(fn);
    return this;
  }

  $render(): ts.TypeNode {
    if (this.objectBuilder) {
      return ts.factory.createTypeLiteralNode(this.objectBuilder.$render());
    }
    if (!this.base) throw new Error('Missing base type');
    const builtTypes = this._generics?.map((arg) => this.$type(arg));
    return ts.factory.createTypeReferenceNode(
      this.base,
      // @ts-expect-error --- generics are not officially supported on type references yet
      builtTypes,
    );
  }
}
export interface TypeReferenceTsDsl extends GenericsMixin {}
mixin(TypeReferenceTsDsl, GenericsMixin);

export class TypeParamTsDsl extends BaseTypeTsDsl<ts.TypeParameterDeclaration> {
  constructor(
    name?: ExprInput<ts.Identifier>,
    fn?: (base: TypeParamTsDsl) => void,
  ) {
    super(name);
    if (fn) fn(this);
  }

  $render(): ts.TypeParameterDeclaration {
    if (!this.base) throw new Error('Missing type name');
    return ts.factory.createTypeParameterDeclaration(
      undefined,
      this.base as ts.Identifier,
      this.$type(this.constraint),
      this.$type(this.defaultValue),
    );
  }
}
export interface TypeParamTsDsl extends GenericsMixin {}
mixin(TypeParamTsDsl, GenericsMixin);

export class TypeLiteralTsDsl extends TsDsl<ts.LiteralTypeNode> {
  private literal: LiteralTsDsl;

  constructor(value: string | number | boolean) {
    super();
    this.literal = new LiteralTsDsl(value);
  }

  $render(): ts.LiteralTypeNode {
    const expr = this.literal.$render();
    return ts.factory.createLiteralTypeNode(expr);
  }
}

export class TypeObjectTsDsl {
  private props: Array<TypePropTsDsl> = [];

  constructor(fn: (o: TypeObjectTsDsl) => void) {
    fn(this);
  }

  /** Adds a property signature (returns property builder). */
  prop(name: string, fn: (p: TypePropTsDsl) => void): this {
    const propTsDsl = new TypePropTsDsl(name, fn);
    this.props.push(propTsDsl);
    return this;
  }

  $render(): ReadonlyArray<ts.TypeElement> {
    return this.props.map((p) => p.$render());
  }
}

export class TypePropTsDsl {
  private name: string;
  private typeInput?: TypeInput;

  constructor(name: string, fn: (p: TypePropTsDsl) => void) {
    this.name = name;
    fn(this);
  }

  /** Sets the property type. */
  type(type: TypeInput): this {
    this.typeInput = type;
    return this;
  }

  /** Builds and returns the property signature. */
  $render(): ts.TypeElement {
    if (!this.typeInput) {
      throw new Error(`Type not specified for property '${this.name}'`);
    }
    const typeNode =
      typeof this.typeInput === 'string'
        ? ts.factory.createTypeReferenceNode(this.typeInput)
        : (this.typeInput as ts.TypeNode);
    return ts.factory.createPropertySignature(
      undefined,
      ts.factory.createIdentifier(this.name),
      this.questionToken,
      typeNode,
    );
  }
}

export interface TypePropTsDsl extends OptionalMixin {}
mixin(TypePropTsDsl, OptionalMixin);

export const TypeTsDsl = Object.assign(
  (...args: ConstructorParameters<typeof TypeReferenceTsDsl>) =>
    new TypeReferenceTsDsl(...args),
  {
    literal: (...args: ConstructorParameters<typeof TypeLiteralTsDsl>) =>
      new TypeLiteralTsDsl(...args),
    object: (...args: ConstructorParameters<typeof TypeObjectTsDsl>) =>
      new TypeObjectTsDsl(...args),
    param: (...args: ConstructorParameters<typeof TypeParamTsDsl>) =>
      new TypeParamTsDsl(...args),
    ref: (...args: ConstructorParameters<typeof TypeReferenceTsDsl>) =>
      new TypeReferenceTsDsl(...args),
  },
);
