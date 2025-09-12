import { describe, expect, it } from 'vitest';

import { toCase, transformKeysDeep } from '../caseTransform';

describe('transformKeysDeep', () => {
  it('transforms plain object keys snake_case -> camelCase', () => {
    const input = { foo_bar: 1, nested_obj: { inner_key: 2 } };
    const out = transformKeysDeep(input, toCase('camelCase')) as any;
    expect(out).toEqual({ fooBar: 1, nestedObj: { innerKey: 2 } });
  });

  it('transforms arrays of objects', () => {
    const input = { items: [{ foo_bar: 1 }, { foo_bar: 2 }] };
    const out = transformKeysDeep(input, toCase('camelCase')) as any;
    expect(out).toEqual({ items: [{ fooBar: 1 }, { fooBar: 2 }] });
  });

  it('preserves primitives and non-objects', () => {
    expect(transformKeysDeep(null, toCase('camelCase'))).toBeNull();
    expect(transformKeysDeep(5, toCase('camelCase'))).toBe(5);
    expect(transformKeysDeep('x', toCase('camelCase'))).toBe('x');
  });

  it('transforms camelCase -> snake_case', () => {
    const input = { fooBar: 1, nestedObj: { innerKey: 2 } };
    const out = transformKeysDeep(input, toCase('snake_case')) as any;
    expect(out).toEqual({ foo_bar: 1, nested_obj: { inner_key: 2 } });
  });
});
