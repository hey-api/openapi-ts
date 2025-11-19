/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
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

  constructor(name: string | ts.Identifier, fn?: (e: EnumTsDsl) => void) {
    super();
    this._name = name;
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
