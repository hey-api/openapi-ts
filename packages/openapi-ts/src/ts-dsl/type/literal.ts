import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { LiteralTsDsl } from '../expr/literal';

const Mixed = TypeTsDsl<ts.LiteralTypeNode>;

export class TypeLiteralTsDsl extends Mixed {
  protected value: string | number | boolean | null;

  constructor(value: string | number | boolean | null) {
    super();
    this.value = value;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createLiteralTypeNode(
      this.$node(new LiteralTsDsl(this.value)),
    );
  }
}
