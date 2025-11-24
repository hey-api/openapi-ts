import type { SyntaxNode } from '@hey-api/codegen-core';
import { Symbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl, TypeTsDsl } from '../base';
import { TypeExprMixin } from '../mixins/type-expr';

type Base = Symbol | string | MaybeTsDsl<ts.EntityName>;
type Right = Symbol | string | ts.Identifier;

const Mixed = TypeExprMixin(TypeTsDsl<ts.QualifiedName>);

export class TypeAttrTsDsl extends Mixed {
  protected _base?: Base;
  protected _right!: Right;

  constructor(base: Base, right: string | ts.Identifier);
  constructor(right: Right);
  constructor(base: Base, right?: Right) {
    super();
    if (right) {
      this.base(base);
      this.right(right);
    } else {
      this.base();
      this.right(base as Right);
    }
  }

  base(base?: Base): this {
    this._base = base;
    if (this._base instanceof TsDsl) this._base.setParent(this);
    return this;
  }

  right(right: Right): this {
    this._right = right;
    return this;
  }

  override collectSymbols(out: Set<Symbol>): void {
    super.collectSymbols(out);
    if (this._base) {
      if (this._base instanceof Symbol) {
        out.add(this._base);
      } else if (this._base instanceof TsDsl) {
        this._base.collectSymbols(out);
      }
    }
    if (this._right instanceof Symbol) {
      out.add(this._right);
    }
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
    if (this._base instanceof TsDsl) {
      this._base.traverse(visitor);
    }
  }

  protected override _render() {
    if (!this._base) {
      throw new Error('TypeAttrTsDsl: missing base for qualified name');
    }
    const left =
      this._base instanceof Symbol
        ? this.$node(this._base.finalName)
        : this.$node(this._base);
    if (!ts.isEntityName(left)) {
      throw new Error('TypeAttrTsDsl: base must be an EntityName');
    }
    const right =
      this._right instanceof Symbol
        ? this.$maybeId(this._right.finalName)
        : this.$maybeId(this._right);
    return ts.factory.createQualifiedName(left, right);
  }
}
