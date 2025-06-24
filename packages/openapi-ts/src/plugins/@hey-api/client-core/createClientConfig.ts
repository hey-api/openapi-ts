import { compiler } from '../../../compiler';
import { clientModulePath } from '../../../generate/client';
import { clientId } from '../client-core/utils';
import { typesId } from '../typescript/ref';
import type { PluginHandler } from './types';

export const createClientConfigType = ({
  plugin,
}: Parameters<PluginHandler>[0]) => {
  const file = plugin.context.file({ id: clientId })!;

  const clientModule = clientModulePath({
    config: plugin.context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const clientOptions = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
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
