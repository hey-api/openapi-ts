import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { safeMemberName } from '../utils/name';

type Value = string | number | MaybeTsDsl<ts.Expression>;
type ValueFn = Value | ((m: EnumMemberTsDsl) => void);

const Mixed = DocMixin(TsDsl<ts.EnumMember>);

export class EnumMemberTsDsl extends Mixed {
  readonly '~dsl' = 'EnumMemberTsDsl';

  private _name: string;
  private _value?: Value;

  constructor(name: string, value?: ValueFn) {
    super();
    this._name = name;
    if (typeof value === 'function') {
      value(this);
    } else {
      this.value(value);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._value);
  }

  /** Sets the enum member value. */
  value(value?: Value): this {
    this._value = value;
    return this;
  }

  override toAst() {
    const node = ts.factory.createEnumMember(
      this.$node(safeMemberName(this._name)),
      this.$node(this._value),
    );
    return this.$docs(node);
  }
}
