import { describe, expect, it } from 'vitest';

import { hasOperationPathOrQueryAny } from '../operation';
import type { IR } from '../types';

describe('hasOperationPathOrQueryAny', () => {
  const baseOperationMeta = {
    method: 'get' as const,
    path: '/test' as const,
  };

  const queryParam = (
    name: string,
    type: IR.SchemaObject['type'] = 'string',
  ): IR.ParameterObject => ({
    explode: true,
    location: 'query',
    name,
    schema: { type },
    style: 'form',
  });

  const pathParam = (
    name: string,
    type: IR.SchemaObject['type'] = 'string',
  ): IR.ParameterObject => ({
    explode: false,
    location: 'path',
    name,
    schema: { type },
    style: 'simple',
  });

  const op = (partial: Partial<IR.OperationObject>): IR.OperationObject => ({
    id: partial.id ?? 'op',
    ...baseOperationMeta,
    ...partial,
  });

  const scenarios: ReadonlyArray<{
    expected: boolean;
    operation: IR.OperationObject;
  }> = [
    {
      expected: false,
      operation: op({ id: 'noParams' }),
    },
    {
      expected: false,
      operation: op({
        id: 'emptyParams',
        parameters: {} as unknown as IR.OperationObject['parameters'],
      }),
    },
    {
      expected: false,
      operation: op({
        id: 'emptyPathAndQuery',
        parameters: {
          path: {},
          query: {},
        } as unknown as IR.OperationObject['parameters'],
      }),
    },
    {
      expected: true,
      operation: op({
        id: 'pathOnly',
        parameters: {
          path: { id: pathParam('id') },
        } as unknown as IR.OperationObject['parameters'],
      }),
    },
    {
      expected: true,
      operation: op({
        id: 'queryOnly',
        parameters: {
          query: { q: queryParam('q') },
        } as unknown as IR.OperationObject['parameters'],
      }),
    },
    {
      expected: true,
      operation: op({
        id: 'bothPathAndQuery',
        parameters: {
          path: { id: pathParam('id') },
          query: { q: queryParam('q') },
        } as unknown as IR.OperationObject['parameters'],
      }),
    },
    {
      expected: false,
      operation: op({
        body: {
          mediaType: 'application/json',
          required: true,
          schema: { type: 'object' },
        },
        id: 'bodyOnly',
      }),
    },
  ];

  it.each(scenarios)(
    'path/query presence for $operation.id → $expected',
    ({ expected, operation }: (typeof scenarios)[number]) => {
      expect(hasOperationPathOrQueryAny(operation)).toEqual(expected);
    },
  );
});
