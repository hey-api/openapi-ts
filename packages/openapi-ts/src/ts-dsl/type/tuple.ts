import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';

const Mixed = TypeTsDsl<ts.TupleTypeNode>;

export class TypeTupleTsDsl extends Mixed {
  protected _elements: Array<string | ts.TypeNode | TypeTsDsl> = [];

  constructor(...nodes: Array<string | ts.TypeNode | TypeTsDsl>) {
    super();
    this.elements(...nodes);
  }

  elements(...types: Array<string | ts.TypeNode | TypeTsDsl>): this {
    this._elements.push(...types);
    return this;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createTupleTypeNode(
      this._elements.map((t) => this.$type(t)),
    );
  }
}
