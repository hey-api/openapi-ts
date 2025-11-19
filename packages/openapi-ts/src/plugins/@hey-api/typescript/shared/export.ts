import type { Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import type { MaybeTsDsl, TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';
import { numberRegExp } from '~/utils/regexp';
import { stringCase } from '~/utils/stringCase';

import type { HeyApiTypeScriptPlugin } from '../types';

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
  symbol,
  type,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: IR.SchemaObject;
  symbol: Symbol;
  type: MaybeTsDsl<TypeTsDsl>;
}) => {
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

      const objectNode = $.const(symbol.placeholder)
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

      const node = $.type
        .alias(symbol.placeholder)
        .export()
        .$if(createSchemaComment(schema), (t, v) => t.doc(v))
        .type(
          $.type(symbol.placeholder)
            .idx($.type(symbol.placeholder).typeof().keyof())
            .typeof(),
        );
      plugin.setSymbolValue(symbol, [objectNode, node]);
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
        const enumNode = $.enum(symbol.placeholder)
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
        plugin.setSymbolValue(symbol, enumNode);
        return;
      }
    }
  }

  const node = $.type
    .alias(symbol.placeholder)
    .export(symbol.exported)
    .$if(createSchemaComment(schema), (t, v) => t.doc(v))
    .type(type);
  plugin.setSymbolValue(symbol, node);
};
