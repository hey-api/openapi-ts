import ts from 'typescript';

import { compiler } from '../../../compiler';
import { clientModulePath } from '../../../generate/client';
import type { FileImportResult } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import type { Plugin } from '../../types';
import { getClientPlugin } from '../client-core/utils';
import { nuxtTypeDefault, nuxtTypeResponse } from './constants';
import { sdkId } from './plugin';
import type { Config } from './types';

export const createTypeOptions = ({
  clientOptions,
  context,
  plugin,
}: {
  clientOptions: FileImportResult;
  context: IR.Context;
  plugin: Plugin.Instance<Config>;
}) => {
  const file = context.file({ id: sdkId })!;
  const client = getClientPlugin(context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const clientModule = clientModulePath({
    config: context.config,
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

  const typeOptions = compiler.typeAliasDeclaration({
    exportType: true,
    name: 'Options',
    type: compiler.typeIntersectionNode({
      types: [
        compiler.typeReferenceNode({
          typeArguments: isNuxtClient
            ? [
                compiler.typeReferenceNode({ typeName: 'TComposable' }),
                compiler.typeReferenceNode({ typeName: 'TData' }),
                compiler.typeReferenceNode({ typeName: nuxtTypeResponse }),
                compiler.typeReferenceNode({ typeName: nuxtTypeDefault }),
              ]
            : [
                compiler.typeReferenceNode({ typeName: 'TData' }),
                compiler.typeReferenceNode({ typeName: 'ThrowOnError' }),
              ],
          typeName: clientOptions.name,
        }),
        compiler.typeInterfaceNode({
          properties: [
            {
              comment: [
                'You can provide a client instance returned by `createClient()` instead of',
                'individual options. This might be also useful if you want to implement a',
                'custom client.',
              ],
              isRequired: !plugin.client,
              name: 'client',
              type: compiler.typeReferenceNode({ typeName: clientType.name }),
            },
            {
              comment: [
                'You can pass arbitrary values through the `meta` object. This can be',
                "used to access values that aren't defined as part of the SDK function.",
              ],
              isRequired: false,
              name: 'meta',
              type: compiler.typeReferenceNode({
                typeArguments: [
                  compiler.keywordTypeNode({ keyword: 'string' }),
                  compiler.keywordTypeNode({ keyword: 'unknown' }),
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
          compiler.typeParameterDeclaration({
            constraint: compiler.typeReferenceNode({ typeName: 'Composable' }),
            name: 'TComposable',
          }),
          compiler.typeParameterDeclaration({
            constraint: compiler.typeReferenceNode({
              typeName: tDataShape.name,
            }),
            defaultType: compiler.typeReferenceNode({
              typeName: tDataShape.name,
            }),
            name: 'TData',
          }),
          compiler.typeParameterDeclaration({
            defaultType: compiler.keywordTypeNode({ keyword: 'unknown' }),
            name: nuxtTypeResponse,
          }),
          compiler.typeParameterDeclaration({
            defaultType: compiler.keywordTypeNode({ keyword: 'undefined' }),
            name: nuxtTypeDefault,
          }),
        ]
      : [
          compiler.typeParameterDeclaration({
            constraint: compiler.typeReferenceNode({
              typeName: tDataShape.name,
            }),
            defaultType: compiler.typeReferenceNode({
              typeName: tDataShape.name,
            }),
            name: 'TData',
          }),
          compiler.typeParameterDeclaration({
            constraint: compiler.keywordTypeNode({ keyword: 'boolean' }),
            defaultType: compiler.keywordTypeNode({ keyword: 'boolean' }),
            name: 'ThrowOnError',
          }),
        ],
  });

  file.add(typeOptions);
};

export const createTypeOmitNever = ({ context }: { context: IR.Context }) => {
  const file = context.file({ id: sdkId })!;

  const neverType = compiler.keywordTypeNode({ keyword: 'never' });
  const kType = compiler.typeReferenceNode({ typeName: 'K' });
  const tType = compiler.typeReferenceNode({ typeName: 'T' });
  const kOfTType = compiler.indexedAccessTypeNode({
    indexType: kType,
    objectType: tType,
  });

  const omitNeverTypeAlias = compiler.typeAliasDeclaration({
    exportType: true,
    name: 'OmitNever',
    type: ts.factory.createMappedTypeNode(
      undefined,
      ts.factory.createTypeParameterDeclaration(
        undefined,
        'K',
        ts.factory.createTypeOperatorNode(ts.SyntaxKind.KeyOfKeyword, tType),
        undefined,
      ),
      ts.factory.createConditionalTypeNode(
        kOfTType,
        neverType,
        neverType,
        kType,
      ),
      undefined,
      kOfTType,
      undefined,
    ),
    typeParameters: [{ name: 'T' }],
  });

  file.add(omitNeverTypeAlias);
};
