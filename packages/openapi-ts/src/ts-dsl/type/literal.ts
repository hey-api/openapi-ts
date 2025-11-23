import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { LiteralTsDsl } from '../expr/literal';

export class TypeLiteralTsDsl extends TypeTsDsl<ts.LiteralTypeNode> {
  protected value: string | number | boolean | null;

  constructor(value: string | number | boolean | null) {
    super();
    this.value = value;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.LiteralTypeNode {
    return ts.factory.createLiteralTypeNode(
      this.$node(new LiteralTsDsl(this.value)),
    );
  }
}
