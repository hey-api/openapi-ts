import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { LayoutMixin } from '../mixins/layout';
import { LiteralTsDsl } from './literal';

const Mixed = AsMixin(LayoutMixin(TsDsl<ts.ArrayLiteralExpression>));

export class ArrayTsDsl extends Mixed {
  readonly '~dsl' = 'ArrayTsDsl';

  protected _elements: Array<
    | { expr: MaybeTsDsl<ts.Expression>; kind: 'element' }
    | { expr: MaybeTsDsl<ts.Expression>; kind: 'spread' }
  > = [];

  constructor(...exprs: Array<string | number | boolean | MaybeTsDsl<ts.Expression>>) {
    super();
    this.elements(...exprs);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const item of this._elements) {
      ctx.analyze(item.expr);
    }
  }

  /** Adds a single array element. */
  element(expr: string | number | boolean | MaybeTsDsl<ts.Expression>): this {
    const node =
      typeof expr === 'string' || typeof expr === 'number' || typeof expr === 'boolean'
        ? new LiteralTsDsl(expr)
        : expr;
    this._elements.push({ expr: node, kind: 'element' });
    return this;
  }

  /** Adds multiple array elements. */
  elements(...exprs: ReadonlyArray<string | number | boolean | MaybeTsDsl<ts.Expression>>): this {
    for (const expr of exprs) this.element(expr);
    return this;
  }

  /** Adds a spread element (`...expr`). */
  spread(expr: MaybeTsDsl<ts.Expression>): this {
    this._elements.push({ expr, kind: 'spread' });
    return this;
  }

  override toAst() {
    const elements = this._elements.map((item) => {
      const node = this.$node(item.expr);
      return item.kind === 'spread' ? ts.factory.createSpreadElement(node) : node;
    });

    return ts.factory.createArrayLiteralExpression(
      elements,
      this.$multiline(this._elements.length),
    );
  }
}
