import type { ITsDsl, MaybeArray } from '../base';
import { HintTsDsl } from '../hint';

export function HintMixin<
  TBase extends new (...args: ReadonlyArray<any>) => ITsDsl,
>(Base: TBase) {
  const Mixin = class extends Base {
    _hint?: HintTsDsl;

    hint(lines?: MaybeArray<string>, fn?: (h: HintTsDsl) => void): this {
      this._hint = new HintTsDsl(lines, fn);
      return this;
    }
  };

  const originalFn = Base.prototype.$render;

  Mixin.prototype.$render = function (...args: Parameters<ITsDsl['$render']>) {
    const node = originalFn.apply(this, args);
    return this._hint ? this._hint.apply(node) : node;
  };

  return Mixin;
}

export type HintMixin = InstanceType<ReturnType<typeof HintMixin>>;
