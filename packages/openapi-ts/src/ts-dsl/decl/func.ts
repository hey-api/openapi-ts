import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import {
  AbstractMixin,
  AsyncMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from '../mixins/modifiers';
import { ParamMixin } from '../mixins/param';
import { TypeParamsMixin } from '../mixins/type-params';
import { TypeExprTsDsl } from '../type/expr';

export type FuncMode = 'arrow' | 'decl' | 'expr';
export type FuncName = Symbol | string;

const Mixed = AbstractMixin(
  AsMixin(
    AsyncMixin(
      DecoratorMixin(
        DoMixin(
          DocMixin(
            ParamMixin(
              PrivateMixin(
                ProtectedMixin(
                  PublicMixin(
                    StaticMixin(TypeParamsMixin(TsDsl<ts.ArrowFunction>)),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);

class ImplFuncTsDsl<M extends FuncMode = 'arrow'> extends Mixed {
  protected mode?: FuncMode;
  protected name?: FuncName;
  protected _returns?: TypeTsDsl;

  constructor();
  constructor(fn: (f: ImplFuncTsDsl<'arrow'>) => void);
  constructor(name: FuncName);
  constructor(name: FuncName, fn: (f: ImplFuncTsDsl<'decl'>) => void);
  constructor(
    name?: FuncName | ((f: ImplFuncTsDsl<'arrow'>) => void),
    fn?: (f: ImplFuncTsDsl<'decl'>) => void,
  ) {
    super();
    if (typeof name === 'function') {
      this.mode = 'arrow';
      name(this as unknown as FuncTsDsl<'arrow'>);
    } else if (name) {
      this.mode = 'decl';
      this.name = name;
      if (isSymbol(name)) {
        name.setKind('function');
        name.setNode(this);
      }
      fn?.(this as unknown as FuncTsDsl<'decl'>);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this.name)) ctx.addDependency(this.name);
    this._returns?.analyze(ctx);
  }

  /** Switches the function to an arrow function form. */
  arrow(): FuncTsDsl<'arrow'> {
    this.mode = 'arrow';
    return this as unknown as FuncTsDsl<'arrow'>;
  }

  /** Switches the function to a function declaration form. */
  decl(): FuncTsDsl<'decl'> {
    this.mode = 'decl';
    return this as unknown as FuncTsDsl<'decl'>;
  }

  /** Switches the function to a function expression form. */
  expr(): FuncTsDsl<'expr'> {
    this.mode = 'expr';
    return this as unknown as FuncTsDsl<'expr'>;
  }

  /** Sets the return type. */
  returns(type: string | TypeTsDsl): this {
    this._returns = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  // @ts-expect-error --- need to fix types ---
  protected override _render(): M extends 'decl'
    ? ts.FunctionDeclaration
    : M extends 'expr'
      ? ts.FunctionExpression
      : ts.ArrowFunction {
    if (this.mode === 'decl') {
      if (!this.name) throw new Error('Function declaration requires a name');
      return ts.factory.createFunctionDeclaration(
        [...this.$decorators(), ...this.modifiers],
        undefined,
        // @ts-expect-error need to improve types
        this.$node(this.name),
        this.$generics(),
        this.$params(),
        this.$type(this._returns),
        ts.factory.createBlock(this.$do(), true),
      ) as any;
    }

    if (this.mode === 'expr') {
      return ts.factory.createFunctionExpression(
        this.modifiers,
        undefined,
        // @ts-expect-error need to improve types
        this.$node(this.name),
        this.$generics(),
        this.$params(),
        this.$type(this._returns),
        ts.factory.createBlock(this.$do(), true),
      ) as any;
    }

    const body = this.$do();
    const exprBody =
      body.length === 1 && ts.isReturnStatement(body[0]!)
        ? (body[0].expression ?? ts.factory.createBlock(body, true))
        : ts.factory.createBlock(body, true);

    return ts.factory.createArrowFunction(
      this.modifiers,
      this.$generics(),
      this.$params(),
      this.$type(this._returns),
      undefined,
      exprBody,
    ) as any;
  }
}

export const FuncTsDsl = ImplFuncTsDsl as {
  new (): FuncTsDsl<'arrow'>;
  new (fn: (f: FuncTsDsl<'arrow'>) => void): FuncTsDsl<'arrow'>;
  new (name: string): FuncTsDsl<'decl'>;
  new (name: string, fn: (f: FuncTsDsl<'decl'>) => void): FuncTsDsl<'decl'>;
} & typeof ImplFuncTsDsl;
export type FuncTsDsl<M extends FuncMode = 'arrow'> = ImplFuncTsDsl<M>;
