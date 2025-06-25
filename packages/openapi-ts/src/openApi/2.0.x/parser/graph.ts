import { createOperationKey } from '../../../ir/operation';
import type { Config } from '../../../types/config';
import { refToName, resolveRef } from '../../../utils/ref';
import {
  addNamespace,
  getUniqueComponentName,
  type Graph,
  setAtPath,
  stringToNamespace,
} from '../../shared/utils/graph';
import { httpMethods } from '../../shared/utils/operation';
import type {
  ValidatorIssue,
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

const collectSchemaDependencies = ({
  dependencies,
  path,
  schema,
  schemasToDelete,
  spec,
  transforms,
}: {
  dependencies: Set<string>;
  path: Array<string | number>;
  schema: SchemaObject | ReferenceObject | ParameterObject;
  schemasToDelete: Set<string>;
  spec: OpenApiV2_0_X;
  transforms: Config['parser']['transforms'];
}) => {
  if (transforms.enums !== 'off') {
    if (transforms.enums === 'root') {
      if (!('$ref' in schema) && !('in' in schema) && schema.enum) {
        if (path.length !== 2 || path[0] !== 'definitions') {
          // Move the current schema to #/definitions and replace with $ref
          if (!spec.definitions) spec.definitions = {};
          const enumName = getUniqueComponentName(
            spec.definitions,
            String(path[path.length - 1]),
          );
          spec.definitions[enumName] = { ...schema };
          setAtPath(spec, path, { $ref: `#/definitions/${enumName}` });
          return;
        }
      }
    } else if (transforms.enums === 'inline') {
      if ('$ref' in schema && schema.$ref) {
        // Copy the referenced enum schema and remove $ref from the current schema
        const refSchema = resolveRef<SchemaObject>({ $ref: schema.$ref, spec });
        if (refSchema.enum) {
          const cloned = JSON.parse(JSON.stringify(refSchema));
          Object.assign(schema, cloned);
          // Mark the referenced enum schema for deletion later
          const name = refToName(schema.$ref);
          schemasToDelete.add(name);
          delete (schema as any).$ref;
        }
      }
    }
  }

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
      collectSchemaDependencies({
        dependencies,
        path: [...path, 'schema'],
        schema: schema.schema,
        schemasToDelete,
        spec,
        transforms,
      });
    }
    return;
  }

  if (schema.items && typeof schema.items === 'object') {
    collectSchemaDependencies({
      dependencies,
      path: [...path, 'items'],
      schema: schema.items,
      schemasToDelete,
      spec,
      transforms,
    });
  }

  if (schema.properties) {
    for (const [propertyName, property] of Object.entries(schema.properties)) {
      if (typeof property === 'object') {
        collectSchemaDependencies({
          dependencies,
          path: [...path, 'properties', propertyName],
          schema: property,
          schemasToDelete,
          spec,
          transforms,
        });
      }
    }
  }

  if (schema.allOf) {
    for (let i = 0; i < schema.allOf.length; i++) {
      const item = schema.allOf[i];
      if (item && typeof item === 'object') {
        collectSchemaDependencies({
          dependencies,
          path: [...path, 'allOf', i],
          schema: item,
          schemasToDelete,
          spec,
          transforms,
        });
      }
    }
  }
};

export const createGraph = ({
  spec,
  transforms,
  validate,
}: {
  spec: OpenApiV2_0_X;
  transforms: Config['parser']['transforms'];
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
  const issues: Array<ValidatorIssue> = [];
  const operationIds = new Map();
  const schemasToDelete = new Set<string>();

  if (spec.definitions) {
    for (const [key, schema] of Object.entries(spec.definitions)) {
      const dependencies = new Set<string>();
      collectSchemaDependencies({
        dependencies,
        path: ['definitions', key],
        schema,
        schemasToDelete,
        spec,
        transforms,
      });
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

        const operationKey = createOperationKey({ method, path });

        if (validate && operation.operationId) {
          if (!operationIds.has(operation.operationId)) {
            operationIds.set(operation.operationId, operationKey);
          } else {
            issues.push({
              code: 'duplicate_key',
              context: {
                key: 'operationId',
                value: operation.operationId,
              },
              message:
                'Duplicate `operationId` found. Each `operationId` must be unique.',
              path: ['paths', path, method, 'operationId'],
              severity: 'error',
            });
          }
        }

        const dependencies = new Set<string>();

        if (operation.responses) {
          for (const [responseKey, response] of Object.entries(
            operation.responses,
          )) {
            if (!response) {
              continue;
            }

            if ('$ref' in response) {
              collectSchemaDependencies({
                dependencies,
                path: ['paths', path, method, 'responses', responseKey],
                schema: response,
                schemasToDelete,
                spec,
                transforms,
              });
            } else if (response.schema) {
              collectSchemaDependencies({
                dependencies,
                path: [
                  'paths',
                  path,
                  method,
                  'responses',
                  responseKey,
                  'schema',
                ],
                schema: response.schema,
                schemasToDelete,
                spec,
                transforms,
              });
            }
          }
        }

        if (operation.parameters) {
          for (let i = 0; i < operation.parameters.length; i++) {
            const parameter = operation.parameters[i];
            if (!parameter) continue;
            collectSchemaDependencies({
              dependencies,
              path: ['paths', path, method, 'parameters', i],
              schema: parameter,
              schemasToDelete,
              spec,
              transforms,
            });
          }
        }

        graph.operations.set(addNamespace('operation', operationKey), {
          dependencies,
          deprecated: Boolean(operation.deprecated),
          tags: new Set(operation.tags),
        });
      }
    }
  }

  if (spec.definitions) {
    for (const key of schemasToDelete) {
      delete spec.definitions[key];
      graph.schemas.delete(addNamespace('schema', key));
    }
  }

  return {
    graph,
    issues,
    valid: !issues.some((issue) => issue.severity === 'error'),
  };
};
