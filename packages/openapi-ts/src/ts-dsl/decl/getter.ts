import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import {
  AbstractMixin,
  AsyncMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from '../mixins/modifiers';
import { ParamMixin } from '../mixins/param';

const Mixed = AbstractMixin(
  AsyncMixin(
    DecoratorMixin(
      DoMixin(
        DocMixin(
          ParamMixin(
            PrivateMixin(
              ProtectedMixin(
                PublicMixin(StaticMixin(TsDsl<ts.GetAccessorDeclaration>)),
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);

export class GetterTsDsl extends Mixed {
  protected name: string | ts.PropertyName;

  constructor(name: string | ts.PropertyName, fn?: (g: GetterTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createGetAccessorDeclaration(
      [...this.$decorators(), ...this.modifiers],
      this.name,
      this.$params(),
      undefined,
      ts.factory.createBlock(this.$do(), true),
    );
  }
}
