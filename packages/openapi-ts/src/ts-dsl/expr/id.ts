import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';

const Mixed = TsDsl<ts.Identifier>;

export class IdTsDsl extends Mixed {
  protected name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createIdentifier(this.name);
  }
}
