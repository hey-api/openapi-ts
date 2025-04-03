import { describe, expect, it, vi } from 'vitest';

import type { Config } from '../../types/config';
import { operationPagination } from '../operation';
import { getPaginationKeywordsRegExp } from '../pagination';
import type { IR } from '../types';

describe('paginationKeywordsRegExp', () => {
  const defaultScenarios: Array<{
    result: boolean;
    value: string;
  }> = [
    {
      result: true,
      value: 'after',
    },
    {
      result: true,
      value: 'before',
    },
    {
      result: true,
      value: 'cursor',
    },
    {
      result: true,
      value: 'offset',
    },
    {
      result: true,
      value: 'page',
    },
    {
      result: true,
      value: 'start',
    },
    {
      result: false,
      value: 'my_start',
    },
    {
      result: false,
      value: 'start_my',
    },
  ];

  it.each(defaultScenarios)(
    'is $value pagination param? $output',
    async ({ result, value }) => {
      const paginationRegExp = getPaginationKeywordsRegExp();
      expect(paginationRegExp.test(value)).toEqual(result);
    },
  );

  const customScenarios: Array<{
    result: boolean;
    value: string;
  }> = [
    { result: true, value: 'customPagination' },
    { result: true, value: 'pageSize' },
    { result: true, value: 'perPage' },
    { result: false, value: 'page' },
  ];

  it.each(customScenarios)(
    'with custom config, $value should match? $result',
    async ({ result, value }) => {
      const pagination: Config['input']['pagination'] = {
        keywords: ['customPagination', 'pageSize', 'perPage'],
      };
      const paginationRegExp = getPaginationKeywordsRegExp(pagination);
      expect(paginationRegExp.test(value)).toEqual(result);
    },
  );
});

describe('operationPagination', () => {
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

  const emptyContext = {} as IR.Context;

  const baseOperationMeta = {
    method: 'post' as const,
    path: '/test' as const,
  };

  const queryScenarios: Array<{
    hasPagination: boolean;
    operation: IR.OperationObject;
  }> = [
    {
      hasPagination: true,
      operation: {
        ...baseOperationMeta,
        id: 'op1',
        method: 'get',
        parameters: {
          query: {
            page: queryParam('page', 'integer'),
            perPage: queryParam('perPage', 'integer'),
          },
        },
      },
    },
    {
      hasPagination: false,
      operation: {
        ...baseOperationMeta,
        id: 'op2',
        method: 'get',
        parameters: {
          query: {
            sort: queryParam('sort', 'string'),
          },
        },
      },
    },
  ];

  it.each(queryScenarios)(
    'query params for $operation.id → $hasPagination',
    ({ hasPagination, operation }) => {
      const result = operationPagination({ context: emptyContext, operation });
      expect(Boolean(result)).toEqual(hasPagination);
    },
  );

  it('body.pagination === true returns entire body', () => {
    const operation: IR.OperationObject = {
      ...baseOperationMeta,
      body: {
        mediaType: 'application/json',
        pagination: true,
        schema: {
          properties: {
            page: { type: 'integer' },
          },
          type: 'object',
        },
      },
      id: 'bodyTrue',
    };

    const result = operationPagination({ context: emptyContext, operation });

    expect(result?.in).toEqual('body');
    expect(result?.name).toEqual('body');
    expect(result?.schema?.type).toEqual('object');
  });

  it('body.pagination = "pagination" returns the matching property', () => {
    const operation: IR.OperationObject = {
      ...baseOperationMeta,
      body: {
        mediaType: 'application/json',
        pagination: 'pagination',
        schema: {
          properties: {
            pagination: {
              properties: {
                page: { type: 'integer' },
              },
              type: 'object',
            },
          },
          type: 'object',
        },
      },
      id: 'bodyField',
    };

    const result = operationPagination({ context: emptyContext, operation });

    expect(result?.in).toEqual('body');
    expect(result?.name).toEqual('pagination');
    expect(result?.schema?.type).toEqual('object');
  });

  it('resolves $ref and uses the resolved pagination property', () => {
    const context: IR.Context = {
      resolveIrRef: vi.fn().mockReturnValue({
        properties: {
          pagination: {
            properties: {
              page: { type: 'integer' },
            },
            type: 'object',
          },
        },
        type: 'object',
      }),
    } as unknown as IR.Context;

    const operation: IR.OperationObject = {
      ...baseOperationMeta,
      body: {
        mediaType: 'application/json',
        pagination: 'pagination',
        schema: { $ref: '#/components/schemas/PaginationBody' },
      },
      id: 'refPagination',
    };

    const result = operationPagination({ context, operation });

    expect(context.resolveIrRef).toHaveBeenCalledWith(
      '#/components/schemas/PaginationBody',
    );
    expect(result?.in).toEqual('body');
    expect(result?.name).toEqual('pagination');
    expect(result?.schema?.type).toEqual('object');
  });

  it('falls back to query when pagination key not found in body', () => {
    const operation: IR.OperationObject = {
      ...baseOperationMeta,
      body: {
        mediaType: 'application/json',
        pagination: 'pagination',
        schema: {
          properties: {
            notPagination: { type: 'string' },
          },
          type: 'object',
        },
      },
      id: 'fallback',
      parameters: {
        query: {
          cursor: queryParam('cursor', 'string'),
        },
      },
    };

    const result = operationPagination({ context: emptyContext, operation });

    expect(result?.in).toEqual('query');
    expect(result?.schema?.properties?.cursor).toBeDefined();
  });
});
