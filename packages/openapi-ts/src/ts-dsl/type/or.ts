import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';

const Mixed = TypeTsDsl<ts.UnionTypeNode>;

export class TypeOrTsDsl extends Mixed {
  protected _types: Array<string | ts.TypeNode | TypeTsDsl> = [];

  constructor(...nodes: Array<string | ts.TypeNode | TypeTsDsl>) {
    super();
    this.types(...nodes);
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  types(...nodes: Array<string | ts.TypeNode | TypeTsDsl>): this {
    this._types.push(...nodes);
    return this;
  }

  protected override _render() {
    const flat: Array<ts.TypeNode> = [];

    for (const n of this._types) {
      const t = this.$type(n);
      if (ts.isUnionTypeNode(t)) {
        flat.push(...t.types);
      } else {
        flat.push(t);
      }
    }

    return ts.factory.createUnionTypeNode(flat);
  }
}
