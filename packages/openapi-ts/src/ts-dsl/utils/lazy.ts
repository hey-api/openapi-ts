import type { AnalysisContext } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TsDsl } from '../base';

export type LazyThunk<T extends ts.Node> = () => TsDsl<T>;

export class LazyTsDsl<T extends ts.Node = ts.Node> extends TsDsl<T> {
  readonly '~dsl' = 'LazyTsDsl';

  private _thunk: LazyThunk<T>;

  constructor(thunk: LazyThunk<T>) {
    super();
    this._thunk = thunk;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._thunk());
  }

  override toAst() {
    return this._thunk().toAst();
  }
}
