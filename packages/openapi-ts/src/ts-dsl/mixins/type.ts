import type ts from 'typescript';

import type { MaybeTsDsl, TsDsl } from '../base';
import { type as TypeDsl } from '../type';

export type Type<This extends TsDsl> = {
  $render(): ts.TypeNode | undefined;
  fn(expr: MaybeTsDsl<ts.TypeNode | string>): This;
}

/** Provides access to `TypeTsDsl` on an arbitrary method. */
export function createType<This extends TsDsl>(_this: This): Type<This> {
  let _type: MaybeTsDsl<ts.TypeNode | string> | undefined;

  function _fn(expr: MaybeTsDsl<ts.TypeNode | string>): This {
    _type = TypeDsl(expr)
    return _this;
  }

  function $render(): ts.TypeNode | undefined {
    return _this['$type'](_type)
  }

  return {
    $render,
    fn: _fn,
  };
}
