import type { AnalysisContext } from '@hey-api/codegen-core';
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
import { BlockTsDsl } from '../stmt/block';

export type GetterName = string | ts.PropertyName;

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
  readonly '~dsl' = 'GetterTsDsl';

  protected name: GetterName;

  constructor(name: GetterName, fn?: (g: GetterTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    ctx.pushScope();
    try {
      super.analyze(ctx);
    } finally {
      ctx.popScope();
    }
  }

  override toAst() {
    const node = ts.factory.createGetAccessorDeclaration(
      [...this.$decorators(), ...this.modifiers],
      this.name,
      this.$params(),
      undefined,
      this.$node(new BlockTsDsl(...this._do)),
    );
    return this.$docs(node);
  }
}
