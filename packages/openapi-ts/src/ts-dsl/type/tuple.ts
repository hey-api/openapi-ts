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

  $render(): ts.TupleTypeNode {
    return ts.factory.createTupleTypeNode(
      this._elements.map((t) => this.$type(t)),
    );
  }
}
