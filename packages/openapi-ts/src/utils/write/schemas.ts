import { compiler, TypeScriptFile } from '../../compiler';
import type { OpenApi } from '../../openApi';
import { ensureValidTypeScriptJavaScriptIdentifier } from '../../openApi/common/parser/sanitize';
import { getConfig } from '../config';

const schemaToFormSchema = (schema: unknown): object => {
  if (Array.isArray(schema)) {
    return schema.map((item) => schemaToFormSchema(item));
  }

  if (typeof schema !== 'object' || schema === null) {
    return schema as object;
  }

  const result = { ...schema };
  Object.entries(result).forEach(([key, value]) => {
    if (
      [
        'description',
        'x-enum-descriptions',
        'x-enum-varnames',
        'x-enumNames',
      ].includes(key)
    ) {
      // @ts-ignore
      delete result[key];
      return;
    }

    if (value && typeof value === 'object') {
      // @ts-ignore
      result[key] = schemaToFormSchema(value);
    }
  });
  return result;
};

export const processSchemas = async ({
  file,
  openApi,
}: {
  file?: TypeScriptFile;
  openApi: OpenApi;
}): Promise<void> => {
  if (!file) {
    return;
  }

  const config = getConfig();

  const addSchema = (name: string, schema: object) => {
    const validName = `$${ensureValidTypeScriptJavaScriptIdentifier(name)}`;
    const obj =
      config.schemas.type === 'form' ? schemaToFormSchema(schema) : schema;
    const expression = compiler.types.object({ obj });
    const statement = compiler.export.asConst(validName, expression);
    file.add(statement);
  };

  // OpenAPI 2.0
  if ('swagger' in openApi) {
    for (const name in openApi.definitions) {
      if (openApi.definitions.hasOwnProperty(name)) {
        const definition = openApi.definitions[name];
        addSchema(name, definition);
      }
    }
  }

  // OpenAPI 3.x
  if ('openapi' in openApi) {
    if (openApi.components) {
      for (const name in openApi.components.schemas) {
        if (openApi.components.schemas.hasOwnProperty(name)) {
          const schema = openApi.components.schemas[name];
          addSchema(name, schema);
        }
      }
    }
  }
};
