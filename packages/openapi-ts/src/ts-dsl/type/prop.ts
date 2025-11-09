/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from "typescript";

import { TsDsl } from "../base";
import { mixin } from "../mixins/apply";
import { OptionalMixin } from "../mixins/optional";
import type { TypeInput } from "./base";

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
