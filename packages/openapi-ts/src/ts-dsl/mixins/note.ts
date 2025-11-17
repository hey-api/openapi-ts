import type { ITsDsl, MaybeArray } from '../base';
import { NoteTsDsl } from '../note';

export function NoteMixin<
  TBase extends new (...args: ReadonlyArray<any>) => ITsDsl,
>(Base: TBase) {
  const $renderBase = Base.prototype.$render;

  class Mixin extends Base {
    _note?: NoteTsDsl;

    note(lines?: MaybeArray<string>, fn?: (h: NoteTsDsl) => void): this {
      this._note = new NoteTsDsl(lines, fn);
      return this;
    }

    override $render(...args: Parameters<ITsDsl['$render']>) {
      const node = $renderBase.apply(this, args);
      return this._note ? this._note.apply(node) : node;
    }
  }

  // @ts-expect-error
  Mixin.prototype.$render.mixin = true;

  return Mixin;
}

export type NoteMixin = InstanceType<ReturnType<typeof NoteMixin>>;
