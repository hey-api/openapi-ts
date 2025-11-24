import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';

const Mixed = TypeTsDsl<ts.TypeParameterDeclaration>;

export class TypeParamTsDsl extends Mixed {
  protected name?: Symbol | string;
  protected constraint?: string | MaybeTsDsl<TypeTsDsl> | boolean;
  protected defaultValue?: string | MaybeTsDsl<TypeTsDsl> | boolean;

  constructor(name?: Symbol | string, fn?: (name: TypeParamTsDsl) => void) {
    super();
    this.name = name;
    if (name && typeof name !== 'string') {
      this.getRootSymbol().addDependency(name);
    }
    fn?.(this);
  }

  override collectSymbols(out: Set<Symbol>): void {
    console.log(out);
  }

  default(value: string | MaybeTsDsl<TypeTsDsl> | boolean): this {
    this.defaultValue = value;
    return this;
  }

  extends(constraint: string | MaybeTsDsl<TypeTsDsl> | boolean): this {
    this.constraint = constraint;
    return this;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    if (!this.name) throw new Error('Missing type name');
    const name =
      typeof this.name === 'string' ? this.name : this.name.finalName;
    return ts.factory.createTypeParameterDeclaration(
      undefined,
      this.$maybeId(name),
      this.$type(this.constraint),
      this.$type(this.defaultValue),
    );
  }
}
