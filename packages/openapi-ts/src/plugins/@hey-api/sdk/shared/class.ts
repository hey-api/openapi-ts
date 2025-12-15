import type { Symbol } from '@hey-api/codegen-core';

import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';
import { toCase } from '~/utils/to-case';

import { SdkClassModel } from '../model/class';
import type { HeyApiSdkPlugin } from '../types';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import {
  operationClasses,
  operationParameters,
  operationStatements,
} from './operation';

type SdkClassEntry = {
  /**
   * Name of the class.
   */
  className: string;
  /**
   * Class names for child classes located inside this class.
   */
  classes: Set<string>;
  /**
   * Symbol ID for the class.
   */
  id: number;
  /**
   * Track unique added method nodes.
   */
  methods: Set<string>;
  /**
   * List of class nodes containing methods.
   */
  nodes: Array<TsDsl>;
  /**
   * Is this a root class?
   */
  root: boolean;
};

export const registryName = '__registry';

export const createRegistryClass = ({
  plugin,
  sdkSymbol,
  symbol,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  sdkSymbol: Symbol;
  symbol: Symbol;
}): ReturnType<typeof $.class> => {
  const symbolDefaultKey = plugin.symbol('defaultKey');
  const symbolInstances = plugin.symbol('instances');
  return $.class(symbol)
    .generic('T')
    .field(symbolDefaultKey, (f) =>
      f.private().readonly().assign($.literal('default')),
    )
    .newline()
    .field(symbolInstances, (f) =>
      f
        .private()
        .readonly()
        .type($.type('Map').generics('string', 'T'))
        .assign($.new('Map')),
    )
    .newline()
    .method('get', (m) =>
      m
        .returns('T')
        .param('key', (p) => p.type('string').optional())
        .do(
          $.const('instance').assign(
            $('this')
              .attr(symbolInstances)
              .attr('get')
              .call($('key').coalesce($('this').attr(symbolDefaultKey))),
          ),
          $.if($.not('instance')).do(
            $.throw('Error').message(
              $.template('No SDK client found. Create one with "new ')
                .add(sdkSymbol)
                .add('()" to fix this error.'),
            ),
          ),
          $.return('instance'),
        ),
    )
    .newline()
    .method('set', (m) =>
      m
        .returns('void')
        .param('value', (p) => p.type('T'))
        .param('key', (p) => p.type('string').optional())
        .do(
          $('this')
            .attr(symbolInstances)
            .attr('set')
            .call($('key').coalesce($('this').attr(symbolDefaultKey)), 'value'),
        ),
    );
};

export const createClientClass = ({
  plugin,
  symbol,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  symbol: Symbol;
}): ReturnType<typeof $.class> => {
  const symClient = plugin.getSymbol({ category: 'client' });
  const optionalClient = Boolean(plugin.config.client && symClient);
  const symbolClient = plugin.referenceSymbol({
    category: 'external',
    resource: 'client.Client',
  });
  return $.class(symbol)
    .field('client', (f) => f.protected().type(symbolClient))
    .newline()
    .init((i) =>
      i
        .param('args', (p) =>
          p
            .optional(optionalClient)
            .type(
              $.type
                .object()
                .prop('client', (p) =>
                  p.optional(optionalClient).type(symbolClient),
                ),
            ),
        )
        .do(
          $('this')
            .attr('client')
            .assign(
              $('args')
                .attr('client')
                .optional(optionalClient)
                .$if(optionalClient, (a) => a.coalesce(symClient!)),
            ),
        ),
    );
};

export const generateClassSdk = ({
  plugin,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
}): void => {
  const client = getClientPlugin(plugin.context.config);
  const isAngularClient = client.name === '@hey-api/client-angular';
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const sdkClasses = new Map<string, SdkClassEntry>();
  /**
   * Track unique added classes.
   */
  const generatedClasses = new Set<string>();

  const sdkModel = plugin.config.instance
    ? new SdkClassModel(plugin.config.instance)
    : undefined;

  plugin.forEach(
    'operation',
    ({ operation }) => {
      if (sdkModel) {
        sdkModel.insert(operation, plugin);
      } else {
        const isRequiredOptions = isOperationOptionsRequired({
          context: plugin.context,
          operation,
        });
        const symbolResponse = isNuxtClient
          ? plugin.querySymbol({
              category: 'type',
              resource: 'operation',
              resourceId: operation.id,
              role: 'response',
            })
          : undefined;

        const classes = operationClasses({ operation, plugin });

        for (const entry of classes.values()) {
          entry.path.forEach((currentClassName, index) => {
            const symbolCurrentClass = plugin.referenceSymbol({
              category: 'utility',
              resource: 'class',
              resourceId: currentClassName,
              tool: 'sdk',
            });
            if (!sdkClasses.has(symbolCurrentClass.meta!.resourceId!)) {
              sdkClasses.set(symbolCurrentClass.meta!.resourceId!, {
                className: symbolCurrentClass.meta!.resourceId!,
                classes: new Set(),
                id: symbolCurrentClass.id,
                methods: new Set(),
                nodes: [],
                root: !index,
              });
            }

            const parentClassName = entry.path[index - 1];
            if (parentClassName) {
              const symbolParentClass = plugin.referenceSymbol({
                category: 'utility',
                resource: 'class',
                resourceId: parentClassName,
                tool: 'sdk',
              });
              if (
                symbolParentClass.meta?.resourceId !==
                symbolCurrentClass.meta?.resourceId
              ) {
                const parentClass = sdkClasses.get(
                  symbolParentClass.meta!.resourceId!,
                )!;
                parentClass.classes.add(symbolCurrentClass.meta!.resourceId!);
                sdkClasses.set(
                  symbolParentClass.meta!.resourceId!,
                  parentClass,
                );
              }
            }

            const isLast = entry.path.length === index + 1;
            // add methods only to the last class
            if (!isLast) {
              return;
            }

            const currentClass = sdkClasses.get(
              symbolCurrentClass.meta!.resourceId!,
            )!;

            const methodName = entry.methodName;
            if (currentClass.methods.has(methodName)) return;
            currentClass.methods.add(methodName);

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
            const functionNode = $.method(methodName, (m) =>
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
                        t.$if(symbolResponse, (t, s) =>
                          t.extends(s).default(s),
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

            if (!currentClass.nodes.length) {
              currentClass.nodes.push(functionNode);
            } else {
              currentClass.nodes.push($.newline(), functionNode);
            }

            sdkClasses.set(symbolCurrentClass.meta!.resourceId!, currentClass);
          });
        }
      }
    },
    {
      order: 'declarations',
    },
  );

  if (!sdkModel) {
    const clientIndex = plugin.config.instance ? plugin.node(null) : undefined;
    const symbolClient =
      clientIndex !== undefined
        ? plugin.symbol('HeyApiClient', {
            meta: {
              category: 'utility',
              resource: 'class',
              resourceId: 'HeyApiClient',
              tool: 'sdk',
            },
          })
        : undefined;
    const registryIndex = plugin.config.instance
      ? plugin.node(null)
      : undefined;

    const generateClass = (currentClass: SdkClassEntry) => {
      const resourceId = currentClass.className;

      if (generatedClasses.has(resourceId)) return;
      generatedClasses.add(resourceId);

      if (clientIndex !== undefined && symbolClient && !symbolClient.node) {
        const node = createClientClass({ plugin, symbol: symbolClient });
        plugin.node(node, clientIndex);
      }

      for (const childClassName of currentClass.classes) {
        const childClass = sdkClasses.get(childClassName)!;
        generateClass(childClass);

        const refChildClass = plugin.referenceSymbol({
          category: 'utility',
          resource: 'class',
          resourceId: childClass.className,
          tool: 'sdk',
        });

        const originalMemberName = toCase(
          refChildClass.meta!.resourceId!,
          'camelCase',
        );
        // avoid collisions with existing method names
        let memberName = originalMemberName;
        if (currentClass.methods.has(memberName)) {
          let index = 2;
          let attempt = `${memberName}${index}`;
          while (currentClass.methods.has(attempt)) {
            attempt = `${memberName}${index++}`;
          }
          memberName = attempt;
        }
        currentClass.methods.add(memberName);

        if (currentClass.nodes.length > 0) {
          currentClass.nodes.push($.newline());
        }

        if (plugin.config.instance) {
          const privateName = plugin.symbol(`_${memberName}`);
          const privateNode = $.field(privateName, (f) =>
            f.private().optional().type(refChildClass),
          );
          currentClass.nodes.push(privateNode);
          const getterNode = $.getter(memberName, (g) =>
            g.returns(refChildClass).do(
              $('this')
                .attr(privateName)
                .nullishAssign(
                  $.new(refChildClass).args(
                    $.object().prop('client', $('this').attr('client')),
                  ),
                )
                .return(),
            ),
          );
          currentClass.nodes.push(getterNode);
        } else {
          const subClassReferenceNode = plugin.isSymbolRegistered(
            refChildClass.id,
          )
            ? $.field(memberName, (f) => f.static().assign($(refChildClass)))
            : $.getter(memberName, (g) =>
                g.public().static().do($.return(refChildClass)),
              );
          currentClass.nodes.push(subClassReferenceNode);
        }
      }

      const symbol = plugin.symbol(resourceId, {
        meta: {
          category: 'utility',
          resource: 'class',
          resourceId,
          tool: 'sdk',
        },
      });

      if (currentClass.root && registryIndex !== undefined) {
        const symClient = plugin.getSymbol({ category: 'client' });
        const isClientRequired = !plugin.config.client || !symClient;
        const symbolClient = plugin.referenceSymbol({
          category: 'external',
          resource: 'client.Client',
        });
        const ctor = $.init((i) =>
          i
            .param('args', (p) =>
              p.required(isClientRequired).type(
                $.type
                  .object()
                  .prop('client', (p) =>
                    p.required(isClientRequired).type(symbolClient),
                  )
                  .prop('key', (p) => p.optional().type('string')),
              ),
            )
            .do(
              $('super').call('args'),
              $(symbol)
                .attr(registryName)
                .attr('set')
                .call('this', $('args').attr('key').required(isClientRequired)),
            ),
        );

        if (!currentClass.nodes.length) {
          currentClass.nodes.unshift(ctor);
        } else {
          currentClass.nodes.unshift(ctor, $.newline());
        }

        const symbolRegistry = plugin.symbol('HeyApiRegistry', {
          meta: {
            category: 'utility',
            resource: 'class',
            resourceId: 'HeyApiRegistry',
            tool: 'sdk',
          },
        });
        const node = createRegistryClass({
          plugin,
          sdkSymbol: symbol,
          symbol: symbolRegistry,
        });
        plugin.node(node, registryIndex);
        const registryNode = $.field(registryName, (f) =>
          f
            .public()
            .static()
            .readonly()
            .assign($.new(symbolRegistry).generic(symbol)),
        );
        currentClass.nodes.unshift(registryNode, $.newline());
      }

      const node = $.class(symbol)
        .export()
        .extends(symbolClient)
        .$if(isAngularClient && currentClass.root, (c) =>
          c.decorator(
            plugin.referenceSymbol({
              category: 'external',
              resource: '@angular/core.Injectable',
            }),
            $.object().prop('providedIn', $.literal('root')),
          ),
        )
        .do(...currentClass.nodes);
      plugin.node(node);
    };

    for (const sdkClass of sdkClasses.values()) {
      generateClass(sdkClass);
    }
  } else {
    const allDependencies: Array<ReturnType<typeof $.class>> = [];
    const allNodes: Array<ReturnType<typeof $.class>> = [];

    for (const model of sdkModel.walk()) {
      const { dependencies, node } = model.toNode(plugin);
      allDependencies.push(...dependencies);
      allNodes.push(node);
    }

    const uniqueDeps = new Map<number, ReturnType<typeof $.class>>();
    for (const dep of allDependencies) {
      if (dep.symbol) uniqueDeps.set(dep.symbol.id, dep);
    }
    for (const dep of uniqueDeps.values()) {
      plugin.node(dep);
    }

    for (const node of allNodes) {
      plugin.node(node);
    }
  }
};
