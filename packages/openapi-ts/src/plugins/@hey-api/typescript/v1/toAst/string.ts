import type { SymbolMeta } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import { toCase } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin, TypeScriptResult } from '../../shared/types';

export function stringToAst({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}): TypeScriptResult['type'] {
  if (schema.const !== undefined) {
    return $.type.fromValue(schema.const);
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
      const typeidBase = parts.join('_');

      const typeidQuery: SymbolMeta = {
        category: 'type',
        resource: 'type-id',
        resourceId: typeidBase,
        tool: 'typescript',
      };
      if (!plugin.getSymbol(typeidQuery)) {
        const containerQuery: SymbolMeta = {
          category: 'type',
          resource: 'type-id',
          tool: 'typescript',
          variant: 'container',
        };

        if (!plugin.getSymbol(containerQuery)) {
          const symbolTypeId = plugin.symbol('TypeID', {
            meta: containerQuery,
          });
          const nodeTypeId = $.type
            .alias(symbolTypeId)
            .export()
            .generic('T', (g) => g.extends('string'))
            .type($.type.template().add($.type('T')).add('_').add($.type('string')));
          plugin.node(nodeTypeId);
        }

        const refSymbol = plugin.referenceSymbol(containerQuery);
        const symbolTypeName = plugin.symbol(toCase(`${typeidBase}_id`, plugin.config.case), {
          meta: typeidQuery,
        });
        const node = $.type
          .alias(symbolTypeName)
          .export()
          .type($.type(refSymbol).generic($.type.literal(typeidBase)));
        plugin.node(node);
      }
      return $.type(plugin.referenceSymbol(typeidQuery));
    }
  }

  return $.type('string');
}
