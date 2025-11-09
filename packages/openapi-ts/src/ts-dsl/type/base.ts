import type ts from "typescript";

import type { MaybeTsDsl, WithString } from "../base";
import { TsDsl } from "../base";
import type { TypeAttrTsDsl } from "./attr";

export type TypeInput = string | boolean | MaybeTsDsl<ts.TypeNode | ts.TypeParameterDeclaration>;

export abstract class BaseTypeTsDsl<
  T extends ts.TypeNode | ts.TypeParameterDeclaration = ts.TypeNode,
> extends TsDsl<T> {
  protected base?: WithString<ts.EntityName> | TypeAttrTsDsl;
  protected constraint?: TypeInput;
  protected defaultValue?: TypeInput;

  constructor(base?: WithString<ts.Identifier>) {
    super();
    this.base = this.$expr(base);
  }

  /** Access a type-level property (qualified name). */
  // attr(name: WithString<ts.Identifier>): this {
  //   if (!this.base) throw new Error('Cannot access property on undefined base');
  //   // this.base = new TypeAttrTsDsl(this.base, name);
  //   return this;
  // }

  /** Sets a default type for this type parameter (e.g., `T = Foo`). */
  default(value: TypeInput): this {
    this.defaultValue = value;
    return this;
  }

  /** Sets a constraint type for this type parameter (e.g., `T extends Foo`). */
  extends(constraint: TypeInput): this {
    this.constraint = constraint;
    return this;
  }
}
