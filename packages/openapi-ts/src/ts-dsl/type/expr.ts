/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { TypeArgsMixin } from '../mixins/type-args';
import {
  registerLazyAccessTypeExprFactory,
  TypeExprMixin,
} from '../mixins/type-expr';
import { TypeAttrTsDsl } from './attr';

export class TypeExprTsDsl extends TypeTsDsl<ts.TypeReferenceNode> {
  protected _exprInput?: Symbol | string | TypeAttrTsDsl;

  constructor();
  constructor(fn: (t: TypeExprTsDsl) => void);
  constructor(name: Symbol | string);
  constructor(name: Symbol | string, fn?: (t: TypeExprTsDsl) => void);
  constructor(
    name?: Symbol | string | ((t: TypeExprTsDsl) => void),
    fn?: (t: TypeExprTsDsl) => void,
  ) {
    super();
    if (name) {
      if (typeof name === 'function') {
        name(this);
      } else {
        this._exprInput = name;
        if (typeof name !== 'string') {
          const symbol = this.getRootSymbol();
          if (symbol) symbol.addDependency(name);
        }
        fn?.(this);
      }
    }
  }

  /** Accesses a nested type (e.g. `Foo.Bar`). */
  attr(right: string | ts.Identifier | TypeAttrTsDsl): this {
    this._exprInput =
      right instanceof TypeAttrTsDsl
        ? right.base(this._exprInput)
        : new TypeAttrTsDsl(this._exprInput!, right);
    this._exprInput = this._exprInput.setParent(this);
    return this;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.TypeReferenceNode {
    if (!this._exprInput) throw new Error('TypeExpr must have an expression');
    const typeName =
      typeof this._exprInput === 'string' ||
      this._exprInput instanceof TypeAttrTsDsl
        ? this.$type(this._exprInput)
        : this._exprInput.finalName;
    return ts.factory.createTypeReferenceNode(
      // @ts-expect-error --- need to fix types
      typeName,
      this.$generics(),
    );
  }
}

export interface TypeExprTsDsl extends TypeArgsMixin, TypeExprMixin {}
mixin(TypeExprTsDsl, TypeArgsMixin, TypeExprMixin);

registerLazyAccessTypeExprFactory(
  (...args) =>
    new TypeExprTsDsl(...(args as ConstructorParameters<typeof TypeExprTsDsl>)),
);
