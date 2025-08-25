import { createOperationKey } from '../../../ir/operation';
import type { Logger } from '../../../utils/logger';
import { addNamespace, removeNamespace } from '../../shared/utils/filter';
import { httpMethods } from '../../shared/utils/operation';
import type {
  OpenApiV2_0_X,
  OperationObject,
  PathItemObject,
  PathsObject,
} from '../types/spec';

/**
 * Replace source spec with filtered version.
 */
export const filterSpec = ({
  logger,
  operations,
  preserveOrder,
  schemas,
  spec,
}: {
  logger: Logger;
  operations: Set<string>;
  parameters: Set<string>;
  preserveOrder: boolean;
  requestBodies: Set<string>;
  responses: Set<string>;
  schemas: Set<string>;
  spec: OpenApiV2_0_X;
}) => {
  const eventFilterSpec = logger.timeEvent('filter-spec');
  if (spec.definitions) {
    const filtered: typeof spec.definitions = {};

    if (preserveOrder) {
      for (const [name, source] of Object.entries(spec.definitions)) {
        if (schemas.has(addNamespace('schema', name))) {
          filtered[name] = source;
        }
      }
    } else {
      for (const key of schemas) {
        const { name } = removeNamespace(key);
        const source = spec.definitions[name];
        if (source) {
          filtered[name] = source;
        }
      }
    }

    spec.definitions = filtered;
  }

  if (spec.paths) {
    for (const entry of Object.entries(spec.paths)) {
      const path = entry[0] as keyof PathsObject;
      const pathItem = entry[1] as PathItemObject;

      for (const method of httpMethods) {
        // @ts-expect-error
        const operation = pathItem[method] as OperationObject;
        if (!operation) {
          continue;
        }

        const key = addNamespace(
          'operation',
          createOperationKey({ method, path }),
        );
        if (!operations.has(key)) {
          // @ts-expect-error
          delete pathItem[method];
        }
      }

      // remove paths that have no operations left
      if (!Object.keys(pathItem).length) {
        delete spec.paths[path];
      }
    }
  }
  eventFilterSpec.timeEnd();
};
