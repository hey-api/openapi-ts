import ts from 'typescript';

import { TypeTsDsl } from '../base';

export class TypeOrTsDsl extends TypeTsDsl<ts.UnionTypeNode> {
  private _types: Array<string | ts.TypeNode | TypeTsDsl> = [];

  constructor(...nodes: Array<string | ts.TypeNode | TypeTsDsl>) {
    super();
    this.types(...nodes);
  }

  types(...nodes: Array<string | ts.TypeNode | TypeTsDsl>): this {
    this._types.push(...nodes);
    return this;
  }

  $render(): ts.UnionTypeNode {
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
