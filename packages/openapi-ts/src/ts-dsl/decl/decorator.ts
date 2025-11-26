import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';

export type DecoratorName = Symbol | string | MaybeTsDsl<ts.Expression>;

const Mixed = ArgsMixin(TsDsl<ts.Decorator>);

export class DecoratorTsDsl extends Mixed {
  protected name: DecoratorName;

  constructor(
    name: DecoratorName,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
  ) {
    super();
    this.name = name;
    this.args(...args);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this.name)) {
      ctx.addDependency(this.name);
    } else if (isTsDsl(this.name)) {
      this.name.analyze(ctx);
    }
  }

  protected override _render() {
    const target = this.$node(this.name);
    const args = this.$args();
    return ts.factory.createDecorator(
      args.length
        ? ts.factory.createCallExpression(target, undefined, args)
        : target,
    );
  }
}
