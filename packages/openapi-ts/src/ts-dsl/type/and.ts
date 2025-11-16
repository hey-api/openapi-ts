import ts from 'typescript';

import type { WithString } from '../base';
import { TypeTsDsl } from '../base';

export class TypeAndTsDsl extends TypeTsDsl<ts.IntersectionTypeNode> {
  private _types: Array<WithString<ts.TypeNode> | TypeTsDsl> = [];

  constructor(...nodes: Array<WithString<ts.TypeNode> | TypeTsDsl>) {
    super();
    this.types(...nodes);
  }

  types(...nodes: Array<WithString<ts.TypeNode> | TypeTsDsl>): this {
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
