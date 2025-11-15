/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DocMixin } from './mixins/doc';
import {
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  ReadonlyMixin,
  StaticMixin,
} from './mixins/modifiers';
import { ValueMixin } from './mixins/value';
import { TypeExprTsDsl } from './type/expr';

export class FieldTsDsl extends TsDsl<ts.PropertyDeclaration> {
  private modifiers = createModifierAccessor(this);
  private name: string;
  private _type?: TypeTsDsl;

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

  /** Builds the `PropertyDeclaration` node. */
  $render(): ts.PropertyDeclaration {
    return ts.factory.createPropertyDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      this.$expr(this.name),
      undefined,
      this.$type(this._type),
      this.$value(),
    );
  }
}

export interface FieldTsDsl
  extends DecoratorMixin,
    DocMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    ReadonlyMixin,
    StaticMixin,
    ValueMixin {}
mixin(
  FieldTsDsl,
  DecoratorMixin,
  [DocMixin, { overrideRender: true }],
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  ReadonlyMixin,
  StaticMixin,
  ValueMixin,
);
