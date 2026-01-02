import type { AnalysisContext } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TsDsl } from '../base';
import { TsDslContext } from './context';

export type LazyThunk<T extends ts.Node> = (ctx: TsDslContext) => TsDsl<T>;

export class LazyTsDsl<T extends ts.Node = ts.Node> extends TsDsl<T> {
  readonly '~dsl' = 'LazyTsDsl';

  private _thunk: LazyThunk<T>;

  constructor(thunk: LazyThunk<T>) {
    super();
    this._thunk = thunk;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.toResult());
  }

  toResult(): TsDsl<T> {
    return this._thunk(new TsDslContext());
  }

  override toAst(): T {
    return this.toResult().toAst();
  }
}
