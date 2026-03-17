import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../py-compiler';
import type { BaseCtor, MixinCtor } from './types';

export type Modifiers = {
  /**
   * Checks if specified modifier is present.
   *
   * @param modifier - The modifier to check.
   * @returns True if modifier is present, false otherwise.
   */
  hasModifier(modifier: Modifier): boolean;
  modifiers: Array<py.Expression>;
};

type Modifier = 'async';

export interface ModifierMethods extends Modifiers {
  /**
   * Adds a modifier of specified kind to modifiers list if condition is true.
   *
   * @param modifier - The modifier to add.
   * @param condition - Whether to add modifier.
   * @returns The parent node for chaining.
   */
  _m(modifier: Modifier, condition: boolean): this;
}

function modifierToKind(modifier: Modifier): py.Expression {
  switch (modifier) {
    case 'async':
      return py.factory.createIdentifier('async');
  }
}

function ModifiersMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Modifiers extends Base {
    protected modifiers: Array<py.Expression> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected hasModifier(modifier: Modifier): boolean {
      const kind = modifierToKind(modifier);
      return Boolean(this.modifiers.find((mod) => mod === kind));
    }

    protected _m(modifier: Modifier, condition: boolean): this {
      if (condition) {
        const kind = modifierToKind(modifier);
        this.modifiers.push(kind);
      }
      return this;
    }
  }

  return Modifiers as unknown as MixinCtor<TBase, ModifierMethods>;
}

export interface AsyncMethods extends Modifiers {
  /**
   * Adds an `async` keyword modifier if condition is true.
   *
   * @param condition - Whether to add modifier (default: true).
   * @returns The target object for chaining.
   */
  async(condition?: boolean): this;
}

/**
 * Mixin that adds an `async` modifier to a node.
 */
export function AsyncMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  const Mixed = ModifiersMixin(Base as BaseCtor<T>);

  abstract class Async extends Mixed {
    protected async(condition?: boolean): this {
      const cond = arguments.length === 0 ? true : Boolean(condition);
      return this._m('async', cond);
    }
  }

  return Async as unknown as MixinCtor<TBase, AsyncMethods>;
}

export interface ExportMethods extends Modifiers {
  /**
   * Adds the `export` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  export(condition?: boolean): this;
}

/**
 * Mixin that adds an `export` modifier to a node.
 */
export function ExportMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  const Mixed = ModifiersMixin(Base as BaseCtor<T>);

  abstract class Export extends Mixed {
    /**
     * Adds the `export` keyword modifier if the condition is true.
     *
     * @param condition - Whether to add the modifier (default: true).
     * @returns The target object for chaining.
     */
    protected export(condition?: boolean): this {
      const cond = arguments.length === 0 ? true : Boolean(condition);
      this.exported = cond;
      // TODO: remove this side-effect once planner handles exported flag
      if (this.symbol) this.symbol.setExported(cond);
      return this;
    }
  }

  return Export as unknown as MixinCtor<TBase, ExportMethods>;
}
