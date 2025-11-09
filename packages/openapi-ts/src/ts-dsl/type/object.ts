import ts from "typescript";

import { TsDsl } from "../base";
import { TypePropTsDsl } from "./prop";

export class TypeObjectTsDsl extends TsDsl<ts.TypeLiteralNode> {
  private props: Array<TypePropTsDsl> = [];

  /** Adds a property signature. */
  prop(name: string, fn: (p: TypePropTsDsl) => void): this {
    const propTsDsl = new TypePropTsDsl(name, fn);
    this.props.push(propTsDsl);
    return this;
  }

  $render(): ts.TypeLiteralNode {
    return ts.factory.createTypeLiteralNode(this.$node(this.props));
  }
}
