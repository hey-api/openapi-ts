import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TypeTsDsl } from '../base';
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

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this._base)) {
      ctx.addDependency(this._base);
    } else if (isTsDsl(this._base)) {
      this._base.analyze(ctx);
    }
    if (isSymbol(this._right)) ctx.addDependency(this._right);
  }

  base(base?: Base): this {
    this._base = base;
    return this;
  }

  right(right: Right): this {
    this._right = right;
    return this;
  }

  protected override _render() {
    if (!this._base) {
      throw new Error('TypeAttrTsDsl: missing base for qualified name');
    }
    const left = this.$node(this._base);
    if (!ts.isEntityName(left)) {
      throw new Error('TypeAttrTsDsl: base must be an EntityName');
    }
    return ts.factory.createQualifiedName(
      left,
      // @ts-expect-error need to improve types
      this.$node(this._right),
    );
  }
}
