import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DecoratorTsDsl } from '../decl/decorator';

export abstract class DecoratorMixin extends TsDsl {
  protected decorators?: Array<DecoratorTsDsl>;

  /** Adds a decorator (e.g. `@sealed({ in: 'root' })`). */
  decorator(
    name: Symbol | string | MaybeTsDsl<ts.Expression>,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
  ): this {
    (this.decorators ??= []).push(
      new DecoratorTsDsl(name, ...args).setParent(this),
    );
    return this;
  }

  /** Renders the decorators into an array of `ts.Decorator`s. */
  protected $decorators(): ReadonlyArray<ts.Decorator> {
    if (!this.decorators) return [];
    return this.$node(this.decorators);
  }
}
