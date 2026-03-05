import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

type DecoratorInput = {
  args: ReadonlyArray<MaybePyDsl<py.Expression>>;
  name: NodeName | MaybePyDsl<py.Expression>;
};

export interface DecoratorMethods extends Node {
  $decorators(): ReadonlyArray<py.Expression>;
  decorator(name: DecoratorInput['name'], ...args: DecoratorInput['args']): this;
}

export function DecoratorMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Decorator extends Base {
    protected _decorators: Array<DecoratorInput> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      for (const decorator of this._decorators) {
        ctx.analyze(decorator.name);
        for (const arg of decorator.args) {
          ctx.analyze(arg);
        }
      }
    }

    protected decorator(name: DecoratorInput['name'], ...args: DecoratorInput['args']): this {
      this._decorators.push({ args, name });
      return this;
    }

    protected $decorators(): ReadonlyArray<py.Expression> {
      return this._decorators.map((decorator) =>
        decorator.args.length > 0
          ? py.factory.createCallExpression(this.$node(decorator.name), this.$node(decorator.args))
          : this.$node(decorator.name),
      );
    }
  }

  return Decorator as unknown as MixinCtor<TBase, DecoratorMethods>;
}
