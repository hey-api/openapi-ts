import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ConstMixin, ExportMixin } from '../mixins/modifiers';
import { EnumMemberTsDsl } from './member';

export type EnumName = Symbol | string;
type Value = string | number | MaybeTsDsl<ts.Expression>;
type ValueFn = Value | ((m: EnumMemberTsDsl) => void);

const Mixed = ConstMixin(DocMixin(ExportMixin(TsDsl<ts.EnumDeclaration>)));

export class EnumTsDsl extends Mixed {
  private _members: Array<EnumMemberTsDsl> = [];
  private _name: EnumName;

  constructor(name: EnumName, fn?: (e: EnumTsDsl) => void) {
    super();
    this._name = name;
    if (isSymbol(name)) {
      name.setKind('enum');
      name.setNode(this);
    }
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this._name)) ctx.addDependency(this._name);
    for (const member of this._members) {
      member.analyze(ctx);
    }
  }

  /** Adds an enum member. */
  member(name: string, value?: ValueFn): this {
    const m = new EnumMemberTsDsl(name, value);
    this._members.push(m);
    return this;
  }

  /** Adds multiple enum members. */
  members(...members: ReadonlyArray<EnumMemberTsDsl>): this {
    this._members.push(...members);
    return this;
  }

  protected override _render() {
    return ts.factory.createEnumDeclaration(
      this.modifiers,
      // @ts-expect-error need to improve types
      this.$node(this._name),
      this.$node(this._members),
    );
  }
}
