import ts from 'typescript';

import type { ExprInput } from './base';
import { TsDsl } from './base';
import { ExprTsDsl } from './expr';

export class ObjectTsDsl extends TsDsl<ts.ObjectLiteralExpression> {
  private props: Array<{ expr: TsDsl<ts.Expression>; name: string }> = [];
  private layout: boolean | number = 3;

  constructor(fn?: (o: ObjectTsDsl) => void) {
    super();
    fn?.(this);
  }

  /** Sets automatic line output with optional threshold (default: 3). */
  auto(threshold: number = 3): this {
    this.layout = threshold;
    return this;
  }

  /** Sets single line output. */
  inline(): this {
    this.layout = false;
    return this;
  }

  /** Sets multi line output. */
  pretty(): this {
    this.layout = true;
    return this;
  }

  /** Adds a property assignment. */
  prop(
    name: string,
    fn:
      | TsDsl<ts.Expression>
      | ((p: (expr: ExprInput) => ExprTsDsl) => TsDsl<ts.Expression>),
  ): this {
    const result =
      typeof fn === 'function'
        ? fn((expr: ExprInput) => new ExprTsDsl(expr))
        : fn;
    this.props.push({ expr: result, name });
    return this;
  }

  $render(): ts.ObjectLiteralExpression {
    const props = this.props.map(({ expr, name }) =>
      ts.factory.createPropertyAssignment(name, expr.$render()),
    );

    const multiLine =
      typeof this.layout === 'number'
        ? this.props.length >= this.layout
        : this.layout;

    return ts.factory.createObjectLiteralExpression(props, multiLine);
  }
}
