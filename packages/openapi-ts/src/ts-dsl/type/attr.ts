import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';

export class TypeAttrTsDsl extends TsDsl<ts.QualifiedName> {
  private _base?: string | MaybeTsDsl<ts.EntityName>;
  private right: string | ts.Identifier;

  constructor(
    base: string | MaybeTsDsl<ts.EntityName>,
    right: string | ts.Identifier,
  );
  constructor(right: string | ts.Identifier);
  constructor(
    baseOrRight: string | MaybeTsDsl<ts.EntityName>,
    maybeRight?: string | ts.Identifier,
  ) {
    super();
    if (maybeRight) {
      this.base(baseOrRight);
      this.right = maybeRight;
    } else {
      this.base(undefined);
      this.right = baseOrRight as string | ts.Identifier;
    }
  }

  base(base?: string | MaybeTsDsl<ts.EntityName>): this {
    this._base = base;
    return this;
  }

  $render(): ts.QualifiedName {
    if (!this._base) {
      throw new Error('TypeAttrTsDsl: missing base for qualified name');
    }
    const left = this.$node(this._base);
    if (!ts.isEntityName(left)) {
      throw new Error('TypeAttrTsDsl: base must be an EntityName');
    }
    const right = this.$maybeId(this.right);
    return ts.factory.createQualifiedName(left, right);
  }
}
