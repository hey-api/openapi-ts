import type { SyntaxNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

export class NewlineTsDsl extends TsDsl<ts.Identifier> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  traverse(_visitor: (node: SyntaxNode) => void): void {
    // noop
  }

  protected override _render(): ts.Identifier {
    return this.$node(new IdTsDsl('\n'));
  }
}
