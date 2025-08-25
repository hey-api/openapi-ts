import { clientModulePath } from '../../../generate/client';
import { tsc } from '../../../tsc';
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
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const clientOptions = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ type: 'ClientOptions' }),
    ),
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

  const defaultClientOptionsType = tsc.typeReferenceNode({
    typeName: defaultClientOptions.name,
  });
  const tType = tsc.typeReferenceNode({ typeName: 'T' });

  const typeCreateClientConfig = tsc.typeAliasDeclaration({
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
    type: tsc.functionTypeNode({
      parameters: [
        tsc.parameterDeclaration({
          name: 'override',
          required: false,
          type: tsc.typeReferenceNode({
            typeArguments: [
              tsc.typeIntersectionNode({
                types: [defaultClientOptionsType, tType],
              }),
            ],
            typeName: configType.name,
          }),
        }),
      ],
      returnType: tsc.typeReferenceNode({
        typeArguments: [
          tsc.typeIntersectionNode({
            types: [
              tsc.typeReferenceNode({
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
        default: clientOptions.name
          ? tsc.typeReferenceNode({ typeName: clientOptions.name })
          : undefined,
        extends: defaultClientOptionsType,
        name: 'T',
      },
    ],
  });

  file.add(typeCreateClientConfig);
};
