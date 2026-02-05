import type { AnalysisContext, Node, NodeName, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import type { BaseCtor, MixinCtor } from './types';

type Arg = NodeName | MaybePyDsl<py.Expression>;

export interface ArgsMethods extends Node {
  $args(): ReadonlyArray<py.Expression>;
  arg(arg: Arg | undefined): this;
  args(...args: ReadonlyArray<Arg | undefined>): this;
}

export function ArgsMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Args extends Base {
    protected _args: Array<Ref<Arg>> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      for (const arg of this._args) {
        ctx.analyze(arg);
      }
    }

    protected arg(arg: Arg | undefined): this {
      if (arg !== undefined) this._args.push(ref(arg));
      return this;
    }

    protected args(...args: ReadonlyArray<Arg | undefined>): this {
      this._args.push(
        ...args
          .filter((a): a is NonNullable<typeof a> => a !== undefined)
          .map((a) => ref(a as Arg)),
      );
      return this;
    }

    protected $args(): ReadonlyArray<py.Expression> {
      return this.$node(this._args).map((arg) => this.$node(arg) as py.Expression);
    }
  }

  return Args as unknown as MixinCtor<TBase, ArgsMethods>;
}
