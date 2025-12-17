import type { AnalysisContext, AstContext } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TsDsl } from '../base';
import { astContext } from './context';

export type LazyThunk<T extends ts.Node> = (ctx: AstContext) => TsDsl<T>;

export class LazyTsDsl<T extends ts.Node = ts.Node> extends TsDsl<T> {
  readonly '~dsl' = 'LazyTsDsl';

  private _thunk: LazyThunk<T>;

  constructor(thunk: LazyThunk<T>) {
    super();
    this._thunk = thunk;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._thunk(astContext));
  }

  override toAst(ctx: AstContext): T {
    return this._thunk(ctx).toAst(ctx);
  }
}
