/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
import {
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  ReadonlyMixin,
  StaticMixin,
} from './mixins/modifiers';
import { createTypeAccessor } from './mixins/type';
import { ValueMixin } from './mixins/value';

export class FieldTsDsl extends TsDsl<ts.PropertyDeclaration> {
  private modifiers = createModifierAccessor(this);
  private name: string;
  private _type = createTypeAccessor(this);

  constructor(name: string, fn?: (f: FieldTsDsl) => void) {
    super();
    this.name = name;
    if (fn) fn(this);
  }

  /** Sets the property's type. */
  type = this._type.method;

  /** Builds the `PropertyDeclaration` node. */
  $render(): ts.PropertyDeclaration {
    return ts.factory.createPropertyDeclaration(
      [...(this.decorators ?? []), ...this.modifiers.list()],
      ts.factory.createIdentifier(this.name),
      undefined,
      this._type.$render(),
      this.$node(this.initializer),
    );
  }
}

export interface FieldTsDsl
  extends DecoratorMixin,
    DescribeMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    ReadonlyMixin,
    StaticMixin,
    ValueMixin {}
mixin(
  FieldTsDsl,
  DecoratorMixin,
  [DescribeMixin, { overrideRender: true }],
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  ReadonlyMixin,
  StaticMixin,
  ValueMixin,
);
