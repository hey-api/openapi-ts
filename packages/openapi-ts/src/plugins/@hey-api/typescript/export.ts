import type { ICodegenSymbolOut } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { numberRegExp } from '../../../utils/regexp';
import { stringCase } from '../../../utils/stringCase';
import { createSchemaComment } from '../../shared/utils/schema';
import type { HeyApiTypeScriptPlugin } from './types';

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
      comments: createSchemaComment({ schema: item }),
      key,
      value: item.const,
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
  symbol: ICodegenSymbolOut;
  type: ts.TypeNode;
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
        enumObject.obj = enumObject.obj.filter((item) => item.value !== null);
      }

      const objectNode = tsc.constVariable({
        assertion: 'const',
        comment: createSchemaComment({ schema }),
        exportConst: true,
        expression: tsc.objectExpression({
          multiLine: true,
          obj: enumObject.obj,
        }),
        name: symbol.placeholder,
      });

      const typeofType = tsc.typeOfExpression({
        text: symbol.placeholder,
      }) as unknown as ts.TypeNode;
      const node = tsc.typeAliasDeclaration({
        comment: createSchemaComment({ schema }),
        exportType: true,
        name: symbol.placeholder,
        type: tsc.indexedAccessTypeNode({
          indexType: tsc.typeOperatorNode({
            operator: 'keyof',
            type: typeofType,
          }),
          objectType: typeofType,
        }),
      });

      symbol.update({ value: [objectNode, node] });
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
        const enumNode = tsc.enumDeclaration({
          asConst: plugin.config.enums.mode === 'typescript-const',
          leadingComment: createSchemaComment({ schema }),
          name: symbol.placeholder,
          obj: enumObject.obj,
        });
        symbol.update({ value: enumNode });
        return;
      }
    }
  }

  const node = tsc.typeAliasDeclaration({
    comment: createSchemaComment({ schema }),
    exportType: true,
    name: symbol.placeholder,
    type,
  });
  symbol.update({ value: node });
};
