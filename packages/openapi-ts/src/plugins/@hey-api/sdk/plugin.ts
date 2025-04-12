import type ts from 'typescript';

import { compiler } from '../../../compiler';
import { clientApi, clientModulePath } from '../../../generate/client';
import type { IR } from '../../../ir/types';
import { escapeComment } from '../../../utils/escape';
import { getServiceName } from '../../../utils/postprocess';
import { transformServiceName } from '../../../utils/transform';
import type { Plugin } from '../../types';
import { getClientPlugin } from '../client-core/utils';
import { importIdentifierResponse } from '../typescript/ref';
import { nuxtTypeComposable, nuxtTypeDefault, sdkId } from './constants';
import { createParameters } from './params';
import { serviceFunctionIdentifier } from './plugin-legacy';
import { createStatements } from './statements';
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
  const sdks = new Map<string, Array<ts.MethodDeclaration>>();

  context.subscribe('operation', ({ operation }) => {
    const identifierResponse = importIdentifierResponse({
      context,
      file,
      operation,
    });
    const parameters = createParameters({
      context,
      file,
      operation,
      plugin,
    });
    const node = compiler.methodDeclaration({
      accessLevel: 'public',
      comment: [
        operation.deprecated && '@deprecated',
        operation.summary && escapeComment(operation.summary),
        operation.description && escapeComment(operation.description),
      ],
      isStatic: true,
      name: serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: false,
        id: operation.id,
        operation,
      }),
      parameters,
      returnType: undefined,
      statements: createStatements({
        context,
        operation,
        parameters,
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

    const uniqueTags = Array.from(new Set(operation.tags));
    if (!uniqueTags.length) {
      uniqueTags.push('default');
    }

    for (const tag of uniqueTags) {
      const name = getServiceName(tag);
      const nodes = sdks.get(name) ?? [];
      nodes.push(node);
      sdks.set(name, nodes);
    }
  });

  context.subscribe('after', () => {
    for (const [name, nodes] of sdks) {
      const node = compiler.classDeclaration({
        decorator: undefined,
        members: nodes,
        name: transformServiceName({
          config: context.config,
          name,
        }),
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
    const identifierResponse = importIdentifierResponse({
      context,
      file,
      operation,
    });
    const parameters = createParameters({
      context,
      file,
      operation,
      plugin,
    });
    const node = compiler.constVariable({
      comment: [
        operation.deprecated && '@deprecated',
        operation.summary && escapeComment(operation.summary),
        operation.description && escapeComment(operation.description),
      ],
      exportConst: true,
      expression: compiler.arrowFunction({
        parameters,
        returnType: undefined,
        statements: createStatements({
          context,
          operation,
          parameters,
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
  file.import({
    asType: true,
    module: clientModule,
    name: 'Params',
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
