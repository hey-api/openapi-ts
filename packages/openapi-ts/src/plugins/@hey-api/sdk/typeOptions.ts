import { clientModulePath } from '../../../generate/client';
import type { FileImportResult } from '../../../generate/file/types';
import { tsc } from '../../../tsc';
import { getClientPlugin } from '../client-core/utils';
import { nuxtTypeDefault, nuxtTypeResponse, sdkId } from './constants';
import type { HeyApiSdkPlugin } from './types';

export const createTypeOptions = ({
  clientOptions,
  plugin,
}: {
  clientOptions: FileImportResult<string, string>;
  plugin: HeyApiSdkPlugin['Instance'];
}) => {
  const file = plugin.context.file({ id: sdkId })!;
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const clientModule = clientModulePath({
    config: plugin.context.config,
    sourceOutput: file.nameWithoutExtension(),
  });
  const tDataShape = file.import({
    asType: true,
    module: clientModule,
    name: 'TDataShape',
  });
  const clientType = file.import({
    asType: true,
    module: clientModule,
    name: 'Client',
  });

  const typeOptions = tsc.typeAliasDeclaration({
    exportType: true,
    name: 'Options',
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
          typeName: clientOptions.name,
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
              type: tsc.typeReferenceNode({ typeName: clientType.name }),
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
            constraint: tsc.typeReferenceNode({ typeName: 'Composable' }),
            name: 'TComposable',
          }),
          tsc.typeParameterDeclaration({
            constraint: tsc.typeReferenceNode({
              typeName: tDataShape.name,
            }),
            defaultType: tsc.typeReferenceNode({
              typeName: tDataShape.name,
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
              typeName: tDataShape.name,
            }),
            defaultType: tsc.typeReferenceNode({
              typeName: tDataShape.name,
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

  file.add(typeOptions);
};
