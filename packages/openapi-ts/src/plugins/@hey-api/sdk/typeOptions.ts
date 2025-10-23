import { clientFolderAbsolutePath } from '~/generate/client';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { tsc } from '~/tsc';

import { nuxtTypeDefault, nuxtTypeResponse } from './constants';
import type { HeyApiSdkPlugin } from './types';

export const createTypeOptions = ({
  plugin,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
}) => {
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const symbolTDataShape = plugin.registerSymbol({
    external: clientModule,
    meta: {
      kind: 'type',
    },
    name: 'TDataShape',
  });
  const symbolClient = plugin.registerSymbol({
    external: clientModule,
    meta: {
      kind: 'type',
    },
    name: 'Client',
    selector: plugin.api.selector('Client'),
  });
  const symbolClientOptions = plugin.registerSymbol({
    external: clientModule,
    meta: {
      kind: 'type',
    },
    name: 'Options',
  });
  const symbolOptions = plugin.registerSymbol({
    exported: true,
    meta: {
      kind: 'type',
    },
    name: 'Options',
    selector: plugin.api.selector('Options'),
  });

  const typeOptions = tsc.typeAliasDeclaration({
    exportType: symbolOptions.exported,
    name: symbolOptions.placeholder,
    type: tsc.typeIntersectionNode({
      types: [
        tsc.typeReferenceNode({
          typeArguments: isNuxtClient
            ? [
                tsc.typeReferenceNode({ typeName: 'TComposable' }),
                tsc.typeReferenceNode({ typeName: 'TData' }),
                tsc.typeReferenceNode({ typeName: nuxtTypeResponse }),
                tsc.typeReferenceNode({ typeName: nuxtTypeDefault }),
              ]
            : [
                tsc.typeReferenceNode({ typeName: 'TData' }),
                tsc.typeReferenceNode({ typeName: 'ThrowOnError' }),
              ],
          typeName: symbolClientOptions.placeholder,
        }),
        tsc.typeInterfaceNode({
          properties: [
            {
              comment: [
                'You can provide a client instance returned by `createClient()` instead of',
                'individual options. This might be also useful if you want to implement a',
                'custom client.',
              ],
              isRequired: !plugin.config.client,
              name: 'client',
              type: tsc.typeReferenceNode({
                typeName: symbolClient.placeholder,
              }),
            },
            {
              comment: [
                'You can pass arbitrary values through the `meta` object. This can be',
                "used to access values that aren't defined as part of the SDK function.",
              ],
              isRequired: false,
              name: 'meta',
              type: tsc.typeReferenceNode({
                typeArguments: [
                  tsc.keywordTypeNode({ keyword: 'string' }),
                  tsc.keywordTypeNode({ keyword: 'unknown' }),
                ],
                typeName: 'Record',
              }),
            },
          ],
          useLegacyResolution: false,
        }),
      ],
    }),
    typeParameters: isNuxtClient
      ? [
          tsc.typeParameterDeclaration({
            constraint: tsc.typeReferenceNode({
              typeName: plugin.referenceSymbol(
                plugin.api.selector('Composable'),
              ).placeholder,
            }),
            defaultType: tsc.typeNode("'$fetch'"),
            name: 'TComposable',
          }),
          tsc.typeParameterDeclaration({
            constraint: tsc.typeReferenceNode({
              typeName: symbolTDataShape.placeholder,
            }),
            defaultType: tsc.typeReferenceNode({
              typeName: symbolTDataShape.placeholder,
            }),
            name: 'TData',
          }),
          tsc.typeParameterDeclaration({
            defaultType: tsc.keywordTypeNode({ keyword: 'unknown' }),
            name: nuxtTypeResponse,
          }),
          tsc.typeParameterDeclaration({
            defaultType: tsc.keywordTypeNode({ keyword: 'undefined' }),
            name: nuxtTypeDefault,
          }),
        ]
      : [
          tsc.typeParameterDeclaration({
            constraint: tsc.typeReferenceNode({
              typeName: symbolTDataShape.placeholder,
            }),
            defaultType: tsc.typeReferenceNode({
              typeName: symbolTDataShape.placeholder,
            }),
            name: 'TData',
          }),
          tsc.typeParameterDeclaration({
            constraint: tsc.keywordTypeNode({ keyword: 'boolean' }),
            defaultType: tsc.keywordTypeNode({ keyword: 'boolean' }),
            name: 'ThrowOnError',
          }),
        ],
  });
  plugin.setSymbolValue(symbolOptions, typeOptions);
};
