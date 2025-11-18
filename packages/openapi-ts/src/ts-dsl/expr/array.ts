/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { AsMixin } from '../mixins/as';
import { LayoutMixin } from '../mixins/layout';
import { LiteralTsDsl } from './literal';

export class ArrayTsDsl extends TsDsl<ts.ArrayLiteralExpression> {
  protected _elements: Array<
    | { expr: MaybeTsDsl<ts.Expression>; kind: 'element' }
    | { expr: MaybeTsDsl<ts.Expression>; kind: 'spread' }
  > = [];

  constructor(
    ...exprs: Array<string | number | boolean | MaybeTsDsl<ts.Expression>>
  ) {
    super();
    this.elements(...exprs);
  }

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

export interface ArrayTsDsl extends AsMixin, LayoutMixin {}
mixin(ArrayTsDsl, AsMixin, LayoutMixin);
