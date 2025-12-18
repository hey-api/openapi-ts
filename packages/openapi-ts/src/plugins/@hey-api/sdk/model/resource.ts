import type { Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';
import { toCase } from '~/utils/to-case';

import { createClientClass, createRegistryClass } from '../shared/class';
import { nuxtTypeComposable, nuxtTypeDefault } from '../shared/constants';
import {
  operationClassName,
  operationMethodName,
  operationParameters,
  operationStatements,
} from '../shared/operation';
import type { HeyApiSdkPlugin } from '../types';

export type Event = {
  operation: IR.OperationObject;
  path: ReadonlyArray<string | number>;
  tags: ReadonlyArray<string> | undefined;
};

/**
 * Represents a resource layer in the SDK hierarchy.
 *
 * Resources can be nested (via children) and contain operations (methods).
 */
export class SdkResourceModel {
  /** Nested resources within this resource. */
  children: Map<string, SdkResourceModel> = new Map();
  /** The name of this resource (e.g., "Users", "Accounts"). */
  name: string;
  /** Operations that will become methods in this resource. */
  operations: Array<Event> = [];
  /** Parent resource in the hierarchy. Undefined if this is the root resource. */
  parent?: SdkResourceModel;

  constructor(name: string, parent?: SdkResourceModel) {
    this.name = name;
    this.parent = parent;
  }

  get isRoot(): boolean {
    return !this.parent;
  }

  /**
   * Gets or creates a child resource.
   *
   * If the child doesn't exist, it's created automatically.
   *
   * @param name - The name of the child resource
   * @returns The child resource instance
   */
  child(name: string): SdkResourceModel {
    if (!this.children.has(name)) {
      this.children.set(name, new SdkResourceModel(name, this));
    }
    return this.children.get(name)!;
  }

  /**
   * Gets the full path of this resource in the hierarchy.
   *
   * @returns An array of resource names from the root to this resource
   */
  getPath(): ReadonlyArray<string> {
    const path: Array<string> = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cursor: SdkResourceModel | undefined = this;
    while (cursor) {
      path.unshift(cursor.name);
      cursor = cursor.parent;
    }
    return path;
  }

  /**
   * Inserts an operation event into the resource tree.
   *
   * Parses the operation ID and creates the resource hierarchy.
   */
  insert(event: Event, plugin: HeyApiSdkPlugin['Instance']): void {
    const { operation } = event;
    const classSegments =
      this.name &&
      plugin.config.classStructure === 'auto' &&
      operation.operationId
        ? operation.operationId.split(/[./]/).slice(0, -1)
        : [];

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cursor: SdkResourceModel = this;
    for (const segment of classSegments) {
      cursor = cursor.child(segment);
    }

    cursor.operations.push(event);
  }

  /**
   * Converts this class group to a class node.
   */
  toNode(plugin: HeyApiSdkPlugin['Instance']): {
    dependencies: Array<ReturnType<typeof $.class>>;
    nodes: ReadonlyArray<ReturnType<typeof $.class | typeof $.var>>;
  } {
    const dependencies: Array<ReturnType<typeof $.class>> = [];
    const nodes: Array<ReturnType<typeof $.class | typeof $.var>> = [];

    const client = getClientPlugin(plugin.context.config);
    const isAngularClient = client.name === '@hey-api/client-angular';

    if (this.name) {
      const { node, symbol: symbolClass } = this.classToNode(plugin);

      if (this.isRoot && plugin.config.instance) {
        this.enrichRootClass({
          dependencies,
          node,
          plugin,
          symbol: symbolClass,
        });
      }

      this.operations.forEach((event, index) => {
        const { operation } = event;
        if (index > 0 || node.hasBody) node.newline();
        node.do(
          this.implementFn({
            node: $.method(this.createFnSymbol(plugin, event), (m) =>
              this.attachComment({
                node: m,
                operation,
              })
                .public()
                .static(!isAngularClient && !plugin.config.instance),
            ),
            operation,
            plugin,
          }),
        );
      });

      for (const child of this.children.values()) {
        if (node.hasBody) node.newline();
        node.do(...this.childToNode(child, plugin));
      }

      nodes.push(node);
    } else {
      this.operations.forEach((event) => {
        const { operation } = event;
        let node = $.const(this.createFnSymbol(plugin, event))
          .export()
          .assign(
            this.implementFn({
              node: $.func(),
              operation,
              plugin,
            }),
          );
        node = this.attachComment({ node, operation });
        nodes.push(node);
      });
    }

    return { dependencies, nodes };
  }

  /**
   * Recursively walks the tree depth-first.
   *
   * Yields this node, then all descendants.
   */
  *walk(): Generator<SdkResourceModel> {
    for (const child of this.children.values()) {
      yield* child.walk();
    }
    yield this;
  }

  private attachComment<
    T extends ReturnType<typeof $.var | typeof $.method>,
  >(args: { node: T; operation: IR.OperationObject }): T {
    const { node, operation } = args;
    return node.$if(createOperationComment(operation), (m, v) => m.doc(v)) as T;
  }

  private createFnSymbol(
    plugin: HeyApiSdkPlugin['Instance'],
    event: Event,
  ): Symbol {
    const { operation, path, tags } = event;
    const extractFromOperationId =
      this.name && plugin.config.classStructure === 'auto';
    return plugin.symbol(
      operationMethodName({
        operation,
        plugin,
        value:
          extractFromOperationId && operation.operationId
            ? toCase(operation.operationId.split(/[./]/).pop()!, 'camelCase')
            : operation.id,
      }),
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

  private childToNode(
    resource: SdkResourceModel,
    plugin: HeyApiSdkPlugin['Instance'],
  ): ReadonlyArray<ReturnType<typeof $.field | typeof $.getter>> {
    const refChild = plugin.referenceSymbol({
      category: 'utility',
      resource: 'class',
      resourceId: resource.getPath().join('.'),
      tool: 'sdk',
    });
    const memberName = toCase(refChild.name, 'camelCase');
    if (plugin.config.instance) {
      const privateName = plugin.symbol(`_${memberName}`);
      const getterName = plugin.symbol(memberName);
      return [
        $.field(privateName, (f) => f.private().optional().type(refChild)),
        $.getter(getterName, (g) =>
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

  private classToNode(plugin: HeyApiSdkPlugin['Instance']): {
    node: ReturnType<typeof $.class>;
    symbol: Symbol;
  } {
    const client = getClientPlugin(plugin.context.config);
    const isAngularClient = client.name === '@hey-api/client-angular';
    const symbol = plugin.symbol(
      operationClassName({ plugin, value: this.name }),
      {
        meta: {
          category: 'utility',
          resource: 'class',
          resourceId: this.getPath().join('.'),
          tool: 'sdk',
        },
      },
    );
    const node = $.class(symbol)
      .export()
      .$if(plugin.config.instance, (c) =>
        c.extends(
          plugin.referenceSymbol({
            category: 'utility',
            resource: 'class',
            resourceId: 'HeyApiClient',
            tool: 'sdk',
          }),
        ),
      )
      .$if(isAngularClient && this.isRoot, (c) =>
        c.decorator(
          plugin.referenceSymbol({
            category: 'external',
            resource: '@angular/core.Injectable',
          }),
          $.object().prop('providedIn', $.literal('root')),
        ),
      );
    return { node, symbol };
  }

  private enrichRootClass(args: {
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

  private implementFn<
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
}
