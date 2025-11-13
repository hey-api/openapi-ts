/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { LiteralTsDsl } from './literal';
import { mixin } from './mixins/apply';
import { LayoutMixin } from './mixins/layout';

export class ArrayTsDsl extends TsDsl<ts.ArrayLiteralExpression> {
  private _elements: Array<
    | { expr: MaybeTsDsl<ts.Expression>; kind: 'element' }
    | { expr: MaybeTsDsl<ts.Expression>; kind: 'spread' }
  > = [];

  /** Adds a single array element. */
  element(expr: string | number | boolean | MaybeTsDsl<ts.Expression>): this {
    const node =
      typeof expr === 'string' ||
      typeof expr === 'number' ||
      typeof expr === 'boolean'
        ? new LiteralTsDsl(expr)
        : expr;
    this._elements.push({ expr: node, kind: 'element' });
    return this;
  }

  /** Adds multiple array elements. */
  elements(
    ...exprs: ReadonlyArray<
      string | number | boolean | MaybeTsDsl<ts.Expression>
    >
  ): this {
    for (const expr of exprs) this.element(expr);
    return this;
  }

  /** Adds a spread element (`...expr`). */
  spread(expr: MaybeTsDsl<ts.Expression>): this {
    this._elements.push({ expr, kind: 'spread' });
    return this;
  }

  $render(): ts.ArrayLiteralExpression {
    const elements = this._elements.map((item) => {
      const node = this.$node(item.expr);
      if (!ts.isExpression(node)) {
        throw new Error('Invalid array element: must be an expression.');
      }
      return item.kind === 'spread'
        ? ts.factory.createSpreadElement(node)
        : node;
    });

    return ts.factory.createArrayLiteralExpression(
      elements,
      this.$multiline(this._elements.length),
    );
  }
}

export interface ArrayTsDsl extends LayoutMixin {}
mixin(ArrayTsDsl, LayoutMixin);
