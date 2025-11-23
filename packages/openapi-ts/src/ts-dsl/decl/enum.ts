/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { DocMixin } from '../mixins/doc';
import {
  ConstMixin,
  createModifierAccessor,
  ExportMixin,
} from '../mixins/modifiers';
import { EnumMemberTsDsl } from './member';

type Value = string | number | MaybeTsDsl<ts.Expression>;
type ValueFn = Value | ((m: EnumMemberTsDsl) => void);

export class EnumTsDsl extends TsDsl<ts.EnumDeclaration> {
  private _members: Array<EnumMemberTsDsl> = [];
  private _name: string | ts.Identifier;
  protected modifiers = createModifierAccessor(this);

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

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Renders the enum declaration. */
  $render(): ts.EnumDeclaration {
    return ts.factory.createEnumDeclaration(
      this.modifiers.list(),
      this._name,
      this.$node(this._members),
    );
  }
}

export interface EnumTsDsl extends ConstMixin, DocMixin, ExportMixin {}
mixin(EnumTsDsl, ConstMixin, DocMixin, ExportMixin);
