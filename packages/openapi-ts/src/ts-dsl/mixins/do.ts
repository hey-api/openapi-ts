import type { AnalysisContext, Node } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { isTsDsl, type MaybeTsDsl } from '../base';
import { StmtTsDsl } from '../stmt/stmt';
import type { BaseCtor, MixinCtor } from './types';

export interface DoMethods extends Node {
  /** Renders the collected `.do()` calls into an array of `Statement` nodes. */
  $do(): ReadonlyArray<ts.Statement>;
  /** Adds one or more expressions/statements to the body. */
  do(...items: ReadonlyArray<MaybeTsDsl<ts.Expression | ts.Statement>>): this;
}

/**
 * Adds `.do()` for appending statements or expressions to a body.
 */
export function DoMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Do extends Base {
    protected _do: Array<MaybeTsDsl<ts.Expression | ts.Statement>> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      for (const item of this._do) {
        if (isTsDsl(item)) item.analyze(ctx);
      }
    }

    protected do(
      ...items: ReadonlyArray<MaybeTsDsl<ts.Expression | ts.Statement>>
    ): this {
      this._do.push(...items);
      return this;
    }

    protected $do(): ReadonlyArray<ts.Statement> {
      return this.$node(this._do.map((item) => new StmtTsDsl(item)));
    }
  }

  return Do as unknown as MixinCtor<TBase, DoMethods>;
}
