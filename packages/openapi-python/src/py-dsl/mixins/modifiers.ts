import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
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

export function ModifiersMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
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
