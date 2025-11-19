/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { AsMixin } from '../mixins/as';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import {
  AbstractMixin,
  AsyncMixin,
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from '../mixins/modifiers';
import { ParamMixin } from '../mixins/param';
import { TypeParamsMixin } from '../mixins/type-params';
import { TypeExprTsDsl } from '../type/expr';

type FuncMode = 'arrow' | 'decl' | 'expr';

class ImplFuncTsDsl<M extends FuncMode = 'arrow'> extends TsDsl<
  M extends 'decl'
    ? ts.FunctionDeclaration
    : M extends 'expr'
      ? ts.FunctionExpression
      : ts.ArrowFunction
> {
  protected mode: FuncMode;
  protected modifiers = createModifierAccessor(this);
  protected name?: string;
  protected _returns?: TypeTsDsl;

  constructor();
  constructor(fn: (f: ImplFuncTsDsl<'arrow'>) => void);
  constructor(name: string);
  constructor(name: string, fn: (f: ImplFuncTsDsl<'decl'>) => void);
  constructor(
    nameOrFn?: string | ((f: ImplFuncTsDsl<'arrow'>) => void),
    fn?: (f: ImplFuncTsDsl<'decl'>) => void,
  ) {
    super();
    if (typeof nameOrFn === 'string') {
      this.name = nameOrFn;
      this.mode = 'decl';
      fn?.(this as unknown as FuncTsDsl<'decl'>);
    } else {
      this.mode = 'arrow';
      nameOrFn?.(this as unknown as FuncTsDsl<'arrow'>);
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

  $render(): M extends 'decl'
    ? ts.FunctionDeclaration
    : M extends 'expr'
      ? ts.FunctionExpression
      : ts.ArrowFunction {
    if (this.mode === 'decl') {
      if (!this.name) throw new Error('Function declaration requires a name');
      return ts.factory.createFunctionDeclaration(
        [...this.$decorators(), ...this.modifiers.list()],
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
        this.modifiers.list(),
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
      this.modifiers.list(),
      this.$generics(),
      this.$params(),
      this.$type(this._returns),
      undefined,
      exprBody,
    ) as any;
  }
}

interface ImplFuncTsDsl
  extends AbstractMixin,
    AsMixin,
    AsyncMixin,
    DecoratorMixin,
    DoMixin,
    DocMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    StaticMixin,
    TypeParamsMixin {}
mixin(
  ImplFuncTsDsl,
  AbstractMixin,
  AsMixin,
  AsyncMixin,
  DecoratorMixin,
  DoMixin,
  DocMixin,
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
  TypeParamsMixin,
);

export const FuncTsDsl = ImplFuncTsDsl as {
  new (): FuncTsDsl<'arrow'>;
  new (fn: (f: FuncTsDsl<'arrow'>) => void): FuncTsDsl<'arrow'>;
  new (name: string): FuncTsDsl<'decl'>;
  new (name: string, fn: (f: FuncTsDsl<'decl'>) => void): FuncTsDsl<'decl'>;
} & typeof ImplFuncTsDsl;
export type FuncTsDsl<M extends FuncMode = 'arrow'> = ImplFuncTsDsl<M>;
