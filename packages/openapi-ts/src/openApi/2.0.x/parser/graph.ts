import {
  addNamespace,
  type Graph,
  stringToNamespace,
} from '../../shared/utils/graph';
import { httpMethods } from '../../shared/utils/operation';
import type {
  ValidatorError,
  ValidatorResult,
} from '../../shared/utils/validator';
import type {
  OpenApiV2_0_X,
  ParameterObject,
  PathItemObject,
  PathsObject,
  ReferenceObject,
  SchemaObject,
} from '../types/spec';

const collectSchemaDependencies = (
  schema: SchemaObject | ReferenceObject | ParameterObject,
  dependencies: Set<string>,
) => {
  if ('$ref' in schema) {
    if (schema.$ref) {
      const parts = schema.$ref.split('/');
      const type = parts[parts.length - 2];
      const name = parts[parts.length - 1];
      if (type && name) {
        const namespace = stringToNamespace(type);
        if (namespace === 'unknown') {
          console.warn(`unsupported type: ${type}`);
        }
        dependencies.add(addNamespace(namespace, name));
      }
    }

    return;
  }

  if ('in' in schema) {
    if (schema.in === 'body') {
      collectSchemaDependencies(schema.schema, dependencies);
    }
    return;
  }

  if (schema.items && typeof schema.items === 'object') {
    collectSchemaDependencies(schema.items, dependencies);
  }

  if (schema.properties) {
    for (const property of Object.values(schema.properties)) {
      if (typeof property === 'object') {
        collectSchemaDependencies(property, dependencies);
      }
    }
  }

  if (schema.allOf) {
    for (const item of schema.allOf) {
      collectSchemaDependencies(item, dependencies);
    }
  }
};

export const createGraph = ({
  spec,
}: {
  spec: OpenApiV2_0_X;
  validate: boolean;
}): ValidatorResult & {
  graph: Graph;
} => {
  const graph: Graph = {
    operations: new Map(),
    parameters: new Map(),
    requestBodies: new Map(),
    responses: new Map(),
    schemas: new Map(),
  };
  const errors: Array<ValidatorError> = [];

  if (spec.definitions) {
    for (const [key, schema] of Object.entries(spec.definitions)) {
      const dependencies = new Set<string>();
      collectSchemaDependencies(schema, dependencies);
      graph.schemas.set(addNamespace('schema', key), {
        dependencies,
        deprecated: false,
      });
    }
  }

  if (spec.parameters) {
    // TODO: add parameters
  }

  if (spec.paths) {
    for (const entry of Object.entries(spec.paths)) {
      const path = entry[0] as keyof PathsObject;
      const pathItem = entry[1] as PathItemObject;
      for (const method of httpMethods) {
        if (method === 'trace') {
          continue;
        }

        const operation = pathItem[method];
        if (!operation) {
          continue;
        }

        const dependencies = new Set<string>();

        if (operation.responses) {
          for (const response of Object.values(operation.responses)) {
            if (!response) {
              continue;
            }

            if ('$ref' in response) {
              collectSchemaDependencies(response, dependencies);
            } else if (response.schema) {
              collectSchemaDependencies(response.schema, dependencies);
            }
          }
        }

        if (operation.parameters) {
          for (const parameter of operation.parameters) {
            collectSchemaDependencies(parameter, dependencies);
          }
        }

        graph.operations.set(
          addNamespace('operation', `${method.toUpperCase()} ${path}`),
          {
            dependencies,
            deprecated: Boolean(operation.deprecated),
            tags: new Set(operation.tags),
          },
        );
      }
    }
  }

  return { errors, graph, valid: !errors.length };
};
