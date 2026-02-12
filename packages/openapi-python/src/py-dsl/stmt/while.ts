import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import type { DoExpr } from '../mixins/do';
import { BlockPyDsl } from './block';

const Mixed = PyDsl<py.WhileStatement>;

export class WhilePyDsl extends Mixed {
  readonly '~dsl' = 'WhilePyDsl';

  protected _body?: Array<DoExpr>;
  protected _condition?: MaybePyDsl<py.Expression>;
  protected _else?: Array<DoExpr>;

  constructor(condition: MaybePyDsl<py.Expression>, ...body: Array<DoExpr>) {
    super();
    this._condition = condition;
    this._body = body;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);

    if (this._condition) ctx.analyze(this._condition);

    if (this._body) {
      ctx.pushScope();
      try {
        for (const stmt of this._body) ctx.analyze(stmt);
      } finally {
        ctx.popScope();
      }
    }

    if (this._else) {
      ctx.pushScope();
      try {
        for (const stmt of this._else) ctx.analyze(stmt);
      } finally {
        ctx.popScope();
      }
    }
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  body(...items: Array<DoExpr>): this {
    this._body = items;
    return this;
  }

  else(...items: Array<DoExpr>): this {
    this._else = items;
    return this;
  }

  override toAst(): py.WhileStatement {
    this.$validate();

    const body = new BlockPyDsl(...this._body!).$do();
    const elseBlock = this._else ? new BlockPyDsl(...this._else).$do() : undefined;

    return py.factory.createWhileStatement(
      this.$node(this._condition!) as py.Expression,
      [...body],
      elseBlock ? [...elseBlock] : undefined,
    );
  }

  $validate(): asserts this is this & {
    _body: Array<DoExpr>;
    _condition: MaybePyDsl<py.Expression>;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`While statement missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._condition) missing.push('condition');
    if (!this._body || this._body.length === 0) missing.push('body');
    return missing;
  }
}
