import type { SymbolMeta } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import { toCase } from '@hey-api/shared';

import type { TypeTsDsl } from '../../../../../ts-dsl';
import { $ } from '../../../../../ts-dsl';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const stringToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): TypeTsDsl => {
  if (schema.const !== undefined) {
    return $.type.literal(schema.const as string);
  }

  if (schema.format) {
    if (schema.format === 'binary') {
      return $.type.or($.type('Blob'), $.type('File'));
    }

    if (schema.format === 'date-time' || schema.format === 'date') {
      // TODO: parser - add ability to skip type transformers
      if (plugin.getPlugin('@hey-api/transformers')?.config.dates) {
        return $.type('Date');
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
          const symbolTypeId = plugin.symbol('TypeID', {
            meta: queryTypeId,
          });
          const nodeTypeId = $.type
            .alias(symbolTypeId)
            .export()
            .generic('T', (g) => g.extends('string'))
            .type(
              $.type.template().add($.type('T')).add('_').add($.type('string')),
            );
          plugin.node(nodeTypeId);
        }

        const symbolTypeId = plugin.referenceSymbol(queryTypeId);
        const symbolTypeName = plugin.symbol(
          toCase(`${type}_id`, plugin.config.case),
          {
            meta: query,
          },
        );
        const node = $.type
          .alias(symbolTypeName)
          .export()
          .type($.type(symbolTypeId).generic($.type.literal(type)));
        plugin.node(node);
      }
      const symbol = plugin.referenceSymbol(query);
      return $.type(symbol);
    }
  }

  return $.type('string');
};
