import { compiler, TypeScriptFile } from '../../compiler';
import type { OpenApi } from '../../openApi';
import { ensureValidTypeScriptJavaScriptIdentifier } from '../../openApi/common/parser/sanitize';

const transformObject = (schema: unknown): unknown => {
  if (Array.isArray(schema)) {
    return schema.map((item) => transformObject(item));
  }

  if (typeof schema !== 'object' || schema === null) {
    return schema;
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
      result[key] = transformObject(value);
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

  const addSchema = (name: string, schema: unknown) => {
    const validName = `$${ensureValidTypeScriptJavaScriptIdentifier(name)}`;
    const obj = transformObject(schema) as object;
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
