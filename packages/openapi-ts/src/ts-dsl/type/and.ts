import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';

export class TypeAndTsDsl extends TypeTsDsl<ts.IntersectionTypeNode> {
  protected _types: Array<string | ts.TypeNode | TypeTsDsl> = [];

  constructor(...nodes: Array<string | ts.TypeNode | TypeTsDsl>) {
    super();
    this.types(...nodes);
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  types(...nodes: Array<string | ts.TypeNode | TypeTsDsl>): this {
    this._types.push(...nodes);
    return this;
  }

  $render(): ts.IntersectionTypeNode {
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
