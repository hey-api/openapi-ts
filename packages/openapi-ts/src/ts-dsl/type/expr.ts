/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl, type WithString } from '../base';
import { mixin } from '../mixins/apply';
import { GenericsMixin } from '../mixins/generics';
import { TypeObjectTsDsl } from '../type';

export class TypeExprTsDsl extends TsDsl<ts.TypeNode> {
  private _exprInput: WithString<ts.Identifier>;
  private _object?: TypeObjectTsDsl;

  constructor(id: WithString<ts.Identifier>) {
    super();
    this._exprInput = id;
  }

  /** Starts an object type literal (e.g. `{ foo: string }`). */
  object(fn?: (o: TypeObjectTsDsl) => void): this {
    this._object = new TypeObjectTsDsl(fn);
    return this;
  }

  $render(): ts.TypeNode {
    if (this._object) return this.$node(this._object);
    const types = this._generics?.map((arg) => this.$type(arg));
    return ts.factory.createTypeReferenceNode(
      this.$expr(this._exprInput),
      // @ts-expect-error --- generics are not officially supported on type references yet
      types,
    );
  }
}

export interface TypeExprTsDsl extends GenericsMixin {}
mixin(TypeExprTsDsl, GenericsMixin);
