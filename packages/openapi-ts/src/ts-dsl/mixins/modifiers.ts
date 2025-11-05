import ts from 'typescript';

import type { TsDsl } from '../base';

export function createModifierAccessor<Parent extends TsDsl>(parent: Parent) {
  const modifiers: Array<ts.Modifier> = [];

  function _m(kind: ts.ModifierSyntaxKind, condition = true): Parent {
    if (condition) {
      modifiers.push(ts.factory.createModifier(kind));
    }
    return parent;
  }

  Object.assign(parent, { _m }); // attaches to parent

  function list() {
    return modifiers;
  }

  return { list };
}

type Target = object & {
  _m?(kind: ts.ModifierSyntaxKind, condition?: boolean): unknown;
};
export class AbstractMixin {
  abstract<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.AbstractKeyword, condition) as T;
  }
}
export class AsyncMixin {
  async<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.AsyncKeyword, condition) as T;
  }
}
export class DefaultMixin {
  default<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.DefaultKeyword, condition) as T;
  }
}
export class ExportMixin {
  export<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.ExportKeyword, condition) as T;
  }
}
export class PrivateMixin {
  private<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.PrivateKeyword, condition) as T;
  }
}
export class ProtectedMixin {
  protected<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.ProtectedKeyword, condition) as T;
  }
}
export class PublicMixin {
  public<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.PublicKeyword, condition) as T;
  }
}
export class ReadonlyMixin {
  readonly<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.ReadonlyKeyword, condition) as T;
  }
}
export class StaticMixin {
  static<T extends Target>(this: T, condition: boolean = true): T {
    return this._m!(ts.SyntaxKind.StaticKeyword, condition) as T;
  }
}
