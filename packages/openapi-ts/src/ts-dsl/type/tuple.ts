import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';

export class TypeTupleTsDsl extends TypeTsDsl<ts.TupleTypeNode> {
  protected _elements: Array<string | ts.TypeNode | TypeTsDsl> = [];

  constructor(...nodes: Array<string | ts.TypeNode | TypeTsDsl>) {
    super();
    this.elements(...nodes);
  }

  elements(...types: Array<string | ts.TypeNode | TypeTsDsl>): this {
    this._elements.push(...types);
    return this;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.TupleTypeNode {
    return ts.factory.createTupleTypeNode(
      this._elements.map((t) => this.$type(t)),
    );
  }
}
