import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import type { py } from '../../../../py-compiler';
import { $, PyDsl } from '../../../../py-dsl';
import type { EnumMember } from '../../../../py-dsl/decl/enum';
import { DocMixin } from '../../../../py-dsl/mixins/doc';

const Mixed = DocMixin(PyDsl<py.ClassDeclaration>);

export class PydanticEnumDsl extends Mixed {
  readonly '~dsl' = 'PydanticEnumDsl';

  private _dsl?: ReturnType<typeof $.enum>;
  private _members: Array<EnumMember> = [];

  constructor(name: NodeName) {
    super();
    this.name.set(name);
  }

  members(...members: ReadonlyArray<EnumMember>): this {
    this._members.push(...members);
    return this;
  }

  _build(): ReturnType<typeof $.enum> {
    if (this._dsl) return this._dsl;

    const cls = $.enum(this.name)
      .$if(this.$docs(), (c, v) => c.doc(v))
      .members(...this._members);
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
