import type { AnalysisContext, Node, NodeName } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import { IdPyDsl } from '../expr/identifier';
import type { BaseCtor, MixinCtor } from './types';

export interface ReturnsMethods extends Node {
  $returns(): py.Expression | undefined;
  returns(type: NodeName | py.Expression): this;
}

export function ReturnsMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Returns extends Base {
    protected _returns?: IdPyDsl | py.Expression;

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      ctx.analyze(this._returns);
    }

    returns(type: NodeName | py.Expression): this {
      if (typeof type === 'string' || isSymbol(type)) {
        this._returns = new IdPyDsl(type);
      } else {
        this._returns = type as py.Expression;
      }
      return this;
    }

    protected $returns(): py.Expression | undefined {
      if (!this._returns) {
        return;
      }
      if (this._returns instanceof IdPyDsl) {
        return this._returns.toAst();
      }
      return this._returns as py.Expression;
    }
  }

  return Returns as unknown as MixinCtor<TBase, ReturnsMethods>;
}
