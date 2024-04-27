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
