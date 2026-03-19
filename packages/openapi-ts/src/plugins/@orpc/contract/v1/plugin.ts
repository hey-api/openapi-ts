import type { NodeName } from '@hey-api/codegen-core';
import { applyNaming, toCase } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { createOperationComment } from '../../../shared/utils/operation';
import { getOperationPaths, getSuccessResponse, getTags, hasInput } from '../shared/operation';
import type { OrpcContractPlugin } from '../types';

type NestedLeaf = { type: 'leaf'; value: NodeName };
type NestedNode = { children: Map<string, NestedValue>; type: 'node' };
type NestedValue = NestedLeaf | NestedNode;

function buildNestedObject(node: NestedNode): ReturnType<typeof $.object> {
  const obj = $.object();
  for (const [key, child] of node.children) {
    if (child.type === 'leaf') {
      obj.prop(key, $(child.value));
    } else {
      obj.prop(key, buildNestedObject(child));
    }
  }
  return obj;
}

export const handlerV1: OrpcContractPlugin['Handler'] = ({ plugin }) => {
  const oc = plugin.symbol('oc', {
    external: '@orpc/contract',
  });
  const baseSymbol = plugin.symbol('base');

  const baseNode = $.const(baseSymbol)
    .export()
    .assign(
      $(oc)
        .attr('$route')
        .call($.object().prop('inputStructure', $.literal('detailed'))),
    );
  plugin.node(baseNode);

  const root: NestedNode = { children: new Map(), type: 'node' };

  plugin.forEach(
    'operation',
    (event) => {
      const { operation } = event;

      const tags = getTags(operation, plugin.config.router.strategyDefaultTag);
      const successResponse = getSuccessResponse(operation);

      const contractSymbol = plugin.symbol(
        applyNaming(operation.id, plugin.config.contracts.contractName),
        {
          meta: {
            category: 'contract',
            path: event._path,
            resource: 'operation',
            resourceId: operation.id,
            role: 'contract',
            tags,
            tool: plugin.name,
          },
        },
      );

      let expression = $(baseSymbol)
        .attr('route')
        .call(
          $.object()
            .$if(operation.deprecated, (o, v) => o.prop('deprecated', $.literal(v)))
            .$if(operation.description, (o, v) => o.prop('description', $.literal(v)))
            .prop('method', $.literal(operation.method.toUpperCase()))
            .$if(operation.operationId, (o, v) => o.prop('operationId', $.literal(v)))
            .prop('path', $.literal(operation.path))
            .$if(
              successResponse.hasOutput &&
                successResponse.statusCode !== 200 &&
                successResponse.statusCode,
              (o, v) => o.prop('successStatus', $.literal(v)),
            )
            .$if(operation.summary, (o, v) => o.prop('summary', $.literal(v)))
            .$if(tags.length > 0 && tags, (o, v) => o.prop('tags', $.fromValue(v))),
        );

      if (hasInput(operation) && plugin.config.validator.input) {
        expression = expression.attr('input').call(
          plugin.referenceSymbol({
            category: 'schema',
            resource: 'operation',
            resourceId: operation.id,
            role: 'data',
            tool: plugin.config.validator.input,
          }),
        );
      }

      if (successResponse.hasOutput && plugin.config.validator.output) {
        // TODO: support outputStructure detailed
        expression = expression.attr('output').call(
          plugin.referenceSymbol({
            category: 'schema',
            resource: 'operation',
            resourceId: operation.id,
            role: 'responses',
            tool: plugin.config.validator.output,
          }),
        );
      }

      const contractNode = $.const(contractSymbol)
        .export()
        .$if(createOperationComment(operation), (c, v) => c.doc(v))
        .assign(expression);
      plugin.node(contractNode);

      const paths = getOperationPaths(operation, plugin.config.router);
      for (const path of paths) {
        let current: NestedNode = root;
        for (let i = 0; i < path.length; i++) {
          const isLast = i === path.length - 1;
          const segment = isLast
            ? applyNaming(path[i]!, plugin.config.router.methodName)
            : applyNaming(path[i]!, plugin.config.router.segmentName);

          if (isLast) {
            current.children.set(segment, {
              type: 'leaf',
              value: contractSymbol,
            });
          } else {
            if (!current.children.has(segment)) {
              current.children.set(segment, {
                children: new Map(),
                type: 'node',
              });
            }
            const next = current.children.get(segment)!;
            if (next.type === 'node') {
              current = next;
            }
          }
        }
      }
    },
    { order: 'declarations' },
  );

  const routerExportName = applyNaming('router', plugin.config.routerName);
  const routerSymbol = plugin.symbol(routerExportName, {
    meta: {
      category: 'contract',
      resource: 'router',
      tool: plugin.name,
    },
  });
  const routerNode = $.const(routerSymbol).export().assign(buildNestedObject(root).pretty());
  plugin.node(routerNode);

  const routerTypeName = toCase(routerExportName, 'PascalCase');
  const routerTypeSymbol = plugin.symbol(routerTypeName, {
    meta: {
      category: 'type',
      resource: 'router',
      tool: plugin.name,
    },
  });
  const routerTypeNode = $.type.alias(routerTypeSymbol).export().type($.type.query(routerSymbol));
  plugin.node(routerTypeNode);
};
