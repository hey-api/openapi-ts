import type { OpenApi } from './openApi/types';
import type { Config } from './types/config';

interface PatchSchemasArgs {
  data: unknown;
  patch?: Config['input']['patch'];
}

export const patchSchemas = ({ data, patch }: PatchSchemasArgs) => {
  if (!data || !patch?.schemas) {
    return;
  }

  const spec = data as OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X;
  const schemas = patch.schemas;

  const processSchemas = (targets: Record<string, any>) => {
    for (const schemaName in schemas) {
      const fixFn = schemas[schemaName];

      if (!fixFn) {
        continue;
      }

      const target = targets[schemaName];

      if (!target || typeof target !== 'object') {
        continue;
      }

      fixFn(target);
    }
  };

  if ('swagger' in spec) {
    const { definitions } = spec;

    if (definitions) {
      processSchemas(definitions);
    }

    return;
  }

  const _schemas = spec.components?.schemas;

  if (_schemas) {
    processSchemas(_schemas);
  }
};
