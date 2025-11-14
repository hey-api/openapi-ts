import ts from 'typescript';

import { operationPagination } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { PluginInstance } from '../types';
import { useTypeData, useTypeResponse } from '../useType';

const optionsParamName = 'options';

/**
 * Create useSWRInfinite options for a given operation with pagination support.
 *
 * This generates a wrapper function that accepts operation options and returns an object
 * compatible with SWR's useSWRInfinite hook signature:
 * - getKey: A function that generates SWR keys for each page
 * - fetcher: An async function that fetches a single page
 *
 * The getKey function signature matches SWR's requirements:
 * (pageIndex: number, previousPageData: ResponseType | null) => Key | null
 *
 * The key structure uses object serialization (since SWR 1.1.0):
 * [path, { ...options, [paginationParam]: pageIndex }]
 *
 * Usage with useSWRInfinite:
 * const { getKey, fetcher } = getUsersInfinite({ query: { status: 'active' } });
 * const { data, size, setSize } = useSWRInfinite(getKey, fetcher, {
 *   initialSize: 1,
 *   revalidateFirstPage: true,
 * });
 *
 * Example outputs:
 *
 * Without path params (optional):
 * export const getUsersInfinite = (options?: GetUsersData) => ({
 *   getKey: (pageIndex: number, previousPageData: GetUsersResponse | null) =>
 *     ['/users', { ...options, query: { ...options?.query, page: pageIndex } }],
 *   fetcher: async (key: readonly [string, GetUsersData]) => {
 *     const { data } = await getUsers({ ...key[1], throwOnError: true });
 *     return data;
 *   }
 * });
 *
 * With path params (options required):
 * export const getOrgUsersInfinite = (options: GetOrgUsersData) => ({
 *   getKey: (pageIndex: number, previousPageData: GetOrgUsersResponse | null) =>
 *     ['/orgs/{orgId}/users', { ...options, query: { ...options.query, page: pageIndex } }],
 *   fetcher: async (key: readonly [string, GetOrgUsersData]) => {
 *     const { data } = await getOrgUsers({ ...key[1], throwOnError: true });
 *     return data;
 *   }
 * });
 *
 * Note: The getKey function always returns a key array for each page. Use conditional
 * logic within getKey (checking previousPageData) to stop pagination, not to disable
 * the entire query. The key itself is never null - only returned when pagination ends.
 */
export const createSwrInfiniteOptions = ({
  operation,
  plugin,
  sdkFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  sdkFn: string;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  // Check if this operation supports pagination
  const pagination = operationPagination({
    context: plugin.context,
    operation,
  });

  // Only generate infinite options for operations with pagination
  if (!pagination) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  const typeData = useTypeData({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });

  // Create the getKey function
  // Following SWR's useSWRInfinite pattern with object serialization:
  // getKey: (pageIndex: number, previousPageData: ResponseType | null) => Key | null
  //
  // The getKey function returns: ['/path', { ...options, query: { ...query, page: pageIndex } }]
  // This leverages SWR 1.1.0+ automatic object serialization
  const getKeyStatements: Array<TsDsl<any>> = [];

  const hasQueryParams =
    operation.parameters?.query &&
    Object.keys(operation.parameters.query).length > 0;

  // Build the options object with pagination merged into query
  let paginatedOptions: TsDsl<any>;

  if (hasQueryParams) {
    // Merge pagination param into existing query params
    const queryAccess = isRequiredOptions
      ? $('options').attr('query')
      : $(
          ts.factory.createPropertyAccessChain(
            $('options').$render(),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier('query'),
          ),
        );

    const mergedQuery = $.object()
      .spread(queryAccess)
      .prop(pagination.name, 'pageIndex');

    paginatedOptions = $.object().spread('options').prop('query', mergedQuery);
  } else {
    // No existing query params, create query object with just pagination
    const queryObj = $.object().prop(pagination.name, 'pageIndex');

    paginatedOptions = $.object().spread('options').prop('query', queryObj);
  }

  // Create the key array: ['/path', paginatedOptions]
  const keyArrayExpr = $(
    ts.factory.createArrayLiteralExpression([
      $.literal(operation.path).$render(),
      paginatedOptions.$render(),
    ]),
  );

  // Return the key array
  getKeyStatements.push(keyArrayExpr.return());

  const getKeyFunction = $.func()
    .param('pageIndex', (p) => p.type('number'))
    .param('previousPageData', (p) => p.type(`${typeResponse} | null`))
    .do(...getKeyStatements);

  const getKeyNode = getKeyFunction.$render();

  // Create the fetcher function
  // Fetcher receives the key array: [path, options]
  // Since we pass the options object directly in the key, we can extract it easily
  const fetcherStatements: Array<TsDsl<any>> = [];

  // Extract options from key[1]
  const optionsFromKey = $(
    ts.factory.createElementAccessExpression(
      $('key').$render(),
      ts.factory.createNumericLiteral(1),
    ),
  );

  // Call SDK function with the options from the key
  const awaitSdkFn = $(sdkFn)
    .call(
      $.object().spread(optionsFromKey).prop('throwOnError', $.literal(true)),
    )
    .await();

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    fetcherStatements.push($.return(awaitSdkFn));
  } else {
    fetcherStatements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  // Build the fetcher key type: readonly [string, optionsType]
  // Much simpler since we pass the entire options object
  const keyType = `readonly [string, ${typeData}]`;

  const fetcherFunction = $.func()
    .async()
    .param('key', (p) => p.type(keyType))
    .do(...fetcherStatements);

  // Build the infinite options object
  const swrInfiniteOptionsObj = $.object()
    .pretty()
    .prop('getKey', $(getKeyNode))
    .prop('fetcher', fetcherFunction);

  // Register the infinite options symbol
  const symbolSwrInfiniteOptionsFn = plugin.registerSymbol({
    exported: plugin.config.swrInfiniteOptions.exported,
    meta: {
      category: 'hook',
      resource: 'operation',
      resourceId: operation.id,
      role: 'swrInfiniteOptions',
      tool: plugin.name,
    },
    name: buildName({
      config: plugin.config.swrInfiniteOptions,
      name: operation.id,
    }),
  });

  const statement = $.const(symbolSwrInfiniteOptionsFn.placeholder)
    .export(symbolSwrInfiniteOptionsFn.exported)
    .$if(
      plugin.config.comments && createOperationComment({ operation }),
      (c, v) => c.describe(v as Array<string>),
    )
    .assign(
      $.func()
        .param(optionsParamName, (p) =>
          p.optional(!isRequiredOptions).type(typeData),
        )
        .do($.return(swrInfiniteOptionsObj)),
    );

  plugin.setSymbolValue(symbolSwrInfiniteOptionsFn, statement);
};
