import type { ICodegenSymbolOut } from '@hey-api/codegen-core';

import { clientModulePath } from '../../../generate/client';
import { tsc } from '../../../tsc';
import { getClientPlugin } from '../client-core/utils';
import { nuxtTypeDefault, nuxtTypeResponse } from './constants';
import type { HeyApiSdkPlugin } from './types';

export const createTypeOptions = ({
  clientOptions,
  plugin,
}: {
  clientOptions: ICodegenSymbolOut;
  plugin: HeyApiSdkPlugin['Instance'];
}) => {
  const f = plugin.gen.ensureFile(plugin.output);
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const clientModule = clientModulePath({
    config: plugin.context.config,
    sourceOutput: f.path,
  });
  const symbolTDataShape = f.addSymbol({ name: 'TDataShape' });
  const symbolClient = f.addSymbol({ name: 'Client' });
  f.addImport({
    aliases: {
      [symbolClient.name]: symbolClient.placeholder,
      [symbolTDataShape.name]: symbolTDataShape.placeholder,
    },
    from: clientModule,
    typeNames: [symbolClient.name, symbolTDataShape.name],
  });

  const symbolOptions = f.addSymbol({
    name: 'Options',
    selector: plugin.api.getSelector('Options'),
  });
  const typeOptions = tsc.typeAliasDeclaration({
    exportType: true,
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
          typeName: clientOptions.placeholder,
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
            constraint: tsc.typeReferenceNode({ typeName: 'Composable' }),
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
  f.patchSymbol(symbolOptions.id, { value: typeOptions });
};
