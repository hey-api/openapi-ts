import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
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

type FuncMode = 'arrow' | 'decl' | 'expr';

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
  protected name?: string;
  protected _returns?: TypeTsDsl;

  constructor();
  constructor(fn: (f: ImplFuncTsDsl<'arrow'>) => void);
  constructor(name: Symbol | string);
  constructor(name: Symbol | string, fn: (f: ImplFuncTsDsl<'decl'>) => void);
  constructor(
    nameOrFn?: Symbol | string | ((f: ImplFuncTsDsl<'arrow'>) => void),
    fn?: (f: ImplFuncTsDsl<'decl'>) => void,
  ) {
    super();
    if (typeof nameOrFn === 'function') {
      this.mode = 'arrow';
      nameOrFn(this as unknown as FuncTsDsl<'arrow'>);
    } else if (nameOrFn) {
      this.mode = 'decl';
      if (typeof nameOrFn === 'string') {
        this.name = nameOrFn;
      } else {
        this.name = nameOrFn.finalName;
        this.symbol = nameOrFn;
        this.symbol.setKind('function');
        this.symbol.setRootNode(this);
      }
      fn?.(this as unknown as FuncTsDsl<'decl'>);
    }
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

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
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
        this.name,
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
        this.name,
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
