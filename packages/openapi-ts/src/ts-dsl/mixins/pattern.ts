import type ts from 'typescript';

import type { MaybeArray } from '../base';
import { TsDsl } from '../base';
import { PatternTsDsl } from '../pattern';

/**
 * Mixin providing `.array()`, `.object()`, and `.spread()` methods for defining destructuring patterns.
 */
export class PatternMixin extends TsDsl {
  private pattern?: PatternTsDsl;

  /** Defines an array binding pattern. */
  array(...props: ReadonlyArray<string> | [ReadonlyArray<string>]): this {
    (this.pattern ??= new PatternTsDsl()).array(...props);
    return this;
  }

  /** Defines an object binding pattern. */
  object(
    ...props: ReadonlyArray<MaybeArray<string> | Record<string, string>>
  ): this {
    (this.pattern ??= new PatternTsDsl()).object(...props);
    return this;
  }

  /** Adds a spread element (e.g. `...args`, `...options`) to the pattern. */
  spread(name: string): this {
    (this.pattern ??= new PatternTsDsl()).spread(name);
    return this;
  }

  /** Renders the pattern into a `BindingName`. */
  protected $pattern(): ts.BindingName | undefined {
    return this.$node(this.pattern);
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
