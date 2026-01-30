import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import type { DoExpr } from '../mixins/do';
import { DoMixin } from '../mixins/do';
import { BlockPyDsl } from './block';

export type IfCondition = string | MaybePyDsl<py.Expression>;

const Mixed = DoMixin(PyDsl<py.IfStatement>);

export class IfPyDsl extends Mixed {
  readonly '~dsl' = 'IfPyDsl';

  protected _condition?: IfCondition;
  protected _else?: Array<DoExpr>;

  constructor(condition?: IfCondition) {
    super();
    if (condition) this.condition(condition);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._condition);
    if (this._else) {
      ctx.pushScope();
      try {
        for (const stmt of this._else) {
          ctx.analyze(stmt);
        }
      } finally {
        ctx.popScope();
      }
    }
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  condition(condition: IfCondition): this {
    this._condition = condition;
    return this;
  }

  otherwise(...items: Array<DoExpr>): this {
    this._else = items;
    return this;
  }

  override toAst() {
    this.$validate();

    const thenStatements = this.$do();
    const elseStatements = this._else ? new BlockPyDsl(...this._else).$do() : undefined;

    return py.factory.createIfStatement(
      this.$node(this._condition!),
      [...thenStatements],
      elseStatements ? [...elseStatements] : undefined,
    );
  }

  $validate(): asserts this is this & {
    _condition: IfCondition;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`If statement missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._condition) missing.push('.condition()');
    if (this._do.length === 0) missing.push('.do()');
    return missing;
  }
}
