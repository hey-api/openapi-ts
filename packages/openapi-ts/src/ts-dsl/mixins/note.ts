import type { Constructor, ITsDsl, MaybeArray } from '../base';
import { NoteTsDsl } from '../layout/note';

export function NoteMixin<TBase extends Constructor>(Base: TBase) {
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

  return Mixin;
}

export type NoteMixin = InstanceType<ReturnType<typeof NoteMixin>>;
