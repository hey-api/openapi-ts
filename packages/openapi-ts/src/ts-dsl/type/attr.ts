import ts from 'typescript';

import type { MaybeTsDsl, WithString } from '../base';
import { TsDsl } from '../base';

export class TypeAttrTsDsl extends TsDsl<ts.QualifiedName> {
  private _base?: WithString<MaybeTsDsl<ts.EntityName>>;
  private right: WithString<ts.Identifier>;

  constructor(
    base: WithString<MaybeTsDsl<ts.EntityName>>,
    right: WithString<ts.Identifier>,
  );
  constructor(right: WithString<ts.Identifier>);
  constructor(
    baseOrRight: WithString<MaybeTsDsl<ts.EntityName>>,
    maybeRight?: WithString<ts.Identifier>,
  ) {
    super();
    if (maybeRight) {
      this.base(baseOrRight);
      this.right = maybeRight;
    } else {
      this.base(undefined);
      this.right = baseOrRight as WithString<ts.Identifier>;
    }
  }

  base(base?: WithString<MaybeTsDsl<ts.EntityName>>): this {
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
    const right = this.$expr(this.right);
    return ts.factory.createQualifiedName(left, right);
  }
}
