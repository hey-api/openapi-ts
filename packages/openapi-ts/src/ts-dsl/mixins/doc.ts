import type { ITsDsl, MaybeArray } from '../base';
import { DocTsDsl } from '../layout/doc';

export function DocMixin<
  TBase extends new (...args: ReadonlyArray<any>) => ITsDsl,
>(Base: TBase) {
  const $renderBase = Base.prototype.$render;

  class Mixin extends Base {
    _doc?: DocTsDsl;

    doc(lines?: MaybeArray<string>, fn?: (d: DocTsDsl) => void): this {
      this._doc = new DocTsDsl(lines, fn);
      return this;
    }

    override $render(...args: Parameters<ITsDsl['$render']>) {
      const node = $renderBase.apply(this, args);
      return this._doc ? this._doc.apply(node) : node;
    }
  }

  // @ts-expect-error
  Mixin.prototype.$render.mixin = true;

  return Mixin;
}

export type DocMixin = InstanceType<ReturnType<typeof DocMixin>>;
