import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { LayoutMixin } from '../mixins/layout';

const Mixed = LayoutMixin(PyDsl<py.DictExpression>);

export class DictPyDsl extends Mixed {
  readonly '~dsl' = 'DictPyDsl';

  protected _entries: Array<{
    key: MaybePyDsl<py.Expression>;
    value: MaybePyDsl<py.Expression>;
  }> = [];

  constructor(
    ...entries: Array<{ key: MaybePyDsl<py.Expression>; value: MaybePyDsl<py.Expression> }>
  ) {
    super();
    this._entries = entries;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const entry of this._entries) {
      ctx.analyze(entry.key);
      ctx.analyze(entry.value);
    }
  }

  entry(key: MaybePyDsl<py.Expression>, value: MaybePyDsl<py.Expression>): this {
    this._entries.push({ key, value });
    return this;
  }

  entries(
    ...entries: ReadonlyArray<{ key: MaybePyDsl<py.Expression>; value: MaybePyDsl<py.Expression> }>
  ): this {
    this._entries.push(...entries);
    return this;
  }

  override toAst(): py.DictExpression {
    const astEntries = this._entries.map((entry) => ({
      key: this.$node(entry.key) as py.Expression,
      value: this.$node(entry.value) as py.Expression,
    }));
    return py.factory.createDictExpression(astEntries);
  }
}
