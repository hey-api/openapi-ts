import { compiler } from '../../../compiler';
import { clientModulePath } from '../../../generate/client';
import type { IR } from '../../../ir/types';
import { clientId } from '../client-core/utils';
import { typesId } from '../typescript/ref';
import type { PluginHandler } from './types';

const createClientConfigType = ({ context }: { context: IR.Context }) => {
  const file = context.file({ id: clientId })!;

  const clientModule = clientModulePath({
    config: context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const clientOptions = file.import({
    asType: true,
    module: file.relativePathToFile({ context, id: typesId }),
    name: 'ClientOptions',
  });
  const configType = file.import({
    asType: true,
    module: clientModule,
    name: 'Config',
  });
  const defaultClientOptions = file.import({
    alias: 'DefaultClientOptions',
    asType: true,
    module: clientModule,
    name: 'ClientOptions',
  });

  const defaultClientOptionsType = compiler.typeReferenceNode({
    typeName: defaultClientOptions.name,
  });
  const tType = compiler.typeReferenceNode({ typeName: 'T' });

  const typeCreateClientConfig = compiler.typeAliasDeclaration({
    comment: [
      'The `createClientConfig()` function will be called on client initialization',
      "and the returned object will become the client's initial configuration.",
      '',
      'You may want to initialize your client this way instead of calling',
      "`setConfig()`. This is useful for example if you're using Next.js",
      'to ensure your client always has the correct values.',
    ],
    exportType: true,
    name: 'CreateClientConfig',
    type: compiler.functionTypeNode({
      parameters: [
        compiler.parameterDeclaration({
          name: 'override',
          required: false,
          type: compiler.typeReferenceNode({
            typeArguments: [
              compiler.typeIntersectionNode({
                types: [defaultClientOptionsType, tType],
              }),
            ],
            typeName: configType.name,
          }),
        }),
      ],
      returnType: compiler.typeReferenceNode({
        typeArguments: [
          compiler.typeIntersectionNode({
            types: [
              compiler.typeReferenceNode({
                typeArguments: [defaultClientOptionsType],
                typeName: 'Required',
              }),
              tType,
            ],
          }),
        ],
        typeName: configType.name,
      }),
    }),
    typeParameters: [
      {
        default: compiler.typeReferenceNode({ typeName: clientOptions.name }),
        extends: defaultClientOptionsType,
        name: 'T',
      },
    ],
  });

  file.add(typeCreateClientConfig);
};

export const handler: PluginHandler = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: clientId,
    path: plugin.output,
  });

  const clientModule = clientModulePath({
    config: context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const createClient = file.import({
    module: clientModule,
    name: 'createClient',
  });
  const createConfig = file.import({
    module: clientModule,
    name: 'createConfig',
  });
  const clientOptions = file.import({
    asType: true,
    module: file.relativePathToFile({ context, id: typesId }),
    name: 'ClientOptions',
  });

  const createClientConfig = plugin.runtimeConfigPath
    ? file.import({
        module: file.relativePathToFile({
          context,
          id: plugin.runtimeConfigPath,
        }),
        name: 'createClientConfig',
      })
    : undefined;

  const createConfigParameters = [
    compiler.callExpression({
      functionName: createConfig.name,
      parameters: [
        'throwOnError' in plugin && plugin.throwOnError
          ? compiler.objectExpression({
              obj: [
                {
                  key: 'throwOnError',
                  value: true,
                },
              ],
            })
          : undefined,
      ],
      types: [compiler.typeReferenceNode({ typeName: clientOptions.name })],
    }),
  ];

  createClientConfigType({
    context,
  });

  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.callExpression({
      functionName: createClient.name,
      parameters: createClientConfig
        ? [
            compiler.callExpression({
              functionName: createClientConfig.name,
              parameters: createConfigParameters,
            }),
          ]
        : createConfigParameters,
    }),
    name: 'client',
  });
  file.add(statement);
};
