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
    if (patchOptions.version && spec.swagger) {
      spec.swagger = (
        typeof patchOptions.version === 'string'
          ? patchOptions.version
          : patchOptions.version(spec.swagger)
      ) as typeof spec.swagger;
    }

    if (patchOptions.meta && spec.info) {
      patchOptions.meta(spec.info);
    }

    if (patchOptions.schemas && spec.definitions) {
      for (const key in patchOptions.schemas) {
        const schema = spec.definitions[key];
        if (!schema || typeof schema !== 'object') continue;

        const patchFn = patchOptions.schemas[key]!;
        patchFn(schema);
      }
    }

    if (patchOptions.operations && spec.paths) {
      for (const key in patchOptions.operations) {
        const [method, path] = key.split(' ');
        if (!method || !path) continue;

        const pathItem = spec.paths[path as keyof typeof spec.paths];
        if (!pathItem) continue;

        const operation =
          pathItem[method.toLocaleLowerCase() as keyof typeof pathItem] ||
          pathItem[method.toLocaleUpperCase() as keyof typeof pathItem];
        if (!operation || typeof operation !== 'object') continue;

        const patchFn = patchOptions.operations[key]!;
        patchFn(operation as any);
      }
    }
    return;
  }

  if (patchOptions.version && spec.openapi) {
    spec.openapi = (
      typeof patchOptions.version === 'string'
        ? patchOptions.version
        : patchOptions.version(spec.openapi)
    ) as typeof spec.openapi;
  }

  if (patchOptions.meta && spec.info) {
    patchOptions.meta(spec.info);
  }

  if (spec.components) {
    if (patchOptions.schemas && spec.components.schemas) {
      for (const key in patchOptions.schemas) {
        const schema = spec.components.schemas[key];
        if (!schema || typeof schema !== 'object') continue;

        const patchFn = patchOptions.schemas[key]!;
        patchFn(schema);
      }
    }

    if (patchOptions.parameters && spec.components.parameters) {
      for (const key in patchOptions.parameters) {
        const schema = spec.components.parameters[key];
        if (!schema || typeof schema !== 'object') continue;

        const patchFn = patchOptions.parameters[key]!;
        patchFn(schema);
      }
    }

    if (patchOptions.requestBodies && spec.components.requestBodies) {
      for (const key in patchOptions.requestBodies) {
        const schema = spec.components.requestBodies[key];
        if (!schema || typeof schema !== 'object') continue;

        const patchFn = patchOptions.requestBodies[key]!;
        patchFn(schema);
      }
    }

    if (patchOptions.responses && spec.components.responses) {
      for (const key in patchOptions.responses) {
        const schema = spec.components.responses[key];
        if (!schema || typeof schema !== 'object') continue;

        const patchFn = patchOptions.responses[key]!;
        patchFn(schema);
      }
    }
  }

  if (patchOptions.operations && spec.paths) {
    for (const key in patchOptions.operations) {
      const [method, path] = key.split(' ');
      if (!method || !path) continue;

      const pathItem = spec.paths[path as keyof typeof spec.paths];
      if (!pathItem) continue;

      const operation =
        pathItem[method.toLocaleLowerCase() as keyof typeof pathItem] ||
        pathItem[method.toLocaleUpperCase() as keyof typeof pathItem];
      if (!operation || typeof operation !== 'object') continue;

      const patchFn = patchOptions.operations[key]!;
      patchFn(operation as any);
    }
  }
};
