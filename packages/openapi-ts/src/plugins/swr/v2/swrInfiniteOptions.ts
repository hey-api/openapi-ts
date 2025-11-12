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
 * The key structure uses primitive values for optimal caching:
 * [path, ...pathParams, queryObject]
 *
 * Optional parameters use optional chaining (options?.query) for safe access.
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
 *     ['/users', { ...options?.query, page: pageIndex }],
 *   fetcher: async (key: readonly [string, GetUsersData['query']]) => {
 *     const params = { query: key[1] };
 *     const { data } = await getUsers({ ...params, throwOnError: true });
 *     return data;
 *   }
 * });
 *
 * With path params (options required):
 * export const getOrgUsersInfinite = (options: GetOrgUsersData) => ({
 *   getKey: (pageIndex: number, previousPageData: GetOrgUsersResponse | null) =>
 *     ['/orgs/{orgId}/users', options.path.orgId, { ...options.query, page: pageIndex }],
 *   fetcher: async (key: readonly [string, string, GetOrgUsersData['query']]) => {
 *     const params = { path: { orgId: key[1] }, query: key[2] };
 *     const { data } = await getOrgUsers({ ...params, throwOnError: true });
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
  // Following SWR's useSWRInfinite pattern:
  // getKey: (pageIndex: number, previousPageData: ResponseType | null) => Key | null
  //
  // The getKey function should:
  // 1. Return null to stop fetching (when previousPageData is empty/end reached)
  // 2. Return key array with primitive values for each page
  // 3. Match the pattern from swrKey.ts: ['/path', ...pathParams, queryObject]
  const getKeyStatements: Array<TsDsl<any>> = [];

  // Build the key array following the same pattern as regular keys
  const pathParams = operation.parameters?.path || {};
  const hasQueryParams =
    operation.parameters?.query &&
    Object.keys(operation.parameters.query).length > 0;

  const keyElements: ts.Expression[] = [$.literal(operation.path).$render()];

  // Extract each path parameter as a separate primitive value
  for (const key in pathParams) {
    const parameter = pathParams[key]!;
    // Use optional chaining if options is optional
    if (isRequiredOptions) {
      keyElements.push(
        $('options').attr('path').attr(parameter.name).$render(),
      );
    } else {
      // Create options?.path.{paramName} with optional chaining
      keyElements.push(
        $(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessChain(
              $('options').$render(),
              ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
              ts.factory.createIdentifier('path'),
            ),
            ts.factory.createIdentifier(parameter.name),
          ),
        ).$render(),
      );
    }
  }

  // For query parameters, merge with pagination
  if (hasQueryParams) {
    // Create merged query object: { ...options?.query, [paginationName]: pageIndex }
    // Need to use optional chaining for options.query when options is optional
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
    keyElements.push(mergedQuery.$render());
  } else {
    // If no existing query params, just add pagination as an object
    keyElements.push($.object().prop(pagination.name, 'pageIndex').$render());
  }

  // Create the array: ['/path', ...pathParams, queryWithPagination]
  const keyArrayExpr = $(ts.factory.createArrayLiteralExpression(keyElements));

  // Return the key array
  getKeyStatements.push(keyArrayExpr.return());

  const getKeyFunction = $.func()
    .param('pageIndex', (p) => p.type('number'))
    .param('previousPageData', (p) => p.type(`${typeResponse} | null`))
    .do(...getKeyStatements);

  // Create the fetcher function
  // Fetcher receives the key array and reconstructs the options object
  const fetcherStatements: Array<TsDsl<any>> = [];

  // Reconstruct the options object from the key array
  // Key structure: ['/path', ...pathParams, queryObj]
  // We need to build: { path: { param1: value1, ... }, query: queryObj }
  const pathParamsCount = Object.keys(pathParams).length;

  // Build the reconstructed options object
  let reconstructedOptions = $.object();

  // Add path params if they exist
  if (pathParamsCount > 0) {
    let pathObj = $.object();
    let paramIndex = 1; // Start after the path string
    for (const key in pathParams) {
      const parameter = pathParams[key]!;
      // Create element access: key[index]
      const elementAccess = $(
        ts.factory.createElementAccessExpression(
          $('key').$render(),
          ts.factory.createNumericLiteral(paramIndex),
        ),
      );
      pathObj = pathObj.prop(parameter.name, elementAccess);
      paramIndex++;
    }
    reconstructedOptions = reconstructedOptions.prop('path', pathObj);
  }

  // Add query params (last element in key array)
  // Query is at index: 1 + pathParamsCount
  const queryIndex = 1 + pathParamsCount;
  const queryAccess = $(
    ts.factory.createElementAccessExpression(
      $('key').$render(),
      ts.factory.createNumericLiteral(queryIndex),
    ),
  );
  reconstructedOptions = reconstructedOptions.prop('query', queryAccess);

  fetcherStatements.push($.const('params').assign(reconstructedOptions));

  const awaitSdkFn = $(sdkFn)
    .call($.object().spread('params').prop('throwOnError', $.literal(true)))
    .await();

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    fetcherStatements.push($.return(awaitSdkFn));
  } else {
    fetcherStatements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  // Build the fetcher key type: readonly [string, ...pathParams, queryType]
  // Example: readonly [string, number, { page: number }]
  const keyTypeElements = ['string'];

  // Add path param types
  Object.keys(pathParams).forEach(() => {
    // Use the parameter's type - for simplicity, we'll use the base type
    keyTypeElements.push('string');
  });

  // Add query type - extract query type from the options type
  // If the operation has query params, use the query property type from typeData
  // Otherwise, use the pagination parameter type
  const queryType = hasQueryParams
    ? `${typeData}['query']`
    : `{ ${pagination.name}: number }`;
  keyTypeElements.push(queryType);

  const keyType = `readonly [${keyTypeElements.join(', ')}]`;

  const fetcherFunction = $.func()
    .async()
    .param('key', (p) => p.type(keyType))
    .do(...fetcherStatements);

  // Build the infinite options object
  const swrInfiniteOptionsObj = $.object()
    .pretty()
    .prop('getKey', getKeyFunction)
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
