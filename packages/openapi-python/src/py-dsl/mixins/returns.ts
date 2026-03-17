import type { AnalysisContext, Node, NodeName, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';

import type { py } from '../../py-compiler';
import type { BaseCtor, MixinCtor } from './types';

export interface ReturnsMethods extends Node {
  $returns(): py.Expression | undefined;
  returns(type: NodeName | py.Expression): this;
}

export function ReturnsMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Returns extends Base {
    protected _returns?: Ref<NodeName | py.Expression>;

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      ctx.analyze(this._returns);
    }

    returns(type: NodeName | py.Expression): this {
      this._returns = ref(type);
      return this;
    }

    protected $returns(): py.Expression | undefined {
      return this.$node(this._returns);
    }
  }

  return Returns as unknown as MixinCtor<TBase, ReturnsMethods>;
}
