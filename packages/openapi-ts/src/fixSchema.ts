import type { OpenApi } from './openApi/types';
import type { Config } from './types/config';

interface FixSchemaArgs {
  data: unknown;
  fix?: Config['input']['fix'];
}

export const fixSchema = ({ data, fix }: FixSchemaArgs) => {
  if (!data || !fix?.schema) {
    return;
  }

  const spec = data as OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X;
  const schema = fix.schema;

  const processSchemas = (schemas: Record<string, any>) => {
    for (const key in schemas) {
      const fixFn = schema[key];

      if (!fixFn) {
        continue;
      }

      const obj = schemas[key];

      if (!obj || typeof obj !== 'object') {
        continue;
      }

      fixFn(obj);
    }
  };

  if ('swagger' in spec) {
    const { definitions } = spec;

    if (definitions) {
      processSchemas(definitions);
    }

    return;
  }

  const schemas = spec.components?.schemas;

  if (schemas) {
    processSchemas(schemas);
  }
};
