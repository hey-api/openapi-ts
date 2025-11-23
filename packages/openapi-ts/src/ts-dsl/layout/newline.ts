import type { SyntaxNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

export class NewlineTsDsl extends TsDsl<ts.Identifier> {
  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.Identifier {
    return this.$node(new IdTsDsl('\n'));
  }
}
