import type { AnalysisContext, Node } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { StmtPyDsl } from '../stmt/stmt';
import type { BaseCtor, MixinCtor } from './types';

export type DoExpr = MaybePyDsl<py.Expression | py.Statement>;

export interface DoMethods extends Node {
  /** Renders the collected `.do()` calls into an array of `py.Statement` nodes. */
  $do(): ReadonlyArray<py.Statement>;
  _do: Array<DoExpr>;
  /** Adds one or more expressions/statements to the body. */
  do(...items: ReadonlyArray<DoExpr>): this;
}

export function DoMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Do extends Base {
    protected _do: Array<DoExpr> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      ctx.pushScope();
      try {
        for (const item of this._do) {
          ctx.analyze(item);
        }
      } finally {
        ctx.popScope();
      }
    }

    protected do(...items: ReadonlyArray<DoExpr>): this {
      this._do.push(...items);
      return this;
    }

    protected $do(): ReadonlyArray<py.Statement> {
      return this.$node(this._do.map((item) => new StmtPyDsl(item)));
    }
  }

  return Do as unknown as MixinCtor<TBase, DoMethods>;
}
