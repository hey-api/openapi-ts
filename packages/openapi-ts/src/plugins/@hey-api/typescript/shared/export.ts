import { fromRef } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming, toCase } from '@hey-api/shared';
import { pathToJsonPointer, refToName } from '@hey-api/shared';

import { createSchemaComment } from '../../../../plugins/shared/utils/schema';
import type { MaybeTsDsl, TypeTsDsl } from '../../../../ts-dsl';
import { $, regexp } from '../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin } from '../types';
import type { IrSchemaToAstOptions } from './types';

const schemaToEnumObject = ({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
}) => {
  const typeofItems: Array<
    'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined'
  > = [];

  const obj = (schema.items ?? []).map((item, index) => {
    const typeOfItemConst = typeof item.const;

    if (!typeofItems.includes(typeOfItemConst)) {
      // track types of enum values because some modes support
      // only enums with string and number types
      typeofItems.push(typeOfItemConst);
    }

    let key: string | undefined;
    if (item.title) {
      key = item.title;
    } else if (typeOfItemConst === 'number' || typeOfItemConst === 'string') {
      key = `${item.const}`;
    } else if (typeOfItemConst === 'boolean') {
      key = item.const ? 'true' : 'false';
    } else if (item.const === null) {
      key = 'null';
    } else {
      key = `${index}`;
    }

    if (key) {
      key = toCase(key, plugin.config.enums.case, {
        stripLeadingSeparators: false,
      });

      regexp.number.lastIndex = 0;
      // TypeScript enum keys cannot be numbers
      if (
        regexp.number.test(key) &&
        plugin.config.enums.enabled &&
        (plugin.config.enums.mode === 'typescript' ||
          plugin.config.enums.mode === 'typescript-const')
      ) {
        key = `_${key}`;
      }
    }

    return {
      key,
      schema: item,
    };
  });

  return {
    obj,
    typeofItems,
  };
};

export const exportType = ({
  plugin,
  schema,
  state,
  type,
}: IrSchemaToAstOptions & {
  schema: IR.SchemaObject;
  type: MaybeTsDsl<TypeTsDsl>;
}) => {
  const $ref = pathToJsonPointer(fromRef(state.path));

  // root enums have an additional export
  if (schema.type === 'enum' && plugin.config.enums.enabled) {
    const enumObject = schemaToEnumObject({ plugin, schema });

    if (plugin.config.enums.mode === 'javascript') {
      // JavaScript enums might want to ignore null values
      if (plugin.config.enums.constantsIgnoreNull && enumObject.typeofItems.includes('object')) {
        enumObject.obj = enumObject.obj.filter((item) => item.schema.const !== null);
      }

      const symbolObject = plugin.symbol(applyNaming(refToName($ref), plugin.config.definitions), {
        meta: {
          category: 'utility',
          path: fromRef(state.path),
          resource: 'definition',
          resourceId: $ref,
          tags: fromRef(state.tags),
          tool: 'typescript',
        },
      });
      const objectNode = $.const(symbolObject)
        .export()
        .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
        .assign(
          $.object(
            ...enumObject.obj.map((item) =>
              $.prop({ kind: 'prop', name: item.key })
                .$if(plugin.config.comments && createSchemaComment(item.schema), (p, v) => p.doc(v))
                .value($.fromValue(item.schema.const)),
            ),
          ).as('const'),
        );
      plugin.node(objectNode);

      const symbol = plugin.symbol(applyNaming(refToName($ref), plugin.config.definitions), {
        meta: {
          category: 'type',
          path: fromRef(state.path),
          resource: 'definition',
          resourceId: $ref,
          tags: fromRef(state.tags),
          tool: 'typescript',
        },
      });
      const node = $.type
        .alias(symbol)
        .export()
        .$if(plugin.config.comments && createSchemaComment(schema), (t, v) => t.doc(v))
        .type($.type(symbol).idx($.type(symbol).typeofType().keyof()).typeofType());
      plugin.node(node);
      return;
    } else if (
      plugin.config.enums.mode === 'typescript' ||
      plugin.config.enums.mode === 'typescript-const'
    ) {
      // TypeScript enums support only string and number values
      const shouldCreateTypeScriptEnum = !enumObject.typeofItems.some(
        (type) => type !== 'number' && type !== 'string',
      );
      if (shouldCreateTypeScriptEnum) {
        const symbol = plugin.symbol(applyNaming(refToName($ref), plugin.config.definitions), {
          meta: {
            category: 'type',
            path: fromRef(state.path),
            resource: 'definition',
            resourceId: $ref,
            tags: fromRef(state.tags),
            tool: 'typescript',
          },
        });
        const enumNode = $.enum(symbol)
          .export()
          .$if(plugin.config.comments && createSchemaComment(schema), (e, v) => e.doc(v))
          .const(plugin.config.enums.mode === 'typescript-const')
          .members(
            ...enumObject.obj.map((item) =>
              $.member(item.key)
                .$if(plugin.config.comments && createSchemaComment(item.schema), (m, v) => m.doc(v))
                .value($.fromValue(item.schema.const)),
            ),
          );
        plugin.node(enumNode);
        return;
      }
    }
  }

  const symbol = plugin.symbol(applyNaming(refToName($ref), plugin.config.definitions), {
    meta: {
      category: 'type',
      path: fromRef(state.path),
      resource: 'definition',
      resourceId: $ref,
      tags: fromRef(state.tags),
      tool: 'typescript',
    },
  });
  const node = $.type
    .alias(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (t, v) => t.doc(v))
    .type(type);
  plugin.node(node);
};
