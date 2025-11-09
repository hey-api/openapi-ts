import ts from "typescript";

import { TsDsl } from "../base";
import { LiteralTsDsl } from "../literal";

export class TypeLiteralTsDsl extends TsDsl<ts.LiteralTypeNode> {
  private value: string | number | boolean;

  constructor(value: string | number | boolean) {
    super();
    this.value = value;
  }

  $render(): ts.LiteralTypeNode {
    const literal = new LiteralTsDsl(this.value);
    return ts.factory.createLiteralTypeNode(this.$node(literal));
  }
}
