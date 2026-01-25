import type { IR } from '~/ir/types';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';
import { applyNaming, toCase } from '~/utils/naming';

import type { OrpcPlugin } from './types';

function hasInput(operation: IR.OperationObject): boolean {
  const hasPathParams = Boolean(
    operation.parameters?.path &&
      Object.keys(operation.parameters.path).length > 0,
  );
  const hasQueryParams = Boolean(
    operation.parameters?.query &&
      Object.keys(operation.parameters.query).length > 0,
  );
  const hasHeaderParams = Boolean(
    operation.parameters?.header &&
      Object.keys(operation.parameters.header).length > 0,
  );
  const hasBody = Boolean(operation.body);
  return hasPathParams || hasQueryParams || hasHeaderParams || hasBody;
}

function getSuccessResponse(
  operation: IR.OperationObject,
):
  | { hasOutput: true; statusCode: number }
  | { hasOutput: false; statusCode?: undefined } {
  if (operation.responses) {
    for (const [statusCode, response] of Object.entries(operation.responses)) {
      const statusCodeNumber = Number.parseInt(statusCode, 10);
      if (
        statusCodeNumber >= 200 &&
        statusCodeNumber <= 399 &&
        response?.mediaType &&
        response?.schema
      ) {
        return { hasOutput: true, statusCode: statusCodeNumber };
      }
    }
  }
  return { hasOutput: false, statusCode: undefined };
}

function getTags(operation: IR.OperationObject, defaultTag: string): string[] {
  return operation.tags && operation.tags.length > 0
    ? [...operation.tags]
    : [defaultTag];
}

export const handler: OrpcPlugin['Handler'] = ({ plugin }) => {
  const {
    contractNameBuilder,
    defaultTag,
    groupKeyBuilder,
    operationKeyBuilder,
    routerName,
    validator,
  } = plugin.config;

  const operations: IR.OperationObject[] = [];

  // Collect all operations using hey-api's forEach
  plugin.forEach(
    'operation',
    (event) => {
      operations.push(event.operation);
    },
    { order: 'declarations' },
  );

  // Register external symbols for imports
  const symbolOc = plugin.symbol('oc', {
    exported: false,
    external: '@orpc/contract',
  });

  // Create base contract symbol
  const baseSymbol = plugin.symbol('base', {
    exported: true,
    meta: {
      category: 'contract',
      resource: 'base',
      tool: '@orpc/contract',
    },
  });

  const baseNode = $.const(baseSymbol)
    .export()
    .assign(
      $(symbolOc)
        .attr('$route')
        .call($.object().prop('inputStructure', $.literal('detailed'))),
    );
  plugin.node(baseNode);

  // Create contract for each operation
  // Store symbols for later use in contracts object
  const contractSymbols: Record<string, ReturnType<typeof plugin.symbol>> = {};

  for (const op of operations) {
    const contractName = contractNameBuilder(op.id);
    const tags = getTags(op, defaultTag);
    const successResponse = getSuccessResponse(op);

    const contractSymbol = plugin.symbol(contractName, {
      exported: true,
      meta: {
        category: 'contract',
        path: ['paths', op.path, op.method],
        resource: 'operation',
        resourceId: op.id,
        role: 'contract',
        tags,
        tool: '@orpc/contract',
      },
    });
    contractSymbols[op.id] = contractSymbol;

    // Build the route config object following Route interface order:
    // method, path, operationId, summary, description, deprecated, tags, successStatus, successDescription
    const method = op.method.toUpperCase();
    const routeConfig = $.object()
      .prop('method', $.literal(method))
      .prop('path', $.literal(op.path as string))
      .$if(op.operationId, (node) =>
        node.prop('operationId', $.literal(op.operationId!)),
      )
      .$if(op.summary, (node) => node.prop('summary', $.literal(op.summary!)))
      .$if(op.description, (node) =>
        node.prop('description', $.literal(op.description!)),
      )
      .$if(op.deprecated, (node) => node.prop('deprecated', $.literal(true)))
      .$if(tags.length > 0, (node) => node.prop('tags', $.fromValue(tags)))
      .$if(
        successResponse.hasOutput && successResponse.statusCode !== 200,
        (node) =>
          node.prop('successStatus', $.literal(successResponse.statusCode!)),
      );

    // Build the call chain: base.route({...}).input(...).output(...)
    let expression = $(baseSymbol).attr('route').call(routeConfig);

    // .input(dataSchema) if has input
    if (hasInput(op)) {
      // Reference schema symbol dynamically from validator plugin
      const dataSymbol = plugin.referenceSymbol({
        category: 'schema',
        resource: 'operation',
        resourceId: op.id,
        role: 'data',
        tool: validator,
      });
      if (dataSymbol) {
        expression = expression.attr('input').call($(dataSymbol));
      }
    }

    // TODO: support outputStructure detailed
    // .output(responseSchema) if has output
    if (successResponse.hasOutput) {
      // Reference response schema symbol dynamically from validator plugin
      const responseSymbol = plugin.referenceSymbol({
        category: 'schema',
        resource: 'operation',
        resourceId: op.id,
        role: 'responses',
        tool: validator,
      });
      if (responseSymbol) {
        expression = expression.attr('output').call($(responseSymbol));
      }
    }

    const comments = createOperationComment(op);
    const contractNode = $.const(contractSymbol)
      .export()
      .$if(comments, (node) => node.doc(comments))
      .assign(expression);

    plugin.node(contractNode);
  }

  // Create contracts object export grouped by API path segment (in separate router file)
  const routerExportName = applyNaming('router', routerName);
  const contractsSymbol = plugin.symbol(routerExportName, {
    exported: true,
    meta: {
      category: 'contract',
      resource: 'router',
      tool: '@orpc/contract',
    },
  });

  // Group operations by group key
  const operationsByGroup = new Map<string, IR.OperationObject[]>();
  for (const op of operations) {
    const groupKey = groupKeyBuilder(op);
    if (!operationsByGroup.has(groupKey)) {
      operationsByGroup.set(groupKey, []);
    }
    operationsByGroup.get(groupKey)!.push(op);
  }

  // Build nested contracts object
  const contractsObject = $.object();
  for (const [groupKey, groupOps] of operationsByGroup) {
    const groupObject = $.object();

    for (const op of groupOps) {
      const contractSymbol = contractSymbols[op.id];
      if (contractSymbol) {
        const key = operationKeyBuilder(op.id, groupKey);
        groupObject.prop(key, $(contractSymbol));
      }
    }

    contractsObject.prop(groupKey, groupObject);
  }

  const contractsNode = $.const(contractsSymbol)
    .export()
    .assign(contractsObject);
  plugin.node(contractsNode);

  // Create type export: export type Router = typeof router (in separate router file)
  // Capitalize the router name for the type (e.g., 'router' → 'Router', 'contract' → 'Contract')
  const routerTypeName = toCase(routerExportName, 'PascalCase');
  const routerTypeSymbol = plugin.symbol(routerTypeName, {
    exported: true,
    meta: {
      category: 'type',
      resource: 'router',
      tool: '@orpc/contract',
    },
  });

  const routerTypeNode = $.type
    .alias(routerTypeSymbol)
    .export()
    .type($.type.query($(contractsSymbol)));
  plugin.node(routerTypeNode);
};
