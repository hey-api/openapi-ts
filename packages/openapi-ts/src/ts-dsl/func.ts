/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
import { DoMixin } from './mixins/do';
import { GenericsMixin } from './mixins/generics';
import {
  AbstractMixin,
  AsyncMixin,
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from './mixins/modifiers';
import { OptionalMixin } from './mixins/optional';
import { ParamMixin } from './mixins/param';
import { createTypeAccessor, type TypeAccessor } from './mixins/type';

type FuncMode = 'arrow' | 'decl' | 'expr';

class ImplFuncTsDsl<M extends FuncMode = 'arrow'> extends TsDsl<
  M extends 'decl'
    ? ts.FunctionDeclaration
    : M extends 'expr'
      ? ts.FunctionExpression
      : ts.ArrowFunction
> {
  private mode: FuncMode;
  private modifiers = createModifierAccessor(this);
  private name?: string;
  private _returns: TypeAccessor<ImplFuncTsDsl<M>> = createTypeAccessor(this);

  /** Sets the return type. */
  returns: TypeAccessor<ImplFuncTsDsl<M>>['fn'] = this._returns.fn;

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

  arrow(): FuncTsDsl<'arrow'> {
    this.mode = 'arrow';
    return this as unknown as FuncTsDsl<'arrow'>;
  }

  decl(): FuncTsDsl<'decl'> {
    this.mode = 'decl';
    return this as unknown as FuncTsDsl<'decl'>;
  }

  expr(): FuncTsDsl<'expr'> {
    this.mode = 'expr';
    return this as unknown as FuncTsDsl<'expr'>;
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
        this._returns.$render(),
        ts.factory.createBlock(this.$do(), true),
      ) as any;
    }

    if (this.mode === 'expr') {
      return ts.factory.createFunctionExpression(
        [...this.modifiers.list()],
        undefined,
        this.name ? ts.factory.createIdentifier(this.name) : undefined,
        this.$generics(),
        this.$params(),
        this._returns.$render(),
        ts.factory.createBlock(this.$do(), true),
      ) as any;
    }

    const body = this.$do();
    const exprBody =
      body.length === 1 && ts.isReturnStatement(body[0]!)
        ? (body[0].expression ?? ts.factory.createBlock(body, true))
        : ts.factory.createBlock(body, true);

    return ts.factory.createArrowFunction(
      [...this.modifiers.list()],
      this.$generics(),
      this.$params(),
      this._returns.$render(),
      undefined,
      exprBody,
    ) as any;
  }
}

interface ImplFuncTsDsl
  extends AbstractMixin,
    AsyncMixin,
    DecoratorMixin,
    DescribeMixin,
    DoMixin,
    GenericsMixin,
    OptionalMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    StaticMixin {}
mixin(
  ImplFuncTsDsl,
  AbstractMixin,
  AsyncMixin,
  DecoratorMixin,
  [DescribeMixin, { overrideRender: true }],
  DoMixin,
  GenericsMixin,
  OptionalMixin,
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
);

export const FuncTsDsl = ImplFuncTsDsl as {
  new (): FuncTsDsl<'arrow'>;
  new (fn: (f: FuncTsDsl<'arrow'>) => void): FuncTsDsl<'arrow'>;
  new (name: string): FuncTsDsl<'decl'>;
  new (name: string, fn: (f: FuncTsDsl<'decl'>) => void): FuncTsDsl<'decl'>;
} & typeof ImplFuncTsDsl;
export type FuncTsDsl<M extends FuncMode = 'arrow'> = ImplFuncTsDsl<M>;
