import type { AnalysisContext, Ref, Symbol } from '@hey-api/codegen-core';
import { isSymbol, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ConstMixin, ExportMixin } from '../mixins/modifiers';
import { safeRuntimeName } from '../utils/name';
import { EnumMemberTsDsl } from './member';

export type EnumName = Symbol | string;
type Value = string | number | MaybeTsDsl<ts.Expression>;
type ValueFn = Value | ((m: EnumMemberTsDsl) => void);

const Mixed = ConstMixin(DocMixin(ExportMixin(TsDsl<ts.EnumDeclaration>)));

export class EnumTsDsl extends Mixed {
  readonly '~dsl' = 'EnumTsDsl';

  private _members: Array<EnumMemberTsDsl> = [];
  private _name: Ref<EnumName>;

  constructor(name: EnumName, fn?: (e: EnumTsDsl) => void) {
    super();
    this._name = ref(name);
    if (isSymbol(name)) {
      name.setKind('enum');
      name.setNameSanitizer(safeRuntimeName);
      name.setNode(this);
    }
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._name);
    ctx.pushScope();
    try {
      for (const member of this._members) {
        ctx.analyze(member);
      }
    } finally {
      ctx.popScope();
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

  override toAst() {
    const node = ts.factory.createEnumDeclaration(
      this.modifiers,
      // @ts-expect-error need to improve types
      this.$node(this._name),
      this.$node(this._members),
    );
    return this.$docs(node);
  }
}
