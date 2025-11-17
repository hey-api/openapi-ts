import ts from 'typescript';

import type { MaybeTsDsl, WithString } from '../base';
import { TypeTsDsl } from '../base';

export class TypeParamTsDsl extends TypeTsDsl<ts.TypeParameterDeclaration> {
  protected name?: WithString<ts.Identifier>;
  protected constraint?: WithString<MaybeTsDsl<TypeTsDsl>> | boolean;
  protected defaultValue?: WithString<MaybeTsDsl<TypeTsDsl>> | boolean;

  constructor(
    name?: WithString<ts.Identifier>,
    fn?: (name: TypeParamTsDsl) => void,
  ) {
    super();
    this.name = name;
    fn?.(this);
  }

  default(value: WithString<MaybeTsDsl<TypeTsDsl>> | boolean): this {
    this.defaultValue = value;
    return this;
  }

  extends(constraint: WithString<MaybeTsDsl<TypeTsDsl>> | boolean): this {
    this.constraint = constraint;
    return this;
  }

  $render(): ts.TypeParameterDeclaration {
    if (!this.name) throw new Error('Missing type name');
    return ts.factory.createTypeParameterDeclaration(
      undefined,
      this.$expr(this.name),
      this.$type(this.constraint),
      this.$type(this.defaultValue),
    );
  }
}
