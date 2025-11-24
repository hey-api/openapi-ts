import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';

const Mixed = TypeTsDsl<ts.IntersectionTypeNode>;

export class TypeAndTsDsl extends Mixed {
  protected _types: Array<string | ts.TypeNode | TypeTsDsl> = [];

  constructor(...nodes: Array<string | ts.TypeNode | TypeTsDsl>) {
    super();
    this.types(...nodes);
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  types(...nodes: Array<string | ts.TypeNode | TypeTsDsl>): this {
    this._types.push(...nodes);
    return this;
  }

  protected override _render() {
    const flat: Array<ts.TypeNode> = [];

    for (const n of this._types) {
      const t = this.$type(n);
      if (ts.isIntersectionTypeNode(t)) {
        flat.push(...t.types);
      } else {
        flat.push(t);
      }
    }

    return ts.factory.createIntersectionTypeNode(flat);
  }
}
