import type ts from 'typescript';

import type { MaybeArray } from '../base';
import { PatternTsDsl } from '../decl/pattern';
import type { BaseCtor, MixinCtor } from './types';

export interface PatternMethods {
  /** Renders the pattern into a `BindingName`. */
  $pattern(): ts.BindingName | undefined;
  /** Defines an array binding pattern. */
  array(...props: ReadonlyArray<string> | [ReadonlyArray<string>]): this;
  /** Defines an object binding pattern. */
  object(
    ...props: ReadonlyArray<MaybeArray<string> | Record<string, string>>
  ): this;
  /** Adds a spread element (e.g. `...args`, `...options`) to the pattern. */
  spread(name: string): this;
}

/**
 * Mixin providing `.array()`, `.object()`, and `.spread()` methods for defining destructuring patterns.
 */
export function PatternMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Pattern extends Base {
    protected pattern: PatternTsDsl = new PatternTsDsl();

    protected array(
      ...props: ReadonlyArray<string> | [ReadonlyArray<string>]
    ): this {
      this.pattern.array(...props);
      return this;
    }

    protected object(
      ...props: ReadonlyArray<MaybeArray<string> | Record<string, string>>
    ): this {
      this.pattern.object(...props);
      return this;
    }

    /** Adds a spread element (e.g. `...args`, `...options`) to the pattern. */
    protected spread(name: string): this {
      this.pattern.spread(name);
      return this;
    }

    /** Renders the pattern into a `BindingName`. */
    protected $pattern(): ts.BindingName | undefined {
      return this.$node(this.pattern);
    }
  }

  return Pattern as unknown as MixinCtor<TBase, PatternMethods>;
}
