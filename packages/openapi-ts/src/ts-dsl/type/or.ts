import type { SyntaxNode } from '@hey-api/codegen-core';
import { Symbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';

type Type = Symbol | string | ts.TypeNode | TypeTsDsl;

const Mixed = TypeTsDsl<ts.UnionTypeNode>;

export class TypeOrTsDsl extends Mixed {
  protected _types: Array<Type> = [];

  constructor(...nodes: Array<Type>) {
    super();
    this.types(...nodes);
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
    for (const node of this._types) {
      if (node instanceof TsDsl) {
        node.traverse(visitor);
      }
    }
  }

  types(...nodes: Array<Type>): this {
    for (const node of nodes) {
      if (node instanceof TsDsl) node.setParent(this);
      this._types.push(node);
    }
    return this;
  }

  protected override _render() {
    const flat: Array<ts.TypeNode> = [];

    for (const node of this._types) {
      const value = node instanceof Symbol ? node.finalName : node;
      const type = this.$type(value);
      if (ts.isUnionTypeNode(type)) {
        flat.push(...type.types);
      } else {
        flat.push(type);
      }
    }

    return ts.factory.createUnionTypeNode(flat);
  }
}
