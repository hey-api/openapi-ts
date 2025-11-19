import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DecoratorTsDsl } from '../decl/decorator';

export class DecoratorMixin extends TsDsl {
  protected decorators?: Array<DecoratorTsDsl>;

  /** Adds a decorator (e.g. `@sealed({ in: 'root' })`). */
  decorator(
    name: string | ts.Expression,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
  ): this {
    (this.decorators ??= []).push(new DecoratorTsDsl(name, ...args));
    return this;
  }

  /** Renders the decorators into an array of `ts.Decorator`s. */
  protected $decorators(): ReadonlyArray<ts.Decorator> {
    if (!this.decorators) return [];
    return this.$node(this.decorators);
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
