import type { SymbolMeta } from '@hey-api/codegen-core';

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

/**
 * Represents a class in the SDK hierarchy.
 *
 * Classes can be nested (via children) and contain operations (methods).
 */
export class SdkClassModel {
  /** Nested classes within this class. */
  children: Map<string, SdkClassModel> = new Map();
  /** The name of this class (e.g., "Users", "Accounts"). */
  name: string;
  /** Operations that will become methods in this class. */
  operations: Array<IR.OperationObject> = [];
  /** Parent class in the hierarchy. Undefined if this is the root class. */
  parent?: SdkClassModel;

  constructor(name: string, parent?: SdkClassModel) {
    this.name = name;
    this.parent = parent;
  }

  get isRoot(): boolean {
    return !this.parent;
  }

  /**
   * Adds an operation to this class.
   *
   * The operation will be converted to a method during code generation.
   */
  addOperation(operation: IR.OperationObject): void {
    this.operations.push(operation);
  }

  /**
   * Gets or creates a child class.
   *
   * If the child doesn't exist, it's created automatically.
   *
   * @param name - The name of the child class
   * @returns The child class instance
   */
  child(name: string): SdkClassModel {
    if (!this.children.has(name)) {
      this.children.set(name, new SdkClassModel(name, this));
    }
    return this.children.get(name)!;
  }

  /**
   * Gets the full path of this class in the hierarchy.
   *
   * @returns An array of class names from the root to this class
   */
  getPath(): ReadonlyArray<string> {
    const path: Array<string> = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cursor: SdkClassModel | undefined = this;
    while (cursor) {
      path.unshift(cursor.name);
      cursor = cursor.parent;
    }
    return path;
  }

  /**
   * Inserts an operation into the class tree.
   *
   * Parses the operation ID and creates the class hierarchy.
   */
  insert(
    operation: IR.OperationObject,
    plugin: HeyApiSdkPlugin['Instance'],
  ): void {
    const classSegments =
      plugin.config.classStructure === 'auto' && operation.operationId
        ? operation.operationId.split(/[./]/).slice(0, -1)
        : [];

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cursor: SdkClassModel = this;
    for (const segment of classSegments) {
      cursor = cursor.child(segment);
    }

    cursor.addOperation(operation);
  }

  /**
   * Converts this class group to a class node.
   */
  toNode(plugin: HeyApiSdkPlugin['Instance']): {
    dependencies: Array<ReturnType<typeof $.class>>;
    node: ReturnType<typeof $.class>;
  } {
    const dependencies: Array<ReturnType<typeof $.class>> = [];

    const client = getClientPlugin(plugin.context.config);
    const isAngularClient = client.name === '@hey-api/client-angular';
    const isNuxtClient = client.name === '@hey-api/client-nuxt';

    const symbolClass = plugin.symbol(
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
    const metaClient: SymbolMeta = {
      category: 'utility',
      resource: 'class',
      resourceId: 'HeyApiClient',
      tool: 'sdk',
    };
    const node = $.class(symbolClass)
      .export()
      .$if(plugin.config.instance, (c) =>
        c.extends(plugin.referenceSymbol(metaClient)),
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

    if (this.isRoot && plugin.config.instance) {
      const symbolClient = plugin.symbol('HeyApiClient', { meta: metaClient });
      const clientNode = createClientClass({ plugin, symbol: symbolClient });
      dependencies.push(clientNode);
      const symbolRegistry = plugin.symbol('HeyApiRegistry', {
        meta: {
          category: 'utility',
          resource: 'class',
          resourceId: 'HeyApiRegistry',
          tool: 'sdk',
        },
      });
      const registryNode = createRegistryClass({
        plugin,
        sdkSymbol: symbolClass,
        symbol: symbolRegistry,
      });
      dependencies.push(registryNode);
      node.field('__registry', (f) =>
        f
          .public()
          .static()
          .readonly()
          .assign($.new(symbolRegistry).generic(symbolClass)),
      );
      node.newline();

      const symClient = plugin.getSymbol({ category: 'client' });
      const isClientRequired = !plugin.config.client || !symClient;
      const symbolClientType = plugin.referenceSymbol({
        category: 'external',
        resource: 'client.Client',
      });
      node.init((i) =>
        i
          .param('args', (p) =>
            p.required(isClientRequired).type(
              $.type
                .object()
                .prop('client', (p) =>
                  p.required(isClientRequired).type(symbolClientType),
                )
                .prop('key', (p) => p.optional().type('string')),
            ),
          )
          .do(
            $('super').call('args'),
            $(symbolClass)
              .attr('__registry')
              .attr('set')
              .call('this', $('args').attr('key').required(isClientRequired)),
          ),
      );
    }

    this.operations.forEach((operation, index) => {
      if (index > 0 || node.hasBody) node.newline();
      const symbolMethod = plugin.symbol(
        operationMethodName({
          operation,
          plugin,
          value:
            plugin.config.classStructure === 'auto' && operation.operationId
              ? toCase(operation.operationId.split(/[./]/).pop()!, 'camelCase')
              : operation.id,
        }),
      );
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
      node.method(symbolMethod, (m) =>
        m
          .$if(createOperationComment(operation), (m, v) => m.doc(v))
          .public()
          .static(!isAngularClient && !plugin.config.instance)
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
          .do(...statements),
      );
    });

    for (const child of this.children.values()) {
      if (node.hasBody) node.newline();
      const refChild = plugin.referenceSymbol({
        category: 'utility',
        resource: 'class',
        resourceId: child.getPath().join('.'),
        tool: 'sdk',
      });
      const memberName = toCase(refChild.name, 'camelCase');
      if (plugin.config.instance) {
        const privateName = plugin.symbol(`_${memberName}`);
        const getterName = plugin.symbol(memberName);
        node.field(privateName, (f) => f.private().optional().type(refChild));
        node.do(
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
        );
      } else {
        node.do(
          plugin.isSymbolRegistered(refChild.id)
            ? $.field(memberName, (f) => f.static().assign($(refChild)))
            : $.getter(memberName, (g) =>
                g.public().static().do($.return(refChild)),
              ),
        );
      }
    }

    return { dependencies, node };
  }

  /**
   * Recursively walks the tree depth-first.
   *
   * Yields this node, then all descendants.
   */
  *walk(): Generator<SdkClassModel> {
    for (const child of this.children.values()) {
      yield* child.walk();
    }
    yield this;
  }
}
