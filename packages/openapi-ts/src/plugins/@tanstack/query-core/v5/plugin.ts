import ts from 'typescript';

import { $, TsDsl } from '../../../../ts-dsl';
import type { PluginHandler, PluginInstance } from '../types';
import { createInfiniteQueryOptions } from './infiniteQueryOptions';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import { createUseMutation } from './useMutation';
import { createUseQuery } from './useQuery';

/**
 * A minimal TsDsl wrapper that emits a pre-built ts.TypeNode.
 * Used for conditional types which the DSL doesn't natively support.
 */
class RawTypeTsDsl extends TsDsl<ts.TypeNode> {
  readonly '~dsl' = 'RawTypeTsDsl';

  constructor(private readonly _node: ts.TypeNode) {
    super();
  }

  override toAst() {
    return this._node;
  }
}

/**
 * Creates a conditional type node:
 * `TStyle extends 'fields' ? trueType : falseType`
 */
const createConditionalType = (
  checkType: string,
  extendsLiteral: string,
  trueType: ts.TypeNode,
  falseType: ts.TypeNode,
): RawTypeTsDsl =>
  new RawTypeTsDsl(
    ts.factory.createConditionalTypeNode(
      ts.factory.createTypeReferenceNode(checkType),
      ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(extendsLiteral)),
      trueType,
      falseType,
    ),
  );

/**
 * Creates a type object `{ data: TData; request: Request; response: Response }` or
 * `{ error: TError; request: Request; response: Response }` as a raw ts.TypeNode.
 */
const createFieldsObjectType = (fieldName: string, typeParamName: string): ts.TypeNode =>
  ts.factory.createTypeLiteralNode([
    ts.factory.createPropertySignature(
      undefined,
      fieldName,
      undefined,
      ts.factory.createTypeReferenceNode(typeParamName),
    ),
    ts.factory.createPropertySignature(
      undefined,
      'request',
      undefined,
      ts.factory.createTypeReferenceNode('Request'),
    ),
    ts.factory.createPropertySignature(
      undefined,
      'response',
      undefined,
      ts.factory.createTypeReferenceNode('Response'),
    ),
  ]);

const createResponseStyleTypes = (defaultStyle: 'data' | 'fields', plugin: PluginInstance) => {
  const TData = 'TData';
  const TError = 'TError';
  const TStyle = 'TStyle';
  const styleUnion = $.type.or($.type.literal('data'), $.type.literal('fields'));

  // ResponseResult<TData, TStyle extends 'data' | 'fields' = '{defaultStyle}'> =
  //   TStyle extends 'fields'
  //     ? { data: TData; request: Request; response: Response }
  //     : TData;
  const symbolResponseResult = plugin.symbol('ResponseResult', {
    meta: {
      category: 'type',
      resource: 'ResponseResult',
      tool: plugin.name,
    },
  });
  const responseResultType = $.type
    .alias(symbolResponseResult)
    .generic(TData)
    .generic(TStyle, (g) => g.extends(styleUnion).default($.type.literal(defaultStyle)))
    .type(
      createConditionalType(
        TStyle,
        'fields',
        createFieldsObjectType('data', TData),
        ts.factory.createTypeReferenceNode(TData),
      ),
    );
  plugin.node(responseResultType);

  // ResponseError<TError, TStyle extends 'data' | 'fields' = '{defaultStyle}'> =
  //   TStyle extends 'fields'
  //     ? { error: TError; request: Request; response: Response }
  //     : TError;
  const symbolResponseError = plugin.symbol('ResponseError', {
    meta: {
      category: 'type',
      resource: 'ResponseError',
      tool: plugin.name,
    },
  });
  const responseErrorType = $.type
    .alias(symbolResponseError)
    .generic(TError)
    .generic(TStyle, (g) => g.extends(styleUnion).default($.type.literal(defaultStyle)))
    .type(
      createConditionalType(
        TStyle,
        'fields',
        createFieldsObjectType('error', TError),
        ts.factory.createTypeReferenceNode(TError),
      ),
    );
  plugin.node(responseErrorType);
};

export const handlerV5: PluginHandler = ({ plugin }) => {
  plugin.symbol('DefaultError', {
    external: plugin.name,
    kind: 'type',
  });
  plugin.symbol('InfiniteData', {
    external: plugin.name,
    kind: 'type',
  });
  const mutationsType =
    plugin.name === '@tanstack/angular-query-experimental' ||
    plugin.name === '@tanstack/svelte-query' ||
    plugin.name === '@tanstack/solid-query'
      ? 'MutationOptions'
      : 'UseMutationOptions';
  plugin.symbol(mutationsType, {
    external: plugin.name,
    kind: 'type',
    meta: {
      resource: `${plugin.name}.MutationOptions`,
    },
  });
  plugin.symbol('infiniteQueryOptions', {
    external: plugin.name,
  });
  plugin.symbol('queryOptions', {
    external: plugin.name,
  });
  plugin.symbol('useMutation', {
    external: plugin.name,
  });
  plugin.symbol('useQuery', {
    external: plugin.name,
  });
  plugin.symbol('AxiosError', {
    external: 'axios',
    kind: 'type',
  });

  // Generate ResponseResult and ResponseError utility types only when responseStyle is 'fields'
  if (plugin.config.responseStyle === 'fields') {
    // Default to 'data' so omitting responseStyle preserves backward-compatible behavior
    createResponseStyleTypes('data', plugin);
  }

  plugin.forEach(
    'operation',
    ({ operation }) => {
      if (plugin.hooks.operation.isQuery(operation)) {
        if (plugin.config.queryOptions.enabled) {
          createQueryOptions({ operation, plugin });
        }

        if (plugin.config.infiniteQueryOptions.enabled) {
          createInfiniteQueryOptions({ operation, plugin });
        }

        if ('useQuery' in plugin.config && plugin.config.useQuery.enabled) {
          createUseQuery({ operation, plugin });
        }
      }

      if (plugin.hooks.operation.isMutation(operation)) {
        if (plugin.config.mutationOptions.enabled) {
          createMutationOptions({ operation, plugin });
        }

        if ('useMutation' in plugin.config && plugin.config.useMutation.enabled) {
          createUseMutation({ operation, plugin });
        }
      }
    },
    {
      order: 'declarations',
    },
  );
};
