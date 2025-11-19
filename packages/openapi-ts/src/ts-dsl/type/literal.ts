import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { LiteralTsDsl } from '../expr/literal';

export class TypeLiteralTsDsl extends TypeTsDsl<ts.LiteralTypeNode> {
  protected value: string | number | boolean | null;

  constructor(value: string | number | boolean | null) {
    super();
    this.value = value;
  }

  $render(): ts.LiteralTypeNode {
    return ts.factory.createLiteralTypeNode(
      this.$node(new LiteralTsDsl(this.value)),
    );
  }
}
