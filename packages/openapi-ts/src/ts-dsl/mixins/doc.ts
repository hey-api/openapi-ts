import type { ITsDsl, MaybeArray } from '../base';
import { DocTsDsl } from '../doc';

export function DocMixin<
  TBase extends new (...args: ReadonlyArray<any>) => ITsDsl,
>(Base: TBase) {
  const Mixin = class extends Base {
    _doc?: DocTsDsl;

    doc(lines?: MaybeArray<string>, fn?: (d: DocTsDsl) => void): this {
      this._doc = new DocTsDsl(lines, fn);
      return this;
    }
  };

  const originalFn = Base.prototype.$render;

  Mixin.prototype.$render = function (...args: Parameters<ITsDsl['$render']>) {
    const node = originalFn.apply(this, args);
    return this._doc ? this._doc.apply(node) : node;
  };

  return Mixin;
}

export type DocMixin = InstanceType<ReturnType<typeof DocMixin>>;
