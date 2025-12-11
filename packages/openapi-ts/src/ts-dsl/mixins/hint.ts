import type { AnalysisContext, Node } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeArray } from '../base';
import { HintTsDsl } from '../layout/hint';
import type { BaseCtor, MixinCtor } from './types';

export interface HintMethods extends Node {
  $hint<T extends ts.Node>(node: T): T;
  hint(lines?: MaybeArray<string>, fn?: (h: HintTsDsl) => void): this;
}

export function HintMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Hint extends Base {
    private _hint?: HintTsDsl;

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected hint(
      lines?: MaybeArray<string>,
      fn?: (h: HintTsDsl) => void,
    ): this {
      this._hint = new HintTsDsl(lines, fn);
      return this;
    }

    protected $hint<T extends ts.Node>(node: T): T {
      return this._hint ? this._hint.apply(node) : node;
    }
  }

  return Hint as unknown as MixinCtor<TBase, HintMethods>;
}
