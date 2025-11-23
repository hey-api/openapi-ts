/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { DocMixin } from '../mixins/doc';
import { safeMemberName } from '../utils/prop';

type Value = string | number | MaybeTsDsl<ts.Expression>;
type ValueFn = Value | ((m: EnumMemberTsDsl) => void);

export class EnumMemberTsDsl extends TsDsl<ts.EnumMember> {
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

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Sets the enum member value. */
  value(value?: Value): this {
    this._value = value;
    return this;
  }

  $render(): ts.EnumMember {
    return ts.factory.createEnumMember(
      safeMemberName(this._name),
      this.$node(this._value),
    );
  }
}

export interface EnumMemberTsDsl extends DocMixin {}
mixin(EnumMemberTsDsl, DocMixin);
