import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import type { py } from '../../../../py-compiler';
import { $, PyDsl } from '../../../../py-dsl';
import type { PydanticPlugin } from '../../types';
import type { PydanticConstrainedTypeDsl } from '../expr/constrained-type';

const Mixed = PyDsl<py.Statement>;

export class PydanticTypeAliasDsl extends Mixed {
  readonly '~dsl' = 'PydanticTypeAliasDsl';

  readonly aliased?: PydanticConstrainedTypeDsl;

  protected plugin: PydanticPlugin['Instance'];
  private _dsl?: ReturnType<typeof $.var>;

  constructor(
    plugin: PydanticPlugin['Instance'],
    name: NodeName,
    aliased?: PydanticConstrainedTypeDsl,
  ) {
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
      .assign(this.aliased?.type ?? plugin.symbols.typing.Any);

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
