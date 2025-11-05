import type { ITsDsl } from '../base';
import { DescribeTsDsl } from '../describe';

export function DescribeMixin<
  TBase extends new (...args: ReadonlyArray<any>) => ITsDsl,
>(Base: TBase) {
  const Mixin = class extends Base {
    protected _desc?: DescribeTsDsl;

    describe(
      lines?: string | ReadonlyArray<string>,
      fn?: (d: DescribeTsDsl) => void,
    ): this {
      this._desc = new DescribeTsDsl(lines, fn);
      return this;
    }
  };

  const originalFn = Base.prototype.$render;

  Mixin.prototype.$render = function (...args: Parameters<ITsDsl['$render']>) {
    const node = originalFn.apply(this, args);
    return this._desc ? this._desc.apply(node) : node;
  };

  return Mixin;
}

export type DescribeMixin = InstanceType<ReturnType<typeof DescribeMixin>>;
