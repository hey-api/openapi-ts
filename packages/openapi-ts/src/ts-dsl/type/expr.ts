/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import type ts from "typescript";

import type { MaybeTsDsl } from "../base";
import { TsDsl } from "../base";
import { mixin } from "../mixins/apply";
import { GenericsMixin } from "../mixins/generics";

export class TypeExprTsDsl extends TsDsl<ts.TypeNode> {
  private _exprInput: MaybeTsDsl<ts.TypeNode | string>;
  // private _object?: TypeObjectTsDsl;

  constructor(
    // name?: WithString<ts.Identifier>,
    expr: MaybeTsDsl<ts.TypeNode | string>,
    // fn?: (base: TypeExprTsDsl) => void,
  ) {
    super();
    this._exprInput = expr;
  }

  /** Starts an object type literal (e.g. `{ foo: string }`). */
  // object(fn?: (o: TypeObjectTsDsl) => void): this {
  //   this._object = new TypeObjectTsDsl(fn);
  //   return this;
  // }

  $render(): ts.TypeNode {
    console.log('hi')
    // if (this._object) return this.$node(this._object);
    // if (!this.base) throw new Error('Missing base type');
    return this.$type(this._exprInput);

    // return ts.factory.createTypeReferenceNode(
    //   this.base,
    //   // @ts-expect-error --- generics are not officially supported on type references yet
    //   this.$type(this._generics),
    // );
  }
}

export interface TypeExprTsDsl extends GenericsMixin {}
mixin(TypeExprTsDsl, GenericsMixin);
