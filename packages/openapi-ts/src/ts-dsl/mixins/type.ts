import type ts from 'typescript';

import type { TsDsl } from '../base';
import type { TypeInput } from '../type';
import { TypeTsDsl } from '../type';

export interface TypeAccessor<Parent extends TsDsl> {
  $render(): ts.TypeNode | undefined;
  fn(): ReturnType<typeof TypeTsDsl>;
  fn(type: TypeInput): Parent;
}

/** Provides `.type()`-like access with internal state management. */
export function createTypeAccessor<Parent extends TsDsl>(
  parent: Parent,
): TypeAccessor<Parent> {
  const $type = parent['$type'].bind(parent);

  let _type: ReturnType<typeof TypeTsDsl> | undefined;
  let input: TypeInput | undefined;

  function fn(): ReturnType<typeof TypeTsDsl>;
  function fn(type: TypeInput): Parent;
  function fn(type?: TypeInput): ReturnType<typeof TypeTsDsl> | Parent {
    if (type === undefined) {
      if (!_type) _type = TypeTsDsl();
      return _type;
    }
    input = type;
    return parent;
  }

  function $render(): ts.TypeNode | undefined {
    return _type?.$render() ?? $type(input);
  }

  return {
    $render,
    fn,
  };
}
