import type { Symbol } from '@hey-api/codegen-core';

import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';
import { toParameterDeclarations } from '~/tsc/types';
import { stringCase } from '~/utils/stringCase';

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

const createRegistryClass = ({
  sdkName,
  symbol,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  sdkName: string;
  symbol: Symbol;
}): TsDsl => {
  const defaultKey = 'defaultKey';
  const instances = 'instances';
  return $.class(symbol.placeholder)
    .export(symbol.exported)
    .generic('T')
    .field(defaultKey, (f) =>
      f.private().readonly().assign($.literal('default')),
    )
    .newline()
    .field(instances, (f) =>
      f
        .private()
        .readonly()
        // .type($.type('Map').generics('string', 'T'))
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
              .attr('instances')
              .attr('get')
              .call($('key').coalesce($('this').attr(defaultKey))),
          ),
          $.if($.not('instance')).do(
            $.throw('Error').message(
              $.template('No SDK client found. Create one with "new ')
                .add(sdkName)
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
            .attr(instances)
            .attr('set')
            .call($('key').coalesce($('this').attr(defaultKey)), 'value'),
        ),
    );
};

const createClientClass = ({
  plugin,
  symbol,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  symbol: Symbol;
}): TsDsl => {
  const symClient = plugin.getSymbol({
    category: 'client',
  });
  const optionalClient = Boolean(plugin.config.client && symClient);
  const symbolClient = plugin.referenceSymbol({
    category: 'external',
    resource: 'client.Client',
  });
  return $.class(symbol.placeholder)
    .export(symbol.exported)
    .field('client', (f) => f.protected().type(symbolClient.placeholder))
    .newline()
    .init((i) =>
      i
        .param('args', (p) =>
          p
            .optional(optionalClient)
            // .type($.type
            //   .expr('todo')
            //   // .object()
            //   // .prop('client', (p) =>
            //   //   p.optional(optionalClient).type(symbolClient.placeholder),
            //   // ),
            // ),
        )
        .do(
          $('this')
            .attr('client')
            .assign(
              $('args')
                .attr('client')
                .optional(optionalClient)
                .$if(optionalClient, (a) => a.coalesce(symClient!.placeholder)),
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

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const isRequiredOptions = isOperationOptionsRequired({
        context: plugin.context,
        operation,
      });
      // const symbolResponse = isNuxtClient
      //   ? plugin.querySymbol({
      //       category: 'type',
      //       resource: 'operation',
      //       resourceId: operation.id,
      //       role: 'response',
      //     })
      //   : undefined;

      const classes = operationClasses({
        context: plugin.context,
        operation,
        plugin,
      });

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
              sdkClasses.set(symbolParentClass.meta!.resourceId!, parentClass);
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

          // avoid duplicate methods
          if (currentClass.methods.has(entry.methodName)) {
            return;
          }

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
          const functionNode = $.method(entry.methodName, (m) =>
            m
              .$if(createOperationComment({ operation }), (m, v) =>
                m.describe(v as Array<string>),
              )
              .public()
              .static(!isAngularClient && !plugin.config.instance)
              .$if(
                isNuxtClient,
                (m) =>
                  m
                    .generic(nuxtTypeComposable, (t) =>
                      t
                        // .extends(
                        //   plugin.referenceSymbol({
                        //     category: 'external',
                        //     resource: 'client.Composable',
                        //   }).placeholder,
                        // )
                        // .default($.type.literal('$fetch')),
                    )
                    .generic(nuxtTypeDefault, (t) =>
                      t
                      // t.$if(symbolResponse, (t, s) =>
                      //   t,
                      //   // t.extends(s.placeholder).default(s.placeholder),
                      // ),
                    ),
                (m) =>
                  m.generic('ThrowOnError', (t) =>
                    t
                      // .extends('boolean')
                      // .default(
                      //   ('throwOnError' in client.config
                      //     ? client.config.throwOnError
                      //     : false) ?? false,
                      // ),
                  ),
              )
              .params(...toParameterDeclarations(opParameters.parameters))
              .do(...statements),
          );

          if (!currentClass.nodes.length) {
            currentClass.nodes.push(functionNode);
          } else {
            currentClass.nodes.push($.newline(), functionNode);
          }

          currentClass.methods.add(entry.methodName);

          sdkClasses.set(symbolCurrentClass.meta!.resourceId!, currentClass);
        });
      }
    },
    {
      order: 'declarations',
    },
  );

  const symbolHeyApiClient = plugin.config.instance
    ? plugin.registerSymbol({
        exported: false,
        kind: 'class',
        meta: {
          category: 'utility',
          resource: 'class',
          resourceId: 'HeyApiClient',
          tool: 'sdk',
        },
        name: 'HeyApiClient',
      })
    : undefined;
  const symbolHeyApiRegistry = plugin.config.instance
    ? plugin.registerSymbol({
        exported: false,
        kind: 'class',
        meta: {
          category: 'utility',
          resource: 'class',
          resourceId: 'HeyApiRegistry',
          tool: 'sdk',
        },
        name: 'HeyApiRegistry',
      })
    : undefined;

  const generateClass = (currentClass: SdkClassEntry) => {
    if (generatedClasses.has(currentClass.className)) {
      return;
    }

    const resourceId = currentClass.className;
    generatedClasses.add(resourceId);

    if (currentClass.classes.size) {
      for (const childClassName of currentClass.classes) {
        const childClass = sdkClasses.get(childClassName)!;
        generateClass(childClass);

        const refChildClass = plugin.referenceSymbol({
          category: 'utility',
          resource: 'class',
          resourceId: childClass.className,
          tool: 'sdk',
        });

        const originalMemberName = stringCase({
          case: 'camelCase',
          value: refChildClass.meta!.resourceId!,
        });
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

        const subClassReferenceNode = plugin.isSymbolRegistered(
          refChildClass.id,
        )
          ? $.field(memberName, (f) =>
              f
                .static(!plugin.config.instance)
                .assign(
                  plugin.config.instance
                    ? $.new(refChildClass.placeholder).args(
                        $.object().prop('client', $('this').attr('client')),
                      )
                    : $(refChildClass.placeholder),
                ),
            )
          : $.getter(memberName, (g) =>
              g
                .$if(!plugin.config.instance, (g) => g.public().static())
                .do(
                  $.return(
                    plugin.config.instance
                      ? $.new(refChildClass.placeholder).args(
                          $.object().prop('client', $('this').attr('client')),
                        )
                      : refChildClass.placeholder,
                  ),
                ),
            );

        if (!currentClass.nodes.length) {
          currentClass.nodes.push(subClassReferenceNode);
        } else {
          currentClass.nodes.push($.newline(), subClassReferenceNode);
        }
      }
    }

    if (
      symbolHeyApiClient &&
      !plugin.gen.symbols.hasValue(symbolHeyApiClient.id)
    ) {
      const node = createClientClass({
        plugin,
        symbol: symbolHeyApiClient,
      });
      plugin.setSymbolValue(symbolHeyApiClient, node);
    }

    const symbol = plugin.registerSymbol({
      exported: true,
      kind: 'class',
      meta: {
        category: 'utility',
        resource: 'class',
        resourceId,
        tool: 'sdk',
      },
      name: resourceId,
    });

    if (currentClass.root && symbolHeyApiRegistry) {
      const symClient = plugin.getSymbol({
        category: 'client',
      });
      const isClientRequired = !plugin.config.client || !symClient;
      // const symbolClient = plugin.referenceSymbol({
      //   category: 'external',
      //   resource: 'client.Client',
      // });
      const ctor = $.init((i) =>
        i
          .param('args', (p) =>
            p
              .optional(!isClientRequired)
              // .type($.type
              //   .expr('todo')
              //   // .object()
              //   // .prop('client', (p) => p.optional(!isClientRequired).type(symbolClient.placeholder))
              //   // .prop('key', (p) => p.optional().type('string')),
              // )
          )
          .do(
            $('super').call('args'),
            $(symbol.placeholder)
              .attr(registryName)
              .attr('set')
              .call('this', $('args').attr('key').optional(!isClientRequired)),
          ),
      );

      if (!currentClass.nodes.length) {
        currentClass.nodes.unshift(ctor);
      } else {
        currentClass.nodes.unshift(ctor, $.newline());
      }

      const node = createRegistryClass({
        plugin,
        sdkName: symbol.placeholder,
        symbol: symbolHeyApiRegistry,
      });
      plugin.setSymbolValue(symbolHeyApiRegistry, node);
      const registryNode = $.field(registryName, (f) =>
        f
          .public()
          .static()
          .readonly()
          .assign(
            $.new(symbolHeyApiRegistry.placeholder).generic(symbol.placeholder),
          ),
      );
      currentClass.nodes.unshift(registryNode, $.newline());
    }

    const node = $.class(symbol.placeholder)
      .export(symbol.exported)
      .extends(symbolHeyApiClient?.placeholder)
      .$if(currentClass.root && isAngularClient, (c) =>
        c.decorator(
          plugin.referenceSymbol({
            category: 'external',
            resource: '@angular/core.Injectable',
          }).placeholder,
          $.object().prop('providedIn', $.literal('root')),
        ),
      )
      .do(...currentClass.nodes);
    plugin.setSymbolValue(symbol, node);
  };

  for (const sdkClass of sdkClasses.values()) {
    generateClass(sdkClass);
  }
};
