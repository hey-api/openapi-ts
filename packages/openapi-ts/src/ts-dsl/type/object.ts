/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { OptionalMixin } from '../mixins/optional';

export class TypeObjectTsDsl extends TypeTsDsl<ts.TypeNode> {
  private props: Array<TypePropTsDsl> = [];

  /** Adds a property signature (returns property builder). */
  prop(name: string, fn: (p: TypePropTsDsl) => void): this {
    const propTsDsl = new TypePropTsDsl(name, fn);
    this.props.push(propTsDsl);
    return this;
  }

  $render(): ts.TypeNode {
    return ts.factory.createTypeLiteralNode(this.$node(this.props));
  }
}

class TypePropTsDsl extends TypeTsDsl<ts.TypeElement> {
  private name: string;
  private typeInput?: string | ts.TypeNode;

  constructor(name: string, fn: (p: TypePropTsDsl) => void) {
    super();
    this.name = name;
    fn(this);
  }

  /** Sets the property type. */
  type(type: string | ts.TypeNode): this {
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
      this.name,
      this.questionToken,
      this.$type(this.typeInput),
    );
  }
}

interface TypePropTsDsl extends OptionalMixin {}
mixin(TypePropTsDsl, OptionalMixin);
