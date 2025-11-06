import ts from 'typescript';

import type { ExprInput } from '../base';
import { TsDsl } from '../base';
import { ObjectTsDsl } from '../object';

export class DecoratorMixin extends TsDsl {
  protected decorators?: Array<ts.Decorator>;

  /** Adds a decorator (e.g. `@sealed({ in: 'root' })`). */
  decorator<T extends this>(
    this: T,
    name: ExprInput | false | null,
    fn?: (o: ObjectTsDsl) => void,
  ): T {
    if (!name) return this;

    const expr = this.$expr(name);
    let call: ts.Expression = expr;

    // if callback provided, build object argument
    if (fn) {
      const obj = new ObjectTsDsl(fn);
      call = ts.factory.createCallExpression(expr, undefined, [obj.$render()]);
    }

    (this.decorators ??= []).push(ts.factory.createDecorator(call));
    return this;
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
