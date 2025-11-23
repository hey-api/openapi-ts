import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DocMixin } from '../mixins/doc';
import {
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  ReadonlyMixin,
  StaticMixin,
} from '../mixins/modifiers';
import { ValueMixin } from '../mixins/value';
import { TypeExprTsDsl } from '../type/expr';

const Mixed = DecoratorMixin(
  DocMixin(
    PrivateMixin(
      ProtectedMixin(
        PublicMixin(
          ReadonlyMixin(StaticMixin(ValueMixin(TsDsl<ts.PropertyDeclaration>))),
        ),
      ),
    ),
  ),
);

export class FieldTsDsl extends Mixed {
  protected name: string;
  protected _type?: TypeTsDsl;

  constructor(name: string, fn?: (f: FieldTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  /** Sets the field type. */
  type(type: string | TypeTsDsl): this {
    this._type = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  protected override _render() {
    return ts.factory.createPropertyDeclaration(
      [...this.$decorators(), ...this.modifiers],
      this.name,
      undefined,
      this.$type(this._type),
      this.$value(),
    );
  }
}
