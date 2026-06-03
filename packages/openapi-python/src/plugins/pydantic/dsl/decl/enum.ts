import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import type { py } from '../../../../py-compiler';
import { $, PyDsl } from '../../../../py-dsl';
import type { EnumMember } from '../../../../py-dsl/decl/enum';

const Mixed = PyDsl<py.ClassDeclaration>;

export class PydanticEnumDsl extends Mixed {
  readonly '~dsl' = 'PydanticEnumDsl';

  private _enum: ReturnType<typeof $.enum>;

  constructor(name: NodeName) {
    super();
    this.name.set(name);
    this._enum = $.enum(name);
  }

  members(...members: ReadonlyArray<EnumMember>): this {
    this._enum.members(...members);
    return this;
  }

  override analyze(ctx: AnalysisContext): void {
    ctx.analyze(this._enum);
    super.analyze(ctx);
  }

  override toAst() {
    return this._enum.toAst();
  }
}
