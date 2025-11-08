import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';

export class ObjectTsDsl extends TsDsl<ts.ObjectLiteralExpression> {
  private static readonly DEFAULT_THRESHOLD = 3;
  private layout: boolean | number = ObjectTsDsl.DEFAULT_THRESHOLD;
  private props: Array<
    | { expr: MaybeTsDsl<WithString>; kind: 'prop'; name: string }
    | { expr: MaybeTsDsl<WithString>; kind: 'spread' }
  > = [];

  /** Sets automatic line output with optional threshold (default: 3). */
  auto(threshold: number = ObjectTsDsl.DEFAULT_THRESHOLD): this {
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
  prop(name: string, expr: MaybeTsDsl<WithString>): this {
    this.props.push({ expr, kind: 'prop', name });
    return this;
  }

  /** Adds a spread property (e.g. `{ ...options }`). */
  spread(expr: MaybeTsDsl<WithString>): this {
    this.props.push({ expr, kind: 'spread' });
    return this;
  }

  /** Builds and returns the object literal expression. */
  $render(): ts.ObjectLiteralExpression {
    const props = this.props.map((p) => {
      const node = this.$node(p.expr);
      if (p.kind === 'spread') return ts.factory.createSpreadAssignment(node);
      return ts.isIdentifier(node) && node.text === p.name
        ? ts.factory.createShorthandPropertyAssignment(p.name)
        : ts.factory.createPropertyAssignment(p.name, node);
    });

    const multiLine =
      typeof this.layout === 'number'
        ? this.props.length >= this.layout
        : this.layout;

    return ts.factory.createObjectLiteralExpression(props, multiLine);
  }
}
