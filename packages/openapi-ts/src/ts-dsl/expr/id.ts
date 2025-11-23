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

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  protected override _render() {
    return ts.factory.createIdentifier(this.name);
  }
}
