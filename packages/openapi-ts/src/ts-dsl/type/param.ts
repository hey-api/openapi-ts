import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';

export class TypeParamTsDsl extends TypeTsDsl<ts.TypeParameterDeclaration> {
  protected name?: string | ts.Identifier;
  protected constraint?: string | MaybeTsDsl<TypeTsDsl> | boolean;
  protected defaultValue?: string | MaybeTsDsl<TypeTsDsl> | boolean;

  constructor(
    name?: string | ts.Identifier,
    fn?: (name: TypeParamTsDsl) => void,
  ) {
    super();
    this.name = name;
    fn?.(this);
  }

  default(value: string | MaybeTsDsl<TypeTsDsl> | boolean): this {
    this.defaultValue = value;
    return this;
  }

  extends(constraint: string | MaybeTsDsl<TypeTsDsl> | boolean): this {
    this.constraint = constraint;
    return this;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.TypeParameterDeclaration {
    if (!this.name) throw new Error('Missing type name');
    return ts.factory.createTypeParameterDeclaration(
      undefined,
      this.$maybeId(this.name),
      this.$type(this.constraint),
      this.$type(this.defaultValue),
    );
  }
}
