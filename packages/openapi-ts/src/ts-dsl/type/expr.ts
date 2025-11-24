import type { SyntaxNode } from '@hey-api/codegen-core';
import { Symbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
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
    if (typeof name === 'function') {
      name(this);
    } else {
      this._exprInput = name;
      fn?.(this);
    }
  }

  /** Accesses a nested type (e.g. `Foo.Bar`). */
  attr(right: string | ts.Identifier | TypeAttrTsDsl): this {
    this._exprInput =
      right instanceof TypeAttrTsDsl
        ? right.base(this._exprInput)
        : new TypeAttrTsDsl(this._exprInput!, right);
    this._exprInput.setParent(this);
    return this;
  }

  override collectSymbols(out: Set<Symbol>): void {
    super.collectSymbols(out);
    if (this._exprInput && typeof this._exprInput !== 'string') {
      if (this._exprInput instanceof Symbol) {
        out.add(this._exprInput);
      } else {
        this._exprInput.collectSymbols(out);
      }
    }
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
    if (this._exprInput instanceof TsDsl) {
      this._exprInput.traverse(visitor);
    }
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
