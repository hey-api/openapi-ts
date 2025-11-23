import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';

export class IdTsDsl extends TsDsl<ts.Identifier> {
  protected name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.Identifier {
    return ts.factory.createIdentifier(this.name);
  }
}
