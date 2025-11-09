import ts from "typescript";

import type { MaybeTsDsl, WithString } from "../base";
import { TsDsl } from "../base";

export class TypeAttrTsDsl extends TsDsl<ts.EntityName> {
  private left: MaybeTsDsl<ts.EntityName>;
  private right: WithString<ts.Identifier>;

  constructor(left: MaybeTsDsl<ts.EntityName>, right: WithString<ts.Identifier>) {
    super();
    this.left = this.$expr(left);
    this.right = this.$expr(right);
  }

  $render(): ts.EntityName {
    return ts.factory.createQualifiedName(this.$node(this.left), this.right);
  }
}
