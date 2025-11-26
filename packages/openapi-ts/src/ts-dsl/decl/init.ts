import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import { PrivateMixin, ProtectedMixin, PublicMixin } from '../mixins/modifiers';
import { ParamMixin } from '../mixins/param';

const Mixed = DecoratorMixin(
  DoMixin(
    DocMixin(
      ParamMixin(
        PrivateMixin(
          ProtectedMixin(PublicMixin(TsDsl<ts.ConstructorDeclaration>)),
        ),
      ),
    ),
  ),
);

export class InitTsDsl extends Mixed {
  constructor(fn?: (i: InitTsDsl) => void) {
    super();
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  protected override _render() {
    return ts.factory.createConstructorDeclaration(
      [...this.$decorators(), ...this.modifiers],
      this.$params(),
      ts.factory.createBlock(this.$do(), true),
    );
  }
}
