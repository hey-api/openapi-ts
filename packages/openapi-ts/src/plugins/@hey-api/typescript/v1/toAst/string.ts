import type { SymbolMeta } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';
import { stringCase } from '~/utils/stringCase';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const stringToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): ts.TypeNode => {
  if (schema.const !== undefined) {
    return tsc.literalTypeNode({
      literal: tsc.stringLiteral({ text: schema.const as string }),
    });
  }

  if (schema.format) {
    if (schema.format === 'binary') {
      return tsc.typeUnionNode({
        types: [
          tsc.typeReferenceNode({
            typeName: 'Blob',
          }),
          tsc.typeReferenceNode({
            typeName: 'File',
          }),
        ],
      });
    }

    if (schema.format === 'date-time' || schema.format === 'date') {
      // TODO: parser - add ability to skip type transformers
      if (plugin.getPlugin('@hey-api/transformers')?.config.dates) {
        return tsc.typeReferenceNode({ typeName: 'Date' });
      }
    }

    if (schema.format === 'typeid' && typeof schema.example === 'string') {
      const parts = String(schema.example).split('_');
      parts.pop(); // remove the ID part
      const type = parts.join('_');

      const query: SymbolMeta = {
        category: 'type',
        resource: 'type-id',
        resourceId: type,
        tool: 'typescript',
      };
      if (!plugin.getSymbol(query)) {
        const queryTypeId: SymbolMeta = {
          category: 'type',
          resource: 'type-id',
          tool: 'typescript',
          variant: 'container',
        };

        if (!plugin.getSymbol(queryTypeId)) {
          const symbolTypeId = plugin.registerSymbol({
            exported: true,
            kind: 'type',
            meta: queryTypeId,
            name: 'TypeID',
          });
          const nodeTypeId = tsc.typeAliasDeclaration({
            exportType: symbolTypeId.exported,
            name: symbolTypeId.placeholder,
            type: tsc.templateLiteralType({
              value: [
                tsc.typeReferenceNode({ typeName: 'T' }),
                '_',
                tsc.keywordTypeNode({ keyword: 'string' }),
              ],
            }),
            typeParameters: [
              tsc.typeParameterDeclaration({
                constraint: tsc.keywordTypeNode({
                  keyword: 'string',
                }),
                name: 'T',
              }),
            ],
          });
          plugin.setSymbolValue(symbolTypeId, nodeTypeId);
        }

        const symbolTypeId = plugin.referenceSymbol(queryTypeId);
        const symbolTypeName = plugin.registerSymbol({
          exported: true,
          kind: 'type',
          meta: query,
          name: stringCase({
            case: plugin.config.case,
            value: `${type}_id`,
          }),
        });
        const node = tsc.typeAliasDeclaration({
          exportType: symbolTypeName.exported,
          name: symbolTypeName.placeholder,
          type: tsc.typeReferenceNode({
            typeArguments: [
              tsc.literalTypeNode({
                literal: tsc.stringLiteral({ text: type }),
              }),
            ],
            typeName: symbolTypeId.placeholder,
          }),
        });
        plugin.setSymbolValue(symbolTypeName, node);
      }
      const symbol = plugin.referenceSymbol(query);
      return tsc.typeReferenceNode({ typeName: symbol.placeholder });
    }
  }

  return tsc.keywordTypeNode({
    keyword: 'string',
  });
};
