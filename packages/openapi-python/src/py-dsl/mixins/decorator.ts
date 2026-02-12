import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

export interface DecoratorMethods extends Node {
  $decorators(): ReadonlyArray<py.Expression>;
  decorator(
    name: NodeName | MaybePyDsl<py.Expression>,
    ...args: ReadonlyArray<MaybePyDsl<py.Expression>>
  ): this;
}

export function DecoratorMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Decorator extends Base {
    protected decorators: Array<py.Expression> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      for (const decorator of this.decorators) {
        ctx.analyze(decorator);
      }
    }

    protected decorator(
      name: NodeName | MaybePyDsl<py.Expression>,
      ...args: ReadonlyArray<MaybePyDsl<py.Expression>>
    ): this {
      const nameNode =
        typeof name === 'string' || isPyNode(name)
          ? name
          : py.factory.createIdentifier(String(name));
      const decoratorExpr = args.length
        ? py.factory.createCallExpression(
            nameNode as py.Expression,
            args.map((a) => this.$node(a) as py.Expression),
          )
        : (nameNode as py.Expression);
      this.decorators.push(decoratorExpr);
      return this;
    }

    protected $decorators(): ReadonlyArray<py.Expression> {
      return this.decorators;
    }
  }

  return Decorator as unknown as MixinCtor<TBase, DecoratorMethods>;
}

function isPyNode(value: unknown): value is { toAst(): unknown } {
  return typeof value === 'object' && value !== null && 'toAst' in value;
}
