import ts from 'typescript';

import type { WithString } from '../base';
import { TypeTsDsl } from '../base';

export class TypeTupleTsDsl extends TypeTsDsl<ts.TupleTypeNode> {
  private _elements: Array<WithString<ts.TypeNode> | TypeTsDsl> = [];

  constructor(...nodes: Array<WithString<ts.TypeNode> | TypeTsDsl>) {
    super();
    this.elements(...nodes);
  }

  elements(...types: Array<WithString<ts.TypeNode> | TypeTsDsl>): this {
    this._elements.push(...types);
    return this;
  }

  $render(): ts.TupleTypeNode {
    return ts.factory.createTupleTypeNode(
      this._elements.map((t) => this.$type(t)),
    );
  }
}
