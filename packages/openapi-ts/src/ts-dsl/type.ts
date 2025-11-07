/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { LiteralTsDsl } from './literal';
import { mixin } from './mixins/apply';
import { GenericsMixin } from './mixins/generics';
import { OptionalMixin } from './mixins/optional';

export type TypeInput = WithString<boolean | MaybeTsDsl<ts.TypeNode>>;

export abstract class BaseTypeTsDsl<
  T extends ts.TypeNode | ts.TypeParameterDeclaration,
> extends TsDsl<T> {
  protected base?: ts.EntityName;
  protected constraint?: TypeInput;
  protected defaultValue?: TypeInput;

  constructor(base?: WithString<ts.Identifier>) {
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

export class TypeLiteralTsDsl extends TsDsl<ts.LiteralTypeNode> {
  private literal: LiteralTsDsl;

  constructor(value: string | number | boolean) {
    super();
    this.literal = new LiteralTsDsl(value);
  }

  $render(): ts.LiteralTypeNode {
    const expr = this.$node(this.literal);
    return ts.factory.createLiteralTypeNode(expr);
  }
}

export class TypeObjectTsDsl extends TsDsl<ts.TypeLiteralNode> {
  private props: Array<TypePropTsDsl> = [];

  constructor(fn?: (o: TypeObjectTsDsl) => void) {
    super();
    fn?.(this);
  }

  /** Adds a property signature (returns property builder). */
  prop(name: string, fn: (p: TypePropTsDsl) => void): this {
    const propTsDsl = new TypePropTsDsl(name, fn);
    this.props.push(propTsDsl);
    return this;
  }

  $render(): ts.TypeLiteralNode {
    return ts.factory.createTypeLiteralNode(this.$node(this.props));
  }
}

export class TypeParamTsDsl extends BaseTypeTsDsl<ts.TypeParameterDeclaration> {
  constructor(
    name?: WithString<ts.Identifier>,
    fn?: (base: TypeParamTsDsl) => void,
  ) {
    super(name);
    fn?.(this);
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

export class TypePropTsDsl extends TsDsl<ts.TypeElement> {
  private name: string;
  private typeInput?: TypeInput;

  constructor(name: string, fn: (p: TypePropTsDsl) => void) {
    super();
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

export class TypeReferenceTsDsl extends BaseTypeTsDsl<ts.TypeNode> {
  private _object?: TypeObjectTsDsl;

  constructor(
    name?: WithString<ts.Identifier>,
    fn?: (base: TypeReferenceTsDsl) => void,
  ) {
    super(name);
    fn?.(this);
  }

  /** Starts an object type literal (e.g. `{ foo: string }`). */
  object(fn?: (o: TypeObjectTsDsl) => void): this {
    this._object = new TypeObjectTsDsl(fn);
    return this;
  }

  $render(): ts.TypeNode {
    if (this._object) return this.$node(this._object);
    if (!this.base) throw new Error('Missing base type');
    const types = this._generics?.map((arg) => this.$type(arg));
    return ts.factory.createTypeReferenceNode(
      this.base,
      // @ts-expect-error --- generics are not officially supported on type references yet
      types,
    );
  }
}

export interface TypeReferenceTsDsl extends GenericsMixin {}
mixin(TypeReferenceTsDsl, GenericsMixin);

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
