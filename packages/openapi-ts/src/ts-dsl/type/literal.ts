import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { LiteralTsDsl } from '../literal';

export class TypeLiteralTsDsl extends TypeTsDsl<ts.LiteralTypeNode> {
  private value: string | number | boolean;

  constructor(value: string | number | boolean) {
    super();
    this.value = value;
  }

  $render(): ts.LiteralTypeNode {
    return ts.factory.createLiteralTypeNode(
      this.$node(new LiteralTsDsl(this.value)),
    );
  }
}
