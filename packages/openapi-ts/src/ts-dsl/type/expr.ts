import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { TypeArgsMixin } from '../mixins/type-args';
import {
  registerLazyAccessTypeExprFactory,
  TypeExprMixin,
} from '../mixins/type-expr';
import { TypeAttrTsDsl } from './attr';

const Mixed = TypeArgsMixin(TypeExprMixin(TypeTsDsl<ts.TypeReferenceNode>));

export class TypeExprTsDsl extends Mixed {
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
          this.getRootSymbol().addDependency(name);
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

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  protected override _render() {
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

registerLazyAccessTypeExprFactory(
  (...args) =>
    new TypeExprTsDsl(...(args as ConstructorParameters<typeof TypeExprTsDsl>)),
);
