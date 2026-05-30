import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import type { py } from '../../../../py-compiler';
import type { VarType } from '../../../../py-dsl';
import { $, PyDsl } from '../../../../py-dsl';
import type { PydanticPlugin } from '../../types';

const Mixed = PyDsl<py.Statement>;

export class PydTypeAliasPyDsl extends Mixed {
  readonly '~dsl' = 'PydTypeAliasPyDsl';

  readonly aliased?: VarType;

  protected plugin: PydanticPlugin['Instance'];
  private _dsl?: ReturnType<typeof $.var>;

  constructor(plugin: PydanticPlugin['Instance'], name: NodeName, aliased?: VarType) {
    super();
    this.name.set(name);
    this.aliased = aliased;
    this.plugin = plugin;
  }

  _build(): ReturnType<typeof $.var> {
    if (this._dsl) return this._dsl;

    const { plugin } = this;

    this._dsl = $.var(this.name)
      .type(plugin.symbols.typing.TypeAlias)
      .assign(this.aliased ?? plugin.symbols.typing.Any);

    return this._dsl;
  }

  override analyze(ctx: AnalysisContext): void {
    this._build();
    ctx.analyze(this._dsl!);
    super.analyze(ctx);
  }

  override toAst() {
    this._build();
    return this._dsl!.toAst();
  }
}
