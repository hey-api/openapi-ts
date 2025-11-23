/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import type { AsyncMixin } from '../mixins/modifiers';
import {
  AbstractMixin,
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from '../mixins/modifiers';
import { ParamMixin } from '../mixins/param';

export class GetterTsDsl extends TsDsl<ts.GetAccessorDeclaration> {
  protected modifiers = createModifierAccessor(this);
  protected name: string | ts.PropertyName;

  constructor(name: string | ts.PropertyName, fn?: (g: GetterTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.GetAccessorDeclaration {
    return ts.factory.createGetAccessorDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      this.name,
      this.$params(),
      undefined,
      ts.factory.createBlock(this.$do(), true),
    );
  }
}

export interface GetterTsDsl
  extends AbstractMixin,
    AsyncMixin,
    DecoratorMixin,
    DoMixin,
    DocMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    StaticMixin {}
mixin(
  GetterTsDsl,
  AbstractMixin,
  DecoratorMixin,
  DoMixin,
  DocMixin,
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
);
