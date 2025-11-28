import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { isTsDsl, TypeTsDsl } from '../base';
import { TypeArgsMixin } from '../mixins/type-args';
import {
  registerLazyAccessTypeExprFactory,
  TypeExprMixin,
} from '../mixins/type-expr';
import { TypeAttrTsDsl } from './attr';

export type TypeExprName = Symbol | string;
export type TypeExprExpr = TypeExprName | TypeAttrTsDsl;

const Mixed = TypeArgsMixin(TypeExprMixin(TypeTsDsl<ts.TypeReferenceNode>));

export class TypeExprTsDsl extends Mixed {
  protected _exprInput?: TypeExprExpr;

  constructor();
  constructor(fn: (t: TypeExprTsDsl) => void);
  constructor(name: TypeExprName);
  constructor(name: TypeExprName, fn?: (t: TypeExprTsDsl) => void);
  constructor(
    name?: TypeExprName | ((t: TypeExprTsDsl) => void),
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

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this._exprInput)) {
      ctx.addDependency(this._exprInput);
    } else if (isTsDsl(this._exprInput)) {
      this._exprInput.analyze(ctx);
    }
  }

  /** Accesses a nested type (e.g. `Foo.Bar`). */
  attr(right: string | ts.Identifier | TypeAttrTsDsl): this {
    this._exprInput = isTsDsl(right)
      ? right.base(this._exprInput)
      : new TypeAttrTsDsl(this._exprInput!, right);
    return this;
  }

  protected override _render() {
    if (!this._exprInput) throw new Error('TypeExpr must have an expression');
    return ts.factory.createTypeReferenceNode(
      // @ts-expect-error --- need to fix types
      this.$type(this._exprInput),
      this.$generics(),
    );
  }
}

registerLazyAccessTypeExprFactory(
  (...args) =>
    new TypeExprTsDsl(...(args as ConstructorParameters<typeof TypeExprTsDsl>)),
);
