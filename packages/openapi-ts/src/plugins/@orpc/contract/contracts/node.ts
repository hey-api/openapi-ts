import type { StructureItem, StructureNode, StructureShell, Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { createOperationComment } from '../../../shared/utils/operation';
import { getSuccessResponse, getTags, hasInput } from '../shared/operation';
import type { OrpcContractPlugin } from '../types';

export interface ContractItem {
  operation: IR.OperationObject;
  path: ReadonlyArray<string | number>;
  tags: ReadonlyArray<string> | undefined;
}

export const source = globalThis.Symbol('@orpc/contract');

function createContractSymbol(
  plugin: OrpcContractPlugin['Instance'],
  item: StructureItem & { data: ContractItem },
): Symbol {
  const { operation, path, tags } = item.data;
  const name = item.location[item.location.length - 1]!;
  return plugin.symbol(applyNaming(name, plugin.config.contracts.contractName), {
    meta: {
      category: 'contract',
      path,
      resource: 'operation',
      resourceId: operation.id,
      role: 'contract',
      tags,
      tool: plugin.name,
    },
  });
}

function createContractExpression(
  plugin: OrpcContractPlugin['Instance'],
  operation: IR.OperationObject,
  baseSymbol: Symbol,
) {
  const successResponse = getSuccessResponse(operation);
  const tags = getTags(operation, plugin.config.contracts.strategyDefaultTag);

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

  return expression;
}

function buildContainerObject(
  node: StructureNode,
  plugin: OrpcContractPlugin['Instance'],
  symbols: Map<string, Symbol>,
): ReturnType<typeof $.object> {
  const obj = $.object();

  for (const item of node.itemsFrom<ContractItem>(source)) {
    const { operation } = item.data;
    const contractSymbol = symbols.get(operation.id)!;
    const name = item.location[item.location.length - 1]!;
    const propName = applyNaming(name, plugin.config.contracts.contractName);
    obj.prop(propName, $(contractSymbol));
  }

  for (const child of node.children.values()) {
    if (child.shell) {
      const childShell = child.shell.define(child);
      const childSymbol = (childShell.node as ReturnType<typeof $.const>).symbol;
      if (childSymbol) {
        const propName = applyNaming(child.name, plugin.config.contracts.segmentName);
        obj.prop(propName, $(childSymbol));
      }
    }
  }

  return obj;
}

export function createShell(plugin: OrpcContractPlugin['Instance']): StructureShell {
  return {
    define: (node) => {
      const symbol = plugin.symbol(
        applyNaming(
          node.name,
          node.isRoot ? plugin.config.contracts.containerName : plugin.config.contracts.segmentName,
        ),
        {
          meta: {
            category: 'contract',
            resource: 'container',
            resourceId: node.getPath().join('.'),
            tool: plugin.name,
          },
        },
      );

      const placeholder = $.const(symbol).export().assign($.object());

      return { dependencies: [], node: placeholder };
    },
  };
}

export function toNode(
  model: StructureNode,
  plugin: OrpcContractPlugin['Instance'],
  baseSymbol: Symbol,
): {
  nodes: ReadonlyArray<ReturnType<typeof $.const>>;
  symbols?: Map<string, Symbol>;
} {
  if (model.virtual) {
    const nodes: Array<ReturnType<typeof $.const>> = [];
    const symbols = new Map<string, Symbol>();

    for (const item of model.itemsFrom<ContractItem>(source)) {
      const { operation } = item.data;
      const contractSymbol = createContractSymbol(plugin, item);
      const expression = createContractExpression(plugin, operation, baseSymbol);

      const node = $.const(contractSymbol)
        .export()
        .$if(createOperationComment(operation), (n, v) => n.doc(v))
        .assign(expression);
      nodes.push(node);
      symbols.set(operation.id, contractSymbol);
    }
    return { nodes, symbols };
  }

  if (!model.shell) {
    return { nodes: [] };
  }

  const nodes: Array<ReturnType<typeof $.const>> = [];
  const symbols = new Map<string, Symbol>();

  for (const item of model.itemsFrom<ContractItem>(source)) {
    const { operation } = item.data;
    const contractSymbol = createContractSymbol(plugin, item);
    const expression = createContractExpression(plugin, operation, baseSymbol);

    const node = $.const(contractSymbol)
      .export()
      .$if(createOperationComment(operation), (n, v) => n.doc(v))
      .assign(expression);
    nodes.push(node);
    symbols.set(operation.id, contractSymbol);
  }

  const shell = model.shell.define(model);
  const containerSymbol = shell.node.symbol!;
  const obj = buildContainerObject(model, plugin, symbols);
  const containerNode = $.const(containerSymbol).export().assign(obj.pretty());
  nodes.push(containerNode);

  return { nodes, symbols };
}
