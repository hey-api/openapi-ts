import ts from "typescript";

import { TsDsl, type WithString } from "../base";

export class TypeParamTsDsl extends TsDsl<ts.TypeParameterDeclaration> {
  constructor(
    _name?: WithString<ts.Identifier>,
    fn?: (base: TypeParamTsDsl) => void,
  ) {
    super();
    fn?.(this);
  }

  $render(): ts.TypeParameterDeclaration {
    // if (!this.base) throw new Error('Missing type name');
    return ts.factory.createTypeParameterDeclaration(
      undefined,
      'todo',
      // this.base as ts.Identifier,
      // this.$type(this.constraint),
      // this.$type(this.defaultValue),
    );
  }
}
