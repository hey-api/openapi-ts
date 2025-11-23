import type { Symbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { TsDsl } from '../base';

/**
 * Creates an accessor for adding TypeScript modifiers to a parent DSL node.
 *
 * @param parent - The parent DSL node to which modifiers will be added.
 * @returns An object with a `list` method that returns the collected modifiers.
 */
export function createModifierAccessor<Parent extends TsDsl>(parent: Parent) {
  const modifiers: Array<ts.Modifier> = [];

  /**
   * Adds a modifier of the specified kind to the modifiers list if the condition is true.
   *
   * @param kind - The syntax kind of the modifier to add.
   * @param condition - Whether to add the modifier.
   * @returns The parent DSL node for chaining.
   */
  function _m(kind: ts.ModifierSyntaxKind, condition: boolean): Parent {
    if (condition) modifiers.push(ts.factory.createModifier(kind));
    return parent;
  }

  Object.assign(parent, { _m }); // attaches to parent

  /**
   * Returns the list of collected modifiers.
   *
   * @returns Array of TypeScript modifiers.
   */
  function list() {
    return modifiers;
  }

  return { list };
}

type Target = object & {
  _m?(kind: ts.ModifierSyntaxKind, condition?: boolean): unknown;
  symbol?: Symbol;
};

/**
 * Mixin that adds an `abstract` modifier to a node.
 */
export class AbstractMixin {
  /**
   * Adds the `abstract` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  abstract<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.AbstractKeyword, cond) as T;
  }
}

/**
 * Mixin that adds an `async` modifier to a node.
 */
export class AsyncMixin {
  /**
   * Adds the `async` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  async<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.AsyncKeyword, cond) as T;
  }
}

/**
 * Mixin that adds a `const` modifier to a node.
 */
export class ConstMixin {
  /**
   * Adds the `const` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  const<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.ConstKeyword, cond) as T;
  }
}

/**
 * Mixin that adds a `declare` modifier to a node.
 */
export class DeclareMixin {
  /**
   * Adds the `declare` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  declare<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.DeclareKeyword, cond) as T;
  }
}

/**
 * Mixin that adds a `default` modifier to a node.
 */
export class DefaultMixin {
  /**
   * Adds the `default` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  default<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.DefaultKeyword, cond) as T;
  }
}

/**
 * Mixin that adds an `export` modifier to a node.
 */
export class ExportMixin {
  /**
   * Adds the `export` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  export<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    if (this.symbol) this.symbol.setExported(cond);
    return this._m!(ts.SyntaxKind.ExportKeyword, cond) as T;
  }
}

/**
 * Mixin that adds an `override` modifier to a node.
 */
export class OverrideMixin {
  /**
   * Adds the `override` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  override<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.OverrideKeyword, cond) as T;
  }
}

/**
 * Mixin that adds a `private` modifier to a node.
 */
export class PrivateMixin {
  /**
   * Adds the `private` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  private<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.PrivateKeyword, cond) as T;
  }
}

/**
 * Mixin that adds a `protected` modifier to a node.
 */
export class ProtectedMixin {
  /**
   * Adds the `protected` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  protected<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.ProtectedKeyword, cond) as T;
  }
}

/**
 * Mixin that adds a `public` modifier to a node.
 */
export class PublicMixin {
  /**
   * Adds the `public` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  public<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.PublicKeyword, cond) as T;
  }
}

/**
 * Mixin that adds a `readonly` modifier to a node.
 */
export class ReadonlyMixin {
  /**
   * Adds the `readonly` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  readonly<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.ReadonlyKeyword, cond) as T;
  }
}

/**
 * Mixin that adds a `static` modifier to a node.
 */
export class StaticMixin {
  /**
   * Adds the `static` keyword modifier if the condition is true.
   *
   * @param condition - Whether to add the modifier (default: true).
   * @returns The target object for chaining.
   */
  static<T extends Target>(this: T, condition?: boolean): T {
    const cond = arguments.length === 0 ? true : Boolean(condition);
    return this._m!(ts.SyntaxKind.StaticKeyword, cond) as T;
  }
}
