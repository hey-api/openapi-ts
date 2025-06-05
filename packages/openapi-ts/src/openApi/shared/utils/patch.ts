import type { Patch } from '../../../types/input';
import type { OpenApi } from '../../types';

export const patchOpenApiSpec = ({
  patchOptions,
  spec: _spec,
}: {
  patchOptions: Patch | undefined;
  spec: unknown;
}) => {
  if (!patchOptions) {
    return;
  }

  const spec = _spec as OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X;

  if ('swagger' in spec) {
    if (spec.definitions && patchOptions?.schemas) {
      for (const key in patchOptions.schemas) {
        const patchFn = patchOptions.schemas[key]!;
        const schema = spec.definitions[key];
        if (schema && typeof schema === 'object') {
          patchFn(schema);
        }
      }
    }
    return;
  }

  if (spec.components) {
    if (spec.components.parameters && patchOptions.parameters) {
      for (const key in patchOptions.parameters) {
        const patchFn = patchOptions.parameters[key]!;
        const schema = spec.components.parameters[key];
        if (schema && typeof schema === 'object') {
          patchFn(schema);
        }
      }
    }

    if (spec.components.requestBodies && patchOptions.requestBodies) {
      for (const key in patchOptions.requestBodies) {
        const patchFn = patchOptions.requestBodies[key]!;
        const schema = spec.components.requestBodies[key];
        if (schema && typeof schema === 'object') {
          patchFn(schema);
        }
      }
    }

    if (spec.components.responses && patchOptions.responses) {
      for (const key in patchOptions.responses) {
        const patchFn = patchOptions.responses[key]!;
        const schema = spec.components.responses[key];
        if (schema && typeof schema === 'object') {
          patchFn(schema);
        }
      }
    }

    if (spec.components.schemas && patchOptions?.schemas) {
      for (const key in patchOptions.schemas) {
        const patchFn = patchOptions.schemas[key]!;
        const schema = spec.components.schemas[key];
        if (schema && typeof schema === 'object') {
          patchFn(schema);
        }
      }
    }
  }
};
