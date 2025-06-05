import ts from 'typescript';

import { compiler } from '../../../compiler';
import { clientApi, clientModulePath } from '../../../generate/client';
import type { IR } from '../../../ir/types';
import { sanitizeNamespaceIdentifier } from '../../../openApi';
import { stringCase } from '../../../utils/stringCase';
import { transformClassName } from '../../../utils/transform';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '../../shared/utils/operation';
import type { Plugin } from '../../types';
import { getClientPlugin } from '../client-core/utils';
import { importIdentifier } from '../typescript/ref';
import { nuxtTypeComposable, nuxtTypeDefault, sdkId } from './constants';
import {
  getOperationTags,
  operationOptionsType,
  operationStatements,
} from './operation';
import { serviceFunctionIdentifier } from './plugin-legacy';
import { createTypeOptions } from './typeOptions';
import type { Config } from './types';

const generateClassSdk = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = context.file({ id: sdkId })!;
  const sdks = new Map<string, Array<ts.ClassElement>>();

  context.subscribe('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context,
      operation,
    });
    const identifierResponse = importIdentifier({
      context,
      file,
      operation,
      type: 'response',
    });
    const node = compiler.methodDeclaration({
      accessLevel: 'public',
      comment: createOperationComment({ operation }),
      isStatic: !plugin.instance,
      name: serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: false,
        id: operation.id,
        operation,
      }),
      parameters: [
        {
          isRequired: isRequiredOptions,
          name: 'options',
          type: operationOptionsType({
            context,
            file,
            operation,
            throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
          }),
        },
      ],
      returnType: undefined,
      statements: operationStatements({
        context,
        isRequiredOptions,
        operation,
        plugin,
      }),
      types: isNuxtClient
        ? [
            {
              // default: compiler.ots.string('$fetch'),
              extends: compiler.typeNode('Composable'),
              name: nuxtTypeComposable,
            },
            {
              default: identifierResponse.name
                ? compiler.typeReferenceNode({
                    typeName: identifierResponse.name,
                  })
                : compiler.typeNode('undefined'),
              extends: identifierResponse.name
                ? compiler.typeReferenceNode({
                    typeName: identifierResponse.name,
                  })
                : undefined,
              name: nuxtTypeDefault,
            },
          ]
        : [
            {
              default:
                ('throwOnError' in client ? client.throwOnError : false) ??
                false,
              extends: 'boolean',
              name: 'ThrowOnError',
            },
          ],
    });

    const tags = getOperationTags({ operation, plugin });
    for (const tag of tags) {
      const name = stringCase({
        case: 'PascalCase',
        value: sanitizeNamespaceIdentifier(tag),
      });
      const nodes = sdks.get(name) ?? [];
      if (nodes.length) {
        // @ts-expect-error
        nodes.push(compiler.identifier({ text: '\n' }));
      }
      nodes.push(node);
      sdks.set(name, nodes);
    }
  });

  context.subscribe('after', () => {
    for (const [name, nodes] of sdks) {
      if (plugin.instance) {
        const clientAssignmentStatement = compiler.expressionToStatement({
          expression: compiler.binaryExpression({
            left: compiler.propertyAccessExpression({
              expression: compiler.this(),
              name: 'client',
            }),
            operator: '=',
            right: compiler.identifier({ text: 'client' }),
          }),
        });
        nodes.unshift(
          compiler.propertyDeclaration({
            initializer: plugin.client
              ? compiler.identifier({ text: '_heyApiClient' })
              : undefined,
            name: 'client',
            type: ts.factory.createTypeReferenceNode('Client'),
          }),
          // @ts-expect-error
          compiler.identifier({ text: '\n' }),
          compiler.constructorDeclaration({
            multiLine: true,
            parameters: [
              {
                destructure: [
                  {
                    name: 'client',
                  },
                ],
                type: compiler.typeInterfaceNode({
                  properties: [
                    {
                      isRequired: !plugin.client,
                      name: 'client',
                      type: 'Client',
                    },
                  ],
                  useLegacyResolution: false,
                }),
              },
            ],
            statements: [
              !plugin.client
                ? clientAssignmentStatement
                : compiler.ifStatement({
                    expression: compiler.identifier({ text: 'client' }),
                    thenStatement: compiler.block({
                      statements: [clientAssignmentStatement],
                    }),
                  }),
            ],
          }),
          compiler.identifier({ text: '\n' }),
        );
      }

      const node = compiler.classDeclaration({
        exportClass: true,
        name: transformClassName({
          config: context.config,
          name,
        }),
        nodes,
      });
      file.add(node);
    }
  });
};

const generateFlatSdk = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  const file = context.file({ id: sdkId })!;

  context.subscribe('operation', ({ operation }) => {
    const isRequiredOptions = isOperationOptionsRequired({
      context,
      operation,
    });
    const identifierResponse = importIdentifier({
      context,
      file,
      operation,
      type: 'response',
    });
    const node = compiler.constVariable({
      comment: createOperationComment({ operation }),
      exportConst: true,
      expression: compiler.arrowFunction({
        parameters: [
          {
            isRequired: isRequiredOptions,
            name: 'options',
            type: operationOptionsType({
              context,
              file,
              operation,
              throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
            }),
          },
        ],
        returnType: undefined,
        statements: operationStatements({
          context,
          isRequiredOptions,
          operation,
          plugin,
        }),
        types: isNuxtClient
          ? [
              {
                // default: compiler.ots.string('$fetch'),
                extends: compiler.typeNode('Composable'),
                name: nuxtTypeComposable,
              },
              {
                default: identifierResponse.name
                  ? compiler.typeReferenceNode({
                      typeName: identifierResponse.name,
                    })
                  : compiler.typeNode('undefined'),
                extends: identifierResponse.name
                  ? compiler.typeReferenceNode({
                      typeName: identifierResponse.name,
                    })
                  : undefined,
                name: nuxtTypeDefault,
              },
            ]
          : [
              {
                default:
                  ('throwOnError' in client ? client.throwOnError : false) ??
                  false,
                extends: 'boolean',
                name: 'ThrowOnError',
              },
            ],
      }),
      name: serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: true,
        id: operation.id,
        operation,
      }),
    });
    file.add(node);
  });
};

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: sdkId,
    path: plugin.output,
  });

  // import required packages and core files
  const clientModule = clientModulePath({
    config: context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const clientOptions = file.import({
    ...clientApi.Options,
    alias: 'ClientOptions',
    module: clientModule,
  });

  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';
  if (isNuxtClient) {
    file.import({
      asType: true,
      module: clientModule,
      name: 'Composable',
    });
  }

  createTypeOptions({
    clientOptions,
    context,
    plugin,
  });

  if (plugin.asClass) {
    generateClassSdk({ context, plugin });
  } else {
    generateFlatSdk({ context, plugin });
  }
};
