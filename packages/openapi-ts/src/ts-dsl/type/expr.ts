/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { WithString } from '../base';
import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { TypeArgsMixin } from '../mixins/type-args';
import { TypeAttrTsDsl } from './attr';
import { TypeIdxTsDsl } from './idx';

export class TypeExprTsDsl extends TypeTsDsl<ts.TypeReferenceNode> {
  private _exprInput?: WithString<ts.Identifier> | TypeAttrTsDsl;

  constructor();
  constructor(fn: (t: TypeExprTsDsl) => void);
  constructor(name: string);
  constructor(name: string, fn?: (t: TypeExprTsDsl) => void);
  constructor(
    nameOrFn?: string | ((t: TypeExprTsDsl) => void),
    fn?: (t: TypeExprTsDsl) => void,
  ) {
    super();
    if (typeof nameOrFn === 'string') {
      this._exprInput = nameOrFn;
      fn?.(this);
    } else {
      nameOrFn?.(this);
    }
  }

  /** Accesses a nested type (e.g. `Foo.Bar`). */
  attr(right: WithString<ts.Identifier> | TypeAttrTsDsl): this {
    this._exprInput =
      right instanceof TypeAttrTsDsl
        ? right.base(this._exprInput)
        : new TypeAttrTsDsl(this._exprInput!, right);
    return this;
  }

  /** Creates an indexed-access type (e.g. `Foo<T>[K]`). */
  idx(index: WithString<ts.TypeNode> | number): TypeIdxTsDsl {
    return new TypeIdxTsDsl(this, index);
  }

  $render(): ts.TypeReferenceNode {
    if (!this._exprInput)
      throw new Error('TypeExpr must have either an expression or an object');
    return ts.factory.createTypeReferenceNode(
      // @ts-expect-error --- need to fix types
      this.$type(this._exprInput),
      this.$generics(),
    );
  }
}

export interface TypeExprTsDsl extends TypeArgsMixin {}
mixin(TypeExprTsDsl, TypeArgsMixin);
