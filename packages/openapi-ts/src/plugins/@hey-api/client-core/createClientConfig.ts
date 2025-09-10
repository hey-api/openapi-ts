import { clientModulePath } from '../../../generate/client';
import { tsc } from '../../../tsc';
import type { PluginHandler } from './types';

export const createClientConfigType = ({
  plugin,
}: Parameters<PluginHandler>[0]) => {
  const f = plugin.gen.ensureFile(plugin.output);

  const clientModule = clientModulePath({
    config: plugin.context.config,
    sourceOutput: f.path,
  });
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const symbolClientOptions = plugin.gen.selectSymbolFirstOrThrow(
    pluginTypeScript.api.getSelector('ClientOptions'),
  );
  f.addImport({
    from: symbolClientOptions.file,
    typeNames: [symbolClientOptions.placeholder],
  });
  const symbolConfig = f.addSymbol({ name: 'Config' });
  const symbolDefaultClientOptions = f.addSymbol({
    name: 'DefaultClientOptions',
  });
  f.addImport({
    aliases: {
      ClientOptions: symbolDefaultClientOptions.placeholder,
      [symbolConfig.name]: symbolConfig.placeholder,
    },
    from: clientModule,
    typeNames: ['ClientOptions', symbolConfig.name],
  });

  const defaultClientOptionsType = tsc.typeReferenceNode({
    typeName: symbolDefaultClientOptions.placeholder,
  });
  const tType = tsc.typeReferenceNode({ typeName: 'T' });

  const symbolCreateClientConfig = f.addSymbol({ name: 'CreateClientConfig' });
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
  symbolCreateClientConfig.update({ value: typeCreateClientConfig });
};
