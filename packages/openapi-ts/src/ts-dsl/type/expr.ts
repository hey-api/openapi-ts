import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { isNode, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { TypeArgsMixin } from '../mixins/type-args';
import { setTypeExprFactory, TypeExprMixin } from '../mixins/type-expr';
import { TypeAttrTsDsl } from './attr';

export type TypeExprName = Symbol | string;
export type TypeExprExpr = TypeExprName | TypeAttrTsDsl;

const Mixed = TypeArgsMixin(TypeExprMixin(TypeTsDsl<ts.TypeReferenceNode>));

export class TypeExprTsDsl extends Mixed {
  readonly '~dsl' = 'TypeExprTsDsl';

  protected _exprInput?: Ref<TypeExprExpr>;

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
      this._exprInput = name ? ref(name) : undefined;
      fn?.(this);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._exprInput);
  }

  /** Accesses a nested type (e.g. `Foo.Bar`). */
  attr(right: string | ts.Identifier | TypeAttrTsDsl): this {
    this._exprInput = isNode(right)
      ? ref(right.base(this._exprInput))
      : ref(new TypeAttrTsDsl(this._exprInput!, right));
    return this;
  }

  override toAst(ctx: AstContext) {
    if (!this._exprInput) throw new Error('TypeExpr must have an expression');
    return ts.factory.createTypeReferenceNode(
      this.$type(ctx, this._exprInput) as ts.EntityName,
      this.$generics(ctx),
    );
  }
}

setTypeExprFactory(
  (...args) =>
    new TypeExprTsDsl(...(args as ConstructorParameters<typeof TypeExprTsDsl>)),
);
