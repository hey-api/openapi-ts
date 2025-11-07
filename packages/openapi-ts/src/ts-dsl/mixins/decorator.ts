import type ts from 'typescript';

import type { MaybeTsDsl, WithString } from '../base';
import { TsDsl } from '../base';
import { DecoratorTsDsl } from '../decorator';

export class DecoratorMixin extends TsDsl {
  private decorators?: Array<DecoratorTsDsl>;

  /** Adds a decorator (e.g. `@sealed({ in: 'root' })`). */
  decorator(
    name: WithString,
    ...args: ReadonlyArray<MaybeTsDsl<WithString>>
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
