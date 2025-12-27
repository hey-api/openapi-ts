import type {
  StructureItem,
  StructureNode,
  StructureShell,
  Symbol,
} from '@hey-api/codegen-core';
import { StructureModel } from '@hey-api/codegen-core';

import { clientFolderAbsolutePath } from '~/generate/client';
import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';
import { applyNaming, toCase } from '~/utils/naming';

import { createClientClass, createRegistryClass } from '../shared/class';
import { nuxtTypeComposable, nuxtTypeDefault } from '../shared/constants';
import { operationParameters, operationStatements } from '../shared/operation';
import { createTypeOptions } from '../shared/typeOptions';
import { resolveStrategy } from '../structure/resolve';
import type { HeyApiSdkPlugin } from '../types';

interface OperationItem {
  operation: IR.OperationObject;
  path: ReadonlyArray<string | number>;
  tags: ReadonlyArray<string> | undefined;
}

const source = globalThis.Symbol('@hey-api/sdk');

function attachComment<
  T extends ReturnType<typeof $.var | typeof $.method>,
>(args: { node: T; operation: IR.OperationObject }): T {
  const { node, operation } = args;
  return node.$if(createOperationComment(operation), (m, v) => m.doc(v)) as T;
}

function createFnSymbol(
  plugin: HeyApiSdkPlugin['Instance'],
  item: StructureItem & { data: OperationItem },
): Symbol {
  const { operation, path, tags } = item.data;
  const name = item.location[item.location.length - 1]!;
  return plugin.symbol(
    applyNaming(name, plugin.config.structure.operations.methodName),
    {
      meta: {
        category: 'sdk',
        path,
        resource: 'operation',
        resourceId: operation.id,
        tags,
        tool: 'sdk',
      },
    },
  );
}

function childToNode(
  resource: StructureNode,
  plugin: HeyApiSdkPlugin['Instance'],
): ReadonlyArray<ReturnType<typeof $.field | typeof $.getter>> {
  const refChild = plugin.referenceSymbol({
    category: 'utility',
    resource: 'class',
    resourceId: resource.getPath().join('.'),
    tool: 'sdk',
  });
  const memberNameStr = toCase(refChild.name, 'camelCase');
  const memberName = plugin.symbol(memberNameStr);
  if (isInstance(plugin)) {
    const privateName = plugin.symbol(`_${memberNameStr}`);
    return [
      $.field(privateName, (f) => f.private().optional().type(refChild)),
      $.getter(memberName, (g) =>
        g.returns(refChild).do(
          $('this')
            .attr(privateName)
            .nullishAssign(
              $.new(refChild).args(
                $.object().prop('client', $('this').attr('client')),
              ),
            )
            .return(),
        ),
      ),
    ];
  }
  if (plugin.isSymbolRegistered(refChild.id)) {
    return [$.field(memberName, (f) => f.static().assign($(refChild)))];
  }
  return [
    $.getter(memberName, (g) => g.public().static().do($.return(refChild))),
  ];
}

function enrichRootClass(args: {
  dependencies: Array<ReturnType<typeof $.class>>;
  node: ReturnType<typeof $.class>;
  plugin: HeyApiSdkPlugin['Instance'];
  symbol: Symbol;
}): void {
  const { dependencies, node, plugin, symbol } = args;
  const symbolClient = plugin.symbol('HeyApiClient', {
    meta: {
      category: 'utility',
      resource: 'class',
      resourceId: 'HeyApiClient',
      tool: 'sdk',
    },
  });
  dependencies.push(createClientClass({ plugin, symbol: symbolClient }));
  const symbolRegistry = plugin.symbol('HeyApiRegistry', {
    meta: {
      category: 'utility',
      resource: 'class',
      resourceId: 'HeyApiRegistry',
      tool: 'sdk',
    },
  });
  dependencies.push(
    createRegistryClass({
      plugin,
      sdkSymbol: symbol,
      symbol: symbolRegistry,
    }),
  );
  const isClientRequired =
    !plugin.config.client || !plugin.getSymbol({ category: 'client' });
  const registry = plugin.symbol('__registry');
  node.toAccessNode = (node, options) => {
    if (options.context) return;
    return $(node.name).attr(registry).attr('get').call();
  };
  node.do(
    $.field(registry, (f) =>
      f
        .public()
        .static()
        .readonly()
        .assign($.new(symbolRegistry).generic(symbol)),
    ),
    $.newline(),
    $.init((i) =>
      i
        .param('args', (p) =>
          p.required(isClientRequired).type(
            $.type
              .object()
              .prop('client', (p) =>
                p.required(isClientRequired).type(
                  plugin.referenceSymbol({
                    category: 'external',
                    resource: 'client.Client',
                  }),
                ),
              )
              .prop('key', (p) => p.optional().type('string')),
          ),
        )
        .do(
          $('super').call('args'),
          $(symbol)
            .attr(registry)
            .attr('set')
            .call('this', $('args').attr('key').required(isClientRequired)),
        ),
    ),
  );
}

function implementFn<
  T extends ReturnType<typeof $.func | typeof $.method>,
>(args: {
  node: T;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): T {
  const { node, operation, plugin } = args;
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  const opParameters = operationParameters({
    isRequiredOptions,
    operation,
    plugin,
  });
  const statements = operationStatements({
    isRequiredOptions,
    opParameters,
    operation,
    plugin,
  });
  return node
    .$if(
      isNuxtClient,
      (m) =>
        m
          .generic(nuxtTypeComposable, (t) =>
            t
              .extends(
                plugin.referenceSymbol({
                  category: 'external',
                  resource: 'client.Composable',
                }),
              )
              .default($.type.literal('$fetch')),
          )
          .generic(nuxtTypeDefault, (t) =>
            t.$if(
              plugin.querySymbol({
                category: 'type',
                resource: 'operation',
                resourceId: operation.id,
                role: 'response',
              }),
              (t, s) => t.extends(s).default(s),
              (t) => t.default('undefined'),
            ),
          ),
      (m) =>
        m.generic('ThrowOnError', (t) =>
          t
            .extends('boolean')
            .default(
              ('throwOnError' in client.config
                ? client.config.throwOnError
                : false) ?? false,
            ),
        ),
    )
    .params(...opParameters.parameters)
    .do(...statements) as T;
}

/**
 * Converts this class group to a class node.
 */
function toNode(
  model: StructureNode,
  plugin: HeyApiSdkPlugin['Instance'],
): {
  dependencies?: Array<ReturnType<typeof $.class>>;
  nodes: ReadonlyArray<ReturnType<typeof $.class | typeof $.var>>;
} {
  if (model.virtual) {
    const nodes: Array<ReturnType<typeof $.var>> = [];
    for (const item of model.itemsFrom<OperationItem>(source)) {
      const { operation } = item.data;
      let node = $.const(createFnSymbol(plugin, item))
        .export()
        .assign(
          implementFn({
            node: $.func(),
            operation,
            plugin,
          }),
        );
      node = attachComment({ node, operation });
      nodes.push(node);
    }
    return { nodes };
  }

  if (!model.shell) {
    return { nodes: [] };
  }

  const nodes: Array<ReturnType<typeof $.class>> = [];

  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';

  const shell = model.shell.define(model);
  const node = shell.node as ReturnType<typeof $.class>;

  let index = 0;
  for (const item of model.itemsFrom<OperationItem>(source)) {
    const { operation } = item.data;
    if (index > 0 || node.hasBody) node.newline();
    node.do(
      implementFn({
        node: $.method(createFnSymbol(plugin, item), (m) =>
          attachComment({
            node: m,
            operation,
          })
            .public()
            .static(!isAngularClient && !isInstance(plugin)),
        ),
        operation,
        plugin,
      }),
    );
    index += 1;
  }

  for (const child of model.children.values()) {
    if (node.hasBody) node.newline();
    node.do(...childToNode(child, plugin));
  }

  nodes.push(node);

  return {
    dependencies: shell.dependencies as Array<ReturnType<typeof $.class>>,
    nodes,
  };
}

function createShell(plugin: HeyApiSdkPlugin['Instance']): StructureShell {
  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';
  return {
    define: (node) => {
      const symbol = plugin.symbol(
        applyNaming(
          node.name,
          node.isRoot
            ? plugin.config.structure.operations.containerName
            : plugin.config.structure.operations.segmentName,
        ),
        {
          meta: {
            category: 'utility',
            resource: 'class',
            resourceId: node.getPath().join('.'),
            tool: 'sdk',
          },
        },
      );
      const c = $.class(symbol)
        .export()
        .$if(isInstance(plugin), (c) =>
          c.extends(
            plugin.referenceSymbol({
              category: 'utility',
              resource: 'class',
              resourceId: 'HeyApiClient',
              tool: 'sdk',
            }),
          ),
        )
        .$if(isAngularClient && node.isRoot, (c) =>
          c.decorator(
            plugin.referenceSymbol({
              category: 'external',
              resource: '@angular/core.Injectable',
            }),
            $.object().prop('providedIn', $.literal('root')),
          ),
        );

      const dependencies: Array<ReturnType<typeof $.class>> = [];

      if (node.isRoot && isInstance(plugin)) {
        enrichRootClass({
          dependencies,
          node: c,
          plugin,
          symbol,
        });
      }

      return { dependencies, node: c };
    },
  };
}

export function isInstance(plugin: HeyApiSdkPlugin['Instance']): boolean {
  const config = plugin.config.structure.operations;
  return (
    config.container === 'class' &&
    config.methods === 'instance' &&
    config.strategy !== 'flat'
  );
}

export const handlerV1: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  plugin.symbol('formDataBodySerializer', {
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.formDataBodySerializer',
      tool: client.name,
    },
  });
  plugin.symbol('urlSearchParamsBodySerializer', {
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.urlSearchParamsBodySerializer',
      tool: client.name,
    },
  });
  plugin.symbol('buildClientParams', {
    external: clientModule,
    meta: {
      category: 'external',
      resource: 'client.buildClientParams',
      tool: client.name,
    },
  });
  if (isNuxtClient) {
    plugin.symbol('Composable', {
      external: clientModule,
      kind: 'type',
      meta: {
        category: 'external',
        resource: 'client.Composable',
        tool: client.name,
      },
    });
  }
  if (
    isAngularClient &&
    plugin.config.structure.operations.container === 'class' &&
    plugin.config.structure.operations.strategy !== 'flat'
  ) {
    plugin.symbol('Injectable', {
      external: '@angular/core',
      meta: {
        category: 'external',
        resource: '@angular/core.Injectable',
      },
    });
  }

  createTypeOptions({ plugin });

  const structure = new StructureModel();
  const shell = createShell(plugin);
  const strategy = resolveStrategy(plugin);

  plugin.forEach(
    'operation',
    (event) => {
      structure.insert({
        data: {
          operation: event.operation,
          path: event._path,
          tags: event.tags,
        } satisfies OperationItem,
        locations: strategy(event.operation).map((path) => ({ path, shell })),
        source,
      });
    },
    { order: 'declarations' },
  );

  const allDependencies: Array<ReturnType<typeof $.class>> = [];
  const allNodes: Array<ReturnType<typeof $.class | typeof $.var>> = [];

  for (const node of structure.walk()) {
    const { dependencies, nodes } = toNode(node, plugin);
    allDependencies.push(...(dependencies ?? []));
    allNodes.push(...nodes);
  }

  const uniqueDependencies = new Map<number, ReturnType<typeof $.class>>();
  for (const dep of allDependencies) {
    if (dep.symbol) uniqueDependencies.set(dep.symbol.id, dep);
  }
  for (const dep of uniqueDependencies.values()) {
    plugin.node(dep);
  }

  for (const node of allNodes) {
    plugin.node(node);
  }
};
