import { describe, expect, it, vi } from 'vitest';

import { defaultPaginationKeywords } from '~/config/parser';
import type { Config } from '~/types/config';

import type { Context } from '../context';
import { operationPagination } from '../operation';
import { getPaginationKeywordsRegExp } from '../pagination';
import type { IR } from '../types';

describe('paginationKeywordsRegExp', () => {
  const defaultScenarios: ReadonlyArray<{
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
      const paginationRegExp = getPaginationKeywordsRegExp({
        keywords: defaultPaginationKeywords,
      });
      expect(paginationRegExp.test(value)).toEqual(result);
    },
  );

  const customScenarios: ReadonlyArray<{
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
      const pagination: Config['parser']['pagination'] = {
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
    pagination = false,
  ): IR.ParameterObject => ({
    explode: true,
    location: 'query',
    name,
    schema: { type },
    style: 'form',
    ...(pagination ? { pagination: true } : {}),
  });

  const emptyContext = {} as Context;

  const baseOperationMeta = {
    method: 'post' as const,
    path: '/test' as const,
  };

  const queryScenarios: ReadonlyArray<{
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
            page: queryParam('page', 'integer', true),
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
    {
      hasPagination: true,
      operation: {
        ...baseOperationMeta,
        id: 'op3',
        method: 'get',
        parameters: {
          query: {
            pagesize: queryParam('pageSize', 'string', true),
          },
        },
      },
    },
  ];

  it.each(queryScenarios)(
    'query params for $operation.id → $hasPagination',
    ({ hasPagination, operation }: (typeof queryScenarios)[number]) => {
      const pagination = operationPagination({
        context: emptyContext,
        operation,
      });
      expect(Boolean(pagination)).toEqual(hasPagination);
      if (pagination && pagination.in !== 'body') {
        const parameter =
          operation.parameters?.[pagination.in]?.[
            pagination.name.toLocaleLowerCase()
          ];
        if (parameter) {
          expect(pagination.name).toBe(parameter.name);
        }
      }
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
    const context: Context = {
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
    } as unknown as Context;

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
          cursor: queryParam('cursor', 'string', true),
        },
      },
    };

    const result = operationPagination({ context: emptyContext, operation });

    expect(result?.in).toEqual('query');
    expect(result?.name).toEqual('cursor');
    expect(result?.schema?.type).toEqual('string');
  });
});
