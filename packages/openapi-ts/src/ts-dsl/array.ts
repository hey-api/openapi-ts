import ts from 'typescript';

import { TsDsl } from './base';
import { LiteralTsDsl } from './literal';

export class ArrayTsDsl extends TsDsl<ts.ArrayLiteralExpression> {
  private elements: Array<string | number | boolean | TsDsl<ts.Expression>> =
    [];

  /** Adds one or more elements to the array expression. */
  items(
    ...exprs: ReadonlyArray<string | number | boolean | TsDsl<ts.Expression>>
  ): this {
    this.elements.push(...exprs);
    return this;
  }

  $render(): ts.ArrayLiteralExpression {
    const elements = this.elements.map((element) => {
      if (
        typeof element === 'string' ||
        typeof element === 'number' ||
        typeof element === 'boolean'
      ) {
        return this.$node(new LiteralTsDsl(element));
      }
      return this.$node(element);
    });
    return ts.factory.createArrayLiteralExpression(elements, false);
  }
}
