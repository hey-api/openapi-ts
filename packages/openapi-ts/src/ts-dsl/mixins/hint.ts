import type { ITsDsl, MaybeArray } from '../base';
import { HintTsDsl } from '../layout/hint';

export function HintMixin<
  TBase extends new (...args: ReadonlyArray<any>) => ITsDsl,
>(Base: TBase) {
  const $renderBase = Base.prototype.$render;

  class Mixin extends Base {
    _hint?: HintTsDsl;

    hint(lines?: MaybeArray<string>, fn?: (h: HintTsDsl) => void): this {
      this._hint = new HintTsDsl(lines, fn);
      return this;
    }

    override $render(...args: Parameters<ITsDsl['$render']>) {
      const node = $renderBase.apply(this, args);
      return this._hint ? this._hint.apply(node) : node;
    }
  }

  // @ts-expect-error
  Mixin.prototype.$render.mixin = true;

  return Mixin;
}

export type HintMixin = InstanceType<ReturnType<typeof HintMixin>>;
