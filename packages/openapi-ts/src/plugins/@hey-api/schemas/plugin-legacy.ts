import { GeneratedFile } from '~/generate/file';
import type { OpenApiV2Schema, OpenApiV3Schema } from '~/openApi';
import { ensureValidTypeScriptJavaScriptIdentifier } from '~/openApi';
import { tsc } from '~/tsc';
import { getConfig } from '~/utils/config';

import type { HeyApiSchemasPlugin } from './types';

const ensureValidSchemaOutput = (
  schema: unknown,
  parentKey?: string,
): object => {
  const config = getConfig();

  if (Array.isArray(schema)) {
    return schema.map((item) => ensureValidSchemaOutput(item));
  }

  if (typeof schema !== 'object' || schema === null) {
    return schema as object;
  }

  const result = { ...schema };
  Object.entries(result).forEach(([key, value]) => {
    if (config.plugins['@hey-api/schemas']?.config.type === 'form') {
      if (
        [
          'description',
          'x-enum-descriptions',
          'x-enum-varnames',
          'x-enumNames',
          'title',
        ].includes(key) &&
        parentKey !== 'properties'
      ) {
        // @ts-expect-error
        delete result[key];
        return;
      }
    }

    // refs are encoded probably by json-schema-ref-parser, didn't investigate
    // further
    if (key === '$ref' && typeof value === 'string') {
      // @ts-expect-error
      result[key] = decodeURIComponent(value);
    }

    if (value && typeof value === 'object') {
      // @ts-expect-error
      result[key] = ensureValidSchemaOutput(value, key);
    }
  });
  return result;
};

const toSchemaName = (
  name: string,
  schema: OpenApiV2Schema | OpenApiV3Schema,
): string => {
  const config = getConfig();

  const validName = ensureValidTypeScriptJavaScriptIdentifier(name);

  const plugin = config.plugins['@hey-api/schemas'];

  if (plugin?.config.nameBuilder) {
    if (typeof plugin.config.nameBuilder === 'function') {
      return plugin.config.nameBuilder(validName, schema);
    } else {
      return plugin.config.nameBuilder.replace('{{name}}', validName);
    }
  }

  return `${validName}Schema`;
};

export const handlerLegacy: HeyApiSchemasPlugin['LegacyHandler'] = ({
  files,
  openApi,
  plugin,
}) => {
  const config = getConfig();

  files.schemas = new GeneratedFile({
    dir: config.output.path,
    exportFromIndex: plugin.config.exportFromIndex,
    id: 'schemas',
    name: 'schemas.ts',
  });

  const addSchema = (
    name: string,
    schema: OpenApiV2Schema | OpenApiV3Schema,
  ) => {
    const obj = ensureValidSchemaOutput(schema);
    const expression = tsc.objectExpression({ obj });
    const statement = tsc.constVariable({
      assertion: 'const',
      exportConst: true,
      expression,
      name: toSchemaName(name, schema),
    });
    files.schemas!.add(statement);
  };

  // OpenAPI 2.0
  if ('swagger' in openApi) {
    Object.entries(openApi.definitions ?? {}).forEach(([name, definition]) => {
      addSchema(name, definition);
    });
  }

  // OpenAPI 3.x
  if ('openapi' in openApi) {
    Object.entries(openApi.components?.schemas ?? {}).forEach(
      ([name, schema]) => {
        addSchema(name, schema);
      },
    );
  }
};
