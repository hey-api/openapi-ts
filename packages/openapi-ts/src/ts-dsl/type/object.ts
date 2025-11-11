/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { WithString } from '../base';
import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { OptionalMixin } from '../mixins/optional';

export class TypeObjectTsDsl extends TypeTsDsl<ts.TypeNode> {
  private props: Array<TypePropTsDsl> = [];
  private merges: Array<WithString<ts.Identifier>> = [];

  /** Adds a property signature (returns property builder). */
  prop(name: string, fn: (p: TypePropTsDsl) => void): this {
    const propTsDsl = new TypePropTsDsl(name, fn);
    this.props.push(propTsDsl);
    return this;
  }

  /** Adds a type to merge (intersect) with the object literal. */
  merge(type: WithString<ts.Identifier>): this {
    this.merges.push(type);
    return this;
  }

  $render(): ts.TypeNode {
    const literal = ts.factory.createTypeLiteralNode(this.$node(this.props));
    if (this.merges.length > 0) {
      return ts.factory.createIntersectionTypeNode([
        ...this.merges.map((m) => this.$type(m)),
        literal,
      ]);
    }
    return literal;
  }
}

class TypePropTsDsl extends TypeTsDsl<ts.TypeElement> {
  private name: string;
  private typeInput?: WithString<ts.TypeNode>;

  constructor(name: string, fn: (p: TypePropTsDsl) => void) {
    super();
    this.name = name;
    fn(this);
  }

  /** Sets the property type. */
  type(type: WithString<ts.TypeNode>): this {
    this.typeInput = type;
    return this;
  }

  /** Builds and returns the property signature. */
  $render(): ts.TypeElement {
    if (!this.typeInput) {
      throw new Error(`Type not specified for property '${this.name}'`);
    }
    return ts.factory.createPropertySignature(
      undefined,
      this.$expr(this.name),
      this.questionToken,
      this.$type(this.typeInput),
    );
  }
}

interface TypePropTsDsl extends OptionalMixin {}
mixin(TypePropTsDsl, OptionalMixin);
