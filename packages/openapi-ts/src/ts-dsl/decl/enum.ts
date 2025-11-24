import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ConstMixin, ExportMixin } from '../mixins/modifiers';
import { EnumMemberTsDsl } from './member';

type Value = string | number | MaybeTsDsl<ts.Expression>;
type ValueFn = Value | ((m: EnumMemberTsDsl) => void);

const Mixed = ConstMixin(DocMixin(ExportMixin(TsDsl<ts.EnumDeclaration>)));

export class EnumTsDsl extends Mixed {
  private _members: Array<EnumMemberTsDsl> = [];
  private _name: string | ts.Identifier;

  constructor(name: Symbol | string, fn?: (e: EnumTsDsl) => void) {
    super();
    if (typeof name === 'string') {
      this._name = name;
    } else {
      this._name = name.finalName;
      this.symbol = name;
      this.symbol.setKind('enum');
      this.symbol.setRootNode(this);
    }
    fn?.(this);
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

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createEnumDeclaration(
      this.modifiers,
      this._name,
      this.$node(this._members),
    );
  }
}
