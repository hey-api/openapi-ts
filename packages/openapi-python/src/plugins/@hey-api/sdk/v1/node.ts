import type {
  StructureItem,
  StructureNode,
  StructureShell,
  Symbol,
  SymbolMeta,
} from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming, toCase } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import { createOperationComment } from '../../../shared/utils/operation';
import type { HeyApiSdkPlugin } from '../types';

export interface OperationItem {
  operation: IR.OperationObject;
  path: ReadonlyArray<string | number>;
  tags: ReadonlyArray<string> | undefined;
}

export const source = globalThis.Symbol('@hey-api/python-sdk');

function attachComment<T extends ReturnType<typeof $.func>>(args: {
  node: T;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): T {
  const { node, operation, plugin } = args;
  return node.$if(plugin.config.comments && createOperationComment(operation), (n, v) =>
    n.doc(v),
  ) as T;
}

function createShellMeta(node: StructureNode): SymbolMeta {
  return {
    category: 'utility',
    resource: 'class',
    resourceId: node.getPath().join('.'),
    tool: 'sdk',
  };
}

function createFnSymbol(
  plugin: HeyApiSdkPlugin['Instance'],
  item: StructureItem & { data: OperationItem },
): Symbol {
  const { operation, path, tags } = item.data;
  const name = item.location[item.location.length - 1]!;
  return plugin.symbol(applyNaming(name, plugin.config.operations.methodName), {
    meta: {
      category: 'sdk',
      path,
      resource: 'operation',
      resourceId: operation.id,
      tags,
      tool: 'sdk',
    },
  });
}

function childToNode(
  resource: StructureNode,
  plugin: HeyApiSdkPlugin['Instance'],
): ReadonlyArray<ReturnType<typeof $.func>> {
  const refChild = plugin.referenceSymbol(createShellMeta(resource));
  const memberNameStr = toCase(
    refChild.name,
    plugin.config.operations.methodName.casing ?? 'camelCase',
  );
  const memberName = plugin.symbol(memberNameStr);
  return [
    $.func(
      memberName,
      (f) => f.returns('None'),
      // f.returns(refChild).do(
      //   $('this')
      //     .attr(privateName)
      //     .nullishAssign(
      //       $.new(refChild).args($.object().prop('client', $('this').attr('client'))),
      //     )
      //     .return(),
      // ),
    ),
  ];
}

export function createShell(plugin: HeyApiSdkPlugin['Instance']): StructureShell {
  return {
    define: (node) => {
      const symbol = plugin.symbol(
        applyNaming(
          node.name,
          node.isRoot
            ? plugin.config.operations.containerName
            : plugin.config.operations.segmentName,
        ),
        {
          meta: createShellMeta(node),
        },
      );

      const symbolClient = plugin.external('client.Client');

      const c = $.class(symbol).extends(symbolClient);

      const dependencies: Array<ReturnType<typeof $.class>> = [];

      return { dependencies, node: c };
    },
  };
}

function implementFn<T extends ReturnType<typeof $.func>>(args: {
  node: T;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): T {
  const { node, operation } = args;

  // Build the URL path
  const path = operation.path;

  // Get the HTTP method (default to GET)
  const method = operation.method?.toLowerCase() || 'get';

  // Create the client call expression: self.client.get(path)
  // self is the Python equivalent of 'this' for instance methods
  const selfExpr = $.id('self');
  const clientExpr = $.attr(selfExpr, 'client');
  const methodExpr = $.attr(clientExpr, method);
  const clientCall = $.call(methodExpr, $.literal(path));

  // Return the client call
  node.do($.return(clientCall));

  return node;
}

export function toNode(
  model: StructureNode,
  plugin: HeyApiSdkPlugin['Instance'],
): {
  dependencies?: Array<ReturnType<typeof $.class | typeof $.func>>;
  nodes: ReadonlyArray<ReturnType<typeof $.class | typeof $.func>>;
} {
  if (model.virtual) {
    const nodes: Array<ReturnType<typeof $.func>> = [];
    for (const item of model.itemsFrom<OperationItem>(source)) {
      const fnName = applyNaming(
        String(item.location[item.location.length - 1]),
        plugin.config.operations.methodName,
      );
      const node = $.func(fnName);
      node.do($.return($.id('None')));
      nodes.push(node);
    }
    return { nodes };
  }

  if (!model.shell) {
    return { nodes: [] };
  }

  const nodes: Array<ReturnType<typeof $.class | typeof $.func>> = [];
  const shell = model.shell.define(model);
  const node = shell.node as ReturnType<typeof $.class | typeof $.func>;

  let index = 0;
  for (const item of model.itemsFrom<OperationItem>(source)) {
    const { operation } = item.data;
    if (node['~dsl'] === 'FuncPyDsl') {
      // TODO: function?
    } else {
      if (index > 0 || node.hasBody) node.newline();
      const method = implementFn({
        node: $.func(createFnSymbol(plugin, item), (m) =>
          attachComment({
            node: m,
            operation,
            plugin,
          }),
        ),
        operation,
        plugin,
      });
      node.do(method);
      // exampleIntent(method, operation, plugin);
    }
    index += 1;
  }

  for (const child of model.children.values()) {
    if (node['~dsl'] === 'FuncPyDsl') {
      // TODO: function?
    } else {
      if (node.hasBody) node.newline();
      node.do(...childToNode(child, plugin));
    }
  }

  nodes.push(node);

  return {
    dependencies: shell.dependencies as Array<ReturnType<typeof $.class | typeof $.func>>,
    nodes,
  };
}
