import { describe, expect, it } from 'vitest';

import { stripNamespace } from '../stripNamespace';

describe('stripNamespace', () => {
  it.each([
    { expected: 'Item', input: '#/definitions/Item' },
    { expected: 'Item', input: '#/parameters/Item' },
    { expected: 'Item', input: '#/responses/Item' },
    { expected: 'Item', input: '#/securityDefinitions/Item' },
    { expected: 'Item', input: '#/components/schemas/Item' },
    { expected: 'Item', input: '#/components/responses/Item' },
    { expected: 'Item', input: '#/components/parameters/Item' },
    { expected: 'Item', input: '#/components/examples/Item' },
    { expected: 'Item', input: '#/components/requestBodies/Item' },
    { expected: 'Item', input: '#/components/headers/Item' },
    { expected: 'Item', input: '#/components/securitySchemes/Item' },
    { expected: 'Item', input: '#/components/links/Item' },
    { expected: 'Item', input: '#/components/callbacks/Item' },
  ])('stripNamespace($input) -> $expected', ({ expected, input }) => {
    expect(stripNamespace(input)).toEqual(expected);
  });
});
