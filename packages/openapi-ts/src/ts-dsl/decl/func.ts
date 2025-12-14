import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { isSymbol, ref } from '@hey-api/codegen-core';
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
import { BlockTsDsl } from '../stmt/block';
import { TypeExprTsDsl } from '../type/expr';
import { safeRuntimeName } from '../utils/name';

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
  readonly '~dsl' = 'FuncTsDsl';

  protected mode?: FuncMode;
  protected name?: Ref<FuncName>;
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
      this.name = ref(name);
      if (isSymbol(name)) {
        name.setKind('function');
        name.setNameSanitizer(safeRuntimeName);
        name.setNode(this);
      }
      fn?.(this as unknown as FuncTsDsl<'decl'>);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    ctx.pushScope();
    try {
      super.analyze(ctx);
      ctx.analyze(this.name);
      ctx.analyze(this._returns);
    } finally {
      ctx.popScope();
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

  // @ts-expect-error --- need to fix types ---
  override toAst(
    ctx: AstContext,
  ): M extends 'decl'
    ? ts.FunctionDeclaration
    : M extends 'expr'
      ? ts.FunctionExpression
      : ts.ArrowFunction {
    const body = this.$node(ctx, new BlockTsDsl(...this._do).pretty());

    if (this.mode === 'decl') {
      if (!this.name) throw new Error('Function declaration requires a name');
      const node = ts.factory.createFunctionDeclaration(
        [...this.$decorators(ctx), ...this.modifiers],
        undefined,
        this.$node(ctx, this.name) as ts.Identifier,
        this.$generics(ctx),
        this.$params(ctx),
        this.$type(ctx, this._returns),
        body,
      ) as any;
      return this.$docs(ctx, node);
    }

    if (this.mode === 'expr') {
      const node = ts.factory.createFunctionExpression(
        this.modifiers,
        undefined,
        this.$node(ctx, this.name) as ts.Identifier,
        this.$generics(ctx),
        this.$params(ctx),
        this.$type(ctx, this._returns),
        body,
      ) as any;
      return this.$docs(ctx, node);
    }

    const node = ts.factory.createArrowFunction(
      this.modifiers,
      this.$generics(ctx),
      this.$params(ctx),
      this.$type(ctx, this._returns),
      undefined,
      body.statements.length === 1 &&
        ts.isReturnStatement(body.statements[0]!) &&
        body.statements[0].expression
        ? body.statements[0].expression
        : body,
    ) as any;
    return this.$docs(ctx, node);
  }
}

export const FuncTsDsl = ImplFuncTsDsl as {
  new (): FuncTsDsl<'arrow'>;
  new (fn: (f: FuncTsDsl<'arrow'>) => void): FuncTsDsl<'arrow'>;
  new (name: string): FuncTsDsl<'decl'>;
  new (name: string, fn: (f: FuncTsDsl<'decl'>) => void): FuncTsDsl<'decl'>;
} & typeof ImplFuncTsDsl;
export type FuncTsDsl<M extends FuncMode = 'arrow'> = ImplFuncTsDsl<M>;
