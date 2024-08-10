import { compiler, TypeScriptFile } from '../compiler';
import type { OpenApi } from '../openApi';
import { ensureValidTypeScriptJavaScriptIdentifier } from '../openApi/common/parser/sanitize';
import type { Files } from '../types/utils';
import { getConfig } from '../utils/config';

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
    if (config.schemas.type === 'form') {
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
        // @ts-ignore
        delete result[key];
        return;
      }
    }

    // refs are encoded probably by json-schema-ref-parser, didn't investigate
    // further
    if (key === '$ref' && typeof value === 'string') {
      // @ts-ignore
      result[key] = decodeURIComponent(value);
    }

    if (value && typeof value === 'object') {
      // @ts-ignore
      result[key] = ensureValidSchemaOutput(value, key);
    }
  });
  return result;
};

export const generateSchemas = async ({
  files,
  openApi,
}: {
  files: Files;
  openApi: OpenApi;
}): Promise<void> => {
  const config = getConfig();

  if (!config.schemas.export) {
    return;
  }

  files.schemas = new TypeScriptFile({
    dir: config.output.path,
    name: 'schemas.ts',
  });

  const addSchema = (name: string, schema: object) => {
    const validName = `$${ensureValidTypeScriptJavaScriptIdentifier(name)}`;
    const obj = ensureValidSchemaOutput(schema);
    const expression = compiler.objectExpression({ obj });
    const statement = compiler.constVariable({
      assertion: 'const',
      exportConst: true,
      expression,
      name: validName,
    });
    files.schemas.add(statement);
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
