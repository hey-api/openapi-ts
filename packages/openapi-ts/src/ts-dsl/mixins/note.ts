import type { ITsDsl, MaybeArray } from '../base';
import { NoteTsDsl } from '../note';

export function NoteMixin<
  TBase extends new (...args: ReadonlyArray<any>) => ITsDsl,
>(Base: TBase) {
  const Mixin = class extends Base {
    _note?: NoteTsDsl;

    note(lines?: MaybeArray<string>, fn?: (h: NoteTsDsl) => void): this {
      this._note = new NoteTsDsl(lines, fn);
      return this;
    }
  };

  const originalFn = Base.prototype.$render;

  Mixin.prototype.$render = function (...args: Parameters<ITsDsl['$render']>) {
    const node = originalFn.apply(this, args);
    return this._note ? this._note.apply(node) : node;
  };

  return Mixin;
}

export type NoteMixin = InstanceType<ReturnType<typeof NoteMixin>>;
