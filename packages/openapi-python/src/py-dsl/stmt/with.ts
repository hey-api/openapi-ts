import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import type { DoExpr } from '../mixins/do';
import { BlockPyDsl } from './block';

const Mixed = PyDsl<py.WithStatement>;

export type WithItemInput =
  | MaybePyDsl<py.Expression>
  | { alias?: MaybePyDsl<py.Expression>; context: MaybePyDsl<py.Expression> };

export class WithPyDsl extends Mixed {
  readonly '~dsl' = 'WithPyDsl';

  protected _body?: Array<DoExpr>;
  protected _items: Array<WithItemInput> = [];
  protected _modifier?: MaybePyDsl<py.Expression>;

  constructor(...items: Array<WithItemInput>) {
    super();
    this._items = items;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);

    for (const item of this._items) {
      if (typeof item === 'object' && 'context' in item) {
        ctx.analyze(item.context);
        ctx.analyze(item.alias);
      } else {
        ctx.analyze(item);
      }
    }
    if (this._modifier) ctx.analyze(this._modifier);

    if (this._body) {
      ctx.pushScope();
      try {
        for (const stmt of this._body) ctx.analyze(stmt);
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

  item(item: WithItemInput): this {
    this._items.push(item);
    return this;
  }

  modifier(expr: MaybePyDsl<py.Expression>): this {
    this._modifier = expr;
    return this;
  }

  async(): this {
    this._modifier = py.factory.createIdentifier('async');
    return this;
  }

  override toAst(): py.WithStatement {
    this.$validate();

    const astItems = this._items.map((item) => {
      if (typeof item === 'object' && 'context' in item) {
        return py.factory.createWithItem(this.$node(item.context), this.$node(item.alias));
      }
      return py.factory.createWithItem(this.$node(item), undefined);
    });

    const body = new BlockPyDsl(...this._body!).$do();

    return py.factory.createWithStatement(
      astItems,
      [...body],
      this._modifier ? [this.$node(this._modifier)] : undefined,
    );
  }

  $validate(): asserts this is this & {
    _body: Array<DoExpr>;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`With statement missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._items.length) missing.push('items');
    if (!this._body || this._body.length === 0) missing.push('.body()');
    return missing;
  }
}
