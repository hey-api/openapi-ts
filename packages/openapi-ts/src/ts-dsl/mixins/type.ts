import type ts from 'typescript';

import type { TypeInput } from '../base';
import type { TsDsl } from '../base';
import { TypeTsDsl } from '../type';

/** Provides `.type()`-like access with internal state management. */
export function createTypeAccessor<Parent extends TsDsl>(parent: Parent) {
  const $type = parent['$type'].bind(parent);

  let _type: ReturnType<typeof TypeTsDsl> | undefined;
  let input: TypeInput | undefined;

  function $render(): ts.TypeNode | undefined {
    if (_type) {
      return _type.$render();
    }
    return $type(input);
  }

  function method(): ReturnType<typeof TypeTsDsl>;
  function method(type: TypeInput): Parent;
  function method(type?: TypeInput): ReturnType<typeof TypeTsDsl> | Parent {
    if (type === undefined) {
      if (!_type) _type = TypeTsDsl();
      return _type;
    }
    input = type;
    return parent;
  }

  return {
    $render,
    method,
  };
}
