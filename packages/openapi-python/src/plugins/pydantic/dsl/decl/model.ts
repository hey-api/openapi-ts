import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import type { py } from '../../../../py-compiler';
import { PyDsl } from '../../../../py-dsl';
import { $ } from '../../../../py-dsl';
import type { PydanticPlugin } from '../../types';
import { identifiers } from '../../v2/constants';
import type { PydanticFieldDsl } from './field';

const Mixed = PyDsl<py.ClassDeclaration>;

export class PydanticModelDsl extends Mixed {
  readonly '~dsl' = 'PydanticModelDsl';

  protected plugin: PydanticPlugin['Instance'];

  private _bases: Array<NodeName> = [];
  private _configKwargs: Array<[string, string | number | boolean]> = [];
  private _dsl?: ReturnType<typeof $.class>;
  private _fields: Array<PydanticFieldDsl> = [];

  constructor(plugin: PydanticPlugin['Instance'], name: NodeName) {
    super();
    this.plugin = plugin;
    this.name.set(name);
  }

  config(opts: Record<string, string | number | boolean>): this {
    for (const [k, v] of Object.entries(opts)) this._configKwargs.push([k, v]);
    return this;
  }

  extends(base: NodeName): this {
    this._bases.push(base);
    return this;
  }

  field(field: PydanticFieldDsl): this {
    this._fields.push(field);
    return this;
  }

  _build(): ReturnType<typeof $.class> {
    if (this._dsl) return this._dsl;

    const { plugin } = this;

    if (plugin.config.modelType === 'dataclass') {
      const cls = $.class(this.name)
        .decorator(plugin.symbols.dataclass)
        .do(...this._fields.map((f) => f._build()));
      this._dsl = cls;
      return cls;
    }

    const cls = $.class(this.name)
      .extends(plugin.symbols.BaseModel, ...this._bases)
      .do(...this._fields.map((f) => f._build()))
      .$if(this._configKwargs.length, (c) =>
        c.do(
          $.field(identifiers.model_config).assign(
            $(plugin.symbols.ConfigDict).call(...this._configKwargs.map(([k, v]) => $.kwarg(k, v))),
          ),
        ),
      );

    this._dsl = cls;
    return cls;
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
