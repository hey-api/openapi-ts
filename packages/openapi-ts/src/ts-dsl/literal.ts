import ts from 'typescript';

import { TsDsl } from './base';

export class LiteralTsDsl extends TsDsl<ts.LiteralTypeNode['literal']> {
  private value: string | number | boolean;

  constructor(value: string | number | boolean) {
    super();
    this.value = value;
  }

  $render(): ts.LiteralTypeNode['literal'] {
    switch (typeof this.value) {
      case 'boolean':
        return this.value ? ts.factory.createTrue() : ts.factory.createFalse();
      case 'number':
        return ts.factory.createNumericLiteral(this.value);
      case 'string':
        return ts.factory.createStringLiteral(this.value);
      default:
        throw new Error(`Unsupported literal: ${String(this.value)}`);
    }
  }
}
