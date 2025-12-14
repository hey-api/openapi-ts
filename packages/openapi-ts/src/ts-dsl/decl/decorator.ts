import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { isSymbol, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';
import { safeRuntimeName } from '../utils/name';

export type DecoratorName = Symbol | string | MaybeTsDsl<ts.Expression>;

const Mixed = ArgsMixin(TsDsl<ts.Decorator>);

export class DecoratorTsDsl extends Mixed {
  readonly '~dsl' = 'DecoratorTsDsl';

  protected name: Ref<DecoratorName>;

  constructor(
    name: DecoratorName,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
  ) {
    super();
    this.name = ref(name);
    if (isSymbol(name)) {
      name.setNameSanitizer(safeRuntimeName);
    }
    this.args(...args);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.name);
  }

  override toAst(ctx: AstContext) {
    const target = this.$node(ctx, this.name);
    const args = this.$args(ctx);
    return ts.factory.createDecorator(
      args.length
        ? ts.factory.createCallExpression(target, undefined, args)
        : target,
    );
  }
}
