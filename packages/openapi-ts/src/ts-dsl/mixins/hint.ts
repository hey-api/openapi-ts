import type ts from 'typescript';

import type { MaybeArray } from '../base';
import { HintTsDsl } from '../layout/hint';
import type { BaseCtor, MixinCtor } from './types';

export interface HintMethods {
  hint(lines?: MaybeArray<string>, fn?: (h: HintTsDsl) => void): this;
}

export function HintMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Hint extends Base {
    protected _hint?: HintTsDsl;

    protected hint(
      lines?: MaybeArray<string>,
      fn?: (h: HintTsDsl) => void,
    ): this {
      this._hint = new HintTsDsl(lines, fn);
      return this;
    }

    protected override _render() {
      const node = this.$render();
      return this._hint ? this._hint.apply(node) : node;
    }
  }

  return Hint as unknown as MixinCtor<TBase, HintMethods>;
}
