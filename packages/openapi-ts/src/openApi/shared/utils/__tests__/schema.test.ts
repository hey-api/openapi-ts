import { describe, expect, it } from 'vitest';

import { mergeSchemaAccessScopes } from '../schema';

describe('mergeSchemaAccessScopes', () => {
  const scenarios: Array<{
    a: ReadonlyArray<'read' | 'write'> | undefined;
    b: ReadonlyArray<'read' | 'write'> | undefined;
    result: ReadonlyArray<'read' | 'write'> | undefined;
  }> = [
    {
      a: undefined,
      b: undefined,
      result: undefined,
    },
    {
      a: undefined,
      b: ['read'],
      result: ['read'],
    },
    {
      a: ['read'],
      b: undefined,
      result: ['read'],
    },
    {
      a: ['read'],
      b: ['write'],
      result: ['read', 'write'],
    },
    {
      a: ['read', 'write'],
      b: ['read', 'write'],
      result: ['read', 'write'],
    },
  ];

  it.each(scenarios)('$a and $b -> $result', ({ a, b, result }) => {
    expect(mergeSchemaAccessScopes(a, b)).toEqual(result);
  });
});
