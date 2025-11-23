/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { TypeExprMixin } from '../mixins/type-expr';

export class TypeAttrTsDsl extends TypeTsDsl<ts.QualifiedName> {
  protected _base?: Symbol | string | MaybeTsDsl<ts.EntityName>;
  protected right: Symbol | string | ts.Identifier;

  constructor(
    base: Symbol | string | MaybeTsDsl<ts.EntityName>,
    right: string | ts.Identifier,
  );
  constructor(right: Symbol | string | ts.Identifier);
  constructor(
    baseOrRight: Symbol | string | MaybeTsDsl<ts.EntityName>,
    maybeRight?: Symbol | string | ts.Identifier,
  ) {
    super();
    if (maybeRight) {
      this.base(baseOrRight);
      this.right = maybeRight;
    } else {
      this.base(undefined);
      this.right = baseOrRight as string | ts.Identifier;
    }
  }

  base(base?: Symbol | string | MaybeTsDsl<ts.EntityName>): this {
    this._base = base;
    return this;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.QualifiedName {
    if (!this._base) {
      throw new Error('TypeAttrTsDsl: missing base for qualified name');
    }
    const left =
      typeof this._base !== 'string' && this._base && 'id' in this._base
        ? this.$node(this._base.finalName)
        : this.$node(this._base);
    if (!ts.isEntityName(left)) {
      throw new Error('TypeAttrTsDsl: base must be an EntityName');
    }
    const right =
      typeof this.right !== 'string' && this.right && 'id' in this.right
        ? this.$maybeId(this.right.finalName)
        : this.$maybeId(this.right);
    return ts.factory.createQualifiedName(left, right);
  }
}

export interface TypeAttrTsDsl extends TypeExprMixin {}
mixin(TypeAttrTsDsl, TypeExprMixin);
