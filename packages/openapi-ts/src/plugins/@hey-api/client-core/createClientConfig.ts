import { clientFolderAbsolutePath } from '../../../generate/client';
import { tsc } from '../../../tsc';
import type { PluginHandler } from './types';

export const createClientConfigType = ({
  plugin,
}: Parameters<PluginHandler>[0]) => {
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const symbolClientOptions = plugin.referenceSymbol(
    pluginTypeScript.api.getSelector('ClientOptions'),
  );
  const symbolConfig = plugin.registerSymbol({
    external: clientModule,
    meta: {
      kind: 'type',
    },
    name: 'Config',
  });
  const symbolDefaultClientOptions = plugin.registerSymbol({
    external: clientModule,
    meta: {
      kind: 'type',
    },
    name: 'ClientOptions',
  });
  const symbolCreateClientConfig = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: 'type',
    },
    name: 'CreateClientConfig',
  });

  const defaultClientOptionsType = tsc.typeReferenceNode({
    typeName: symbolDefaultClientOptions.placeholder,
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
    exportType: symbolCreateClientConfig.exported,
    name: symbolCreateClientConfig.placeholder,
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
            typeName: symbolConfig.placeholder,
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
        typeName: symbolConfig.placeholder,
      }),
    }),
    typeParameters: [
      {
        default: tsc.typeReferenceNode({
          typeName: symbolClientOptions.placeholder,
        }),
        extends: defaultClientOptionsType,
        name: 'T',
      },
    ],
  });
  plugin.setSymbolValue(symbolCreateClientConfig, typeCreateClientConfig);
};
