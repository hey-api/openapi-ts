import { fromRef } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import type { MaybeTsDsl, TypeTsDsl } from '~/ts-dsl';
import { $, numberRegExp } from '~/ts-dsl';
import { pathToJsonPointer, refToName } from '~/utils/ref';
import { stringCase } from '~/utils/stringCase';

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
    | 'bigint'
    | 'boolean'
    | 'function'
    | 'number'
    | 'object'
    | 'string'
    | 'symbol'
    | 'undefined'
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
      key = stringCase({
        case: plugin.config.enums.case,
        stripLeadingSeparators: false,
        value: key,
      });

      numberRegExp.lastIndex = 0;
      // TypeScript enum keys cannot be numbers
      if (
        numberRegExp.test(key) &&
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
      if (
        plugin.config.enums.constantsIgnoreNull &&
        enumObject.typeofItems.includes('object')
      ) {
        enumObject.obj = enumObject.obj.filter(
          (item) => item.schema.const !== null,
        );
      }

      const symbolObject = plugin.registerSymbol({
        meta: {
          category: 'utility',
          path: fromRef(state.path),
          resource: 'definition',
          resourceId: $ref,
          tags: fromRef(state.tags),
          tool: 'typescript',
        },
        name: buildName({
          config: plugin.config.definitions,
          name: refToName($ref),
        }),
      });
      const objectNode = $.const(symbolObject)
        .export()
        .$if(createSchemaComment(schema), (c, v) => c.doc(v))
        .assign(
          $.object(
            ...enumObject.obj.map((item) =>
              $.prop({ kind: 'prop', name: item.key })
                .$if(createSchemaComment(item.schema), (p, v) => p.doc(v))
                .value($.fromValue(item.schema.const)),
            ),
          ).as('const'),
        );
      plugin.addNode(objectNode);

      const symbol = plugin.registerSymbol({
        meta: {
          category: 'type',
          path: fromRef(state.path),
          resource: 'definition',
          resourceId: $ref,
          tags: fromRef(state.tags),
          tool: 'typescript',
        },
        name: buildName({
          config: plugin.config.definitions,
          name: refToName($ref),
        }),
      });
      const node = $.type
        .alias(symbol)
        .export()
        .$if(createSchemaComment(schema), (t, v) => t.doc(v))
        .type(
          $.type(symbol).idx($.type(symbol).typeofType().keyof()).typeofType(),
        );
      plugin.addNode(node);
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
        const symbol = plugin.registerSymbol({
          meta: {
            category: 'type',
            path: fromRef(state.path),
            resource: 'definition',
            resourceId: $ref,
            tags: fromRef(state.tags),
            tool: 'typescript',
          },
          name: buildName({
            config: plugin.config.definitions,
            name: refToName($ref),
          }),
        });
        const enumNode = $.enum(symbol)
          .export()
          .$if(createSchemaComment(schema), (e, v) => e.doc(v))
          .const(plugin.config.enums.mode === 'typescript-const')
          .members(
            ...enumObject.obj.map((item) =>
              $.member(item.key)
                .$if(createSchemaComment(item.schema), (m, v) => m.doc(v))
                .value($.fromValue(item.schema.const)),
            ),
          );
        plugin.addNode(enumNode);
        return;
      }
    }
  }

  const symbol = plugin.registerSymbol({
    meta: {
      category: 'type',
      path: fromRef(state.path),
      resource: 'definition',
      resourceId: $ref,
      tags: fromRef(state.tags),
      tool: 'typescript',
    },
    name: buildName({
      config: plugin.config.definitions,
      name: refToName($ref),
    }),
  });
  const node = $.type
    .alias(symbol)
    .export()
    .$if(createSchemaComment(schema), (t, v) => t.doc(v))
    .type(type);
  plugin.addNode(node);
};
