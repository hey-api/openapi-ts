import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import type { py } from '../../../../py-compiler';
import { $, PyDsl } from '../../../../py-dsl';
import type { PydanticPlugin } from '../../types';

export type EnumMember = {
  name: NodeName;
  value: number | string;
};

const Mixed = PyDsl<py.ClassDeclaration>;

export class PydanticEnumDsl extends Mixed {
  readonly '~dsl' = 'PydanticEnumDsl';

  readonly members: Array<EnumMember>;

  protected plugin: PydanticPlugin['Instance'];
  private _dsl?: ReturnType<typeof $.class>;

  constructor(plugin: PydanticPlugin['Instance'], name: NodeName, members: Array<EnumMember>) {
    super();
    this.name.set(name);
    this.members = members;
    this.plugin = plugin;
  }

  _build(): ReturnType<typeof $.class> {
    if (this._dsl) return this._dsl;

    const { plugin } = this;

    const hasStrings = this.members.some((m) => typeof m.value === 'string');
    const hasNumbers = this.members.some((m) => typeof m.value === 'number');

    const cls = $.class(this.name);
    if (hasStrings && !hasNumbers) {
      cls.extends('str');
    } else if (!hasStrings && hasNumbers) {
      cls.extends('int');
    }
    cls.extends(plugin.symbols.enum.Enum);

    for (const m of this.members) {
      cls.do($.field(m.name).assign($.literal(m.value)));
    }

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
