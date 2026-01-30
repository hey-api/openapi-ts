import type { AnalysisContext, Node } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import type { HintFn, HintLines } from '../layout/hint';
import { HintPyDsl } from '../layout/hint';
import type { BaseCtor, MixinCtor } from './types';

export interface HintMethods extends Node {
  $hint<T extends py.Node>(node: T): T;
  hint(lines?: HintLines, fn?: HintFn): this;
}

export function HintMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Hint extends Base {
    private _hint?: HintPyDsl;

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected hint(lines?: HintLines, fn?: HintFn): this {
      this._hint = new HintPyDsl(lines, fn);
      return this;
    }

    protected $hint<T extends py.Node>(node: T): T {
      return this._hint ? this._hint.apply(node) : node;
    }
  }

  return Hint as unknown as MixinCtor<TBase, HintMethods>;
}
