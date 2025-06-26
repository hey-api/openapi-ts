import { createOperationKey } from '../../../ir/operation';
import type { Config } from '../../../types/config';
import { refToName, resolveRef } from '../../../utils/ref';
import type { Graph } from '../../shared/utils/graph';
import {
  addNamespace,
  getUniqueComponentName,
  setAtPath,
  stringToNamespace,
} from '../../shared/utils/graph';
import { httpMethods } from '../../shared/utils/operation';
import type {
  ValidatorIssue,
  ValidatorResult,
} from '../../shared/utils/validator';
import type {
  OpenApiV3_1_X,
  PathItemObject,
  PathsObject,
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
  schema: SchemaObject;
  schemasToDelete: Set<string>;
  spec: OpenApiV3_1_X;
  transforms: Config['parser']['transforms'];
}) => {
  if (transforms.enums) {
    if (transforms.enums === 'root') {
      if (schema.enum) {
        if (
          path.length !== 3 ||
          path[0] !== 'components' ||
          path[1] !== 'schemas'
        ) {
          // Move the current schema to #/components/schemas and replace with $ref
          if (!spec.components) spec.components = {};
          if (!spec.components.schemas) spec.components.schemas = {};
          const enumName = getUniqueComponentName(
            spec.components.schemas,
            String(path[path.length - 1]),
          );
          spec.components.schemas[enumName] = { ...schema };
          setAtPath(spec, path, { $ref: `#/components/schemas/${enumName}` });
          return;
        }
      }
    } else if (transforms.enums === 'inline') {
      if (schema.$ref) {
        // Copy the referenced enum schema and remove $ref from the current schema
        const refSchema = resolveRef<SchemaObject>({ $ref: schema.$ref, spec });
        if (refSchema.enum) {
          const cloned = JSON.parse(JSON.stringify(refSchema));
          Object.assign(schema, cloned);
          // Mark the referenced enum schema for deletion later
          const name = refToName(schema.$ref);
          schemasToDelete.add(name);
          delete schema.$ref;
        }
      }
    }
  }

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

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === 'object'
  ) {
    collectSchemaDependencies({
      dependencies,
      path: [...path, 'additionalProperties'],
      schema: schema.additionalProperties,
      schemasToDelete,
      spec,
      transforms,
    });
  }

  if (Array.isArray(schema.allOf)) {
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

  if (Array.isArray(schema.anyOf)) {
    for (let i = 0; i < schema.anyOf.length; i++) {
      const item = schema.anyOf[i];
      if (item && typeof item === 'object') {
        collectSchemaDependencies({
          dependencies,
          path: [...path, 'anyOf', i],
          schema: item,
          schemasToDelete,
          spec,
          transforms,
        });
      }
    }
  }

  if (schema.contains && typeof schema.contains === 'object') {
    collectSchemaDependencies({
      dependencies,
      path: [...path, 'contains'],
      schema: schema.contains,
      schemasToDelete,
      spec,
      transforms,
    });
  }

  if (schema.not && typeof schema.not === 'object') {
    collectSchemaDependencies({
      dependencies,
      path: [...path, 'not'],
      schema: schema.not,
      schemasToDelete,
      spec,
      transforms,
    });
  }

  if (Array.isArray(schema.oneOf)) {
    for (let i = 0; i < schema.oneOf.length; i++) {
      const item = schema.oneOf[i];
      if (item && typeof item === 'object') {
        collectSchemaDependencies({
          dependencies,
          path: [...path, 'oneOf', i],
          schema: item,
          schemasToDelete,
          spec,
          transforms,
        });
      }
    }
  }

  if (Array.isArray(schema.prefixItems)) {
    for (let i = 0; i < schema.prefixItems.length; i++) {
      const item = schema.prefixItems[i];
      if (item && typeof item === 'object') {
        collectSchemaDependencies({
          dependencies,
          path: [...path, 'prefixItems', i],
          schema: item,
          schemasToDelete,
          spec,
          transforms,
        });
      }
    }
  }

  if (schema.propertyNames && typeof schema.propertyNames === 'object') {
    collectSchemaDependencies({
      dependencies,
      path: [...path, 'propertyNames'],
      schema: schema.propertyNames,
      schemasToDelete,
      spec,
      transforms,
    });
  }
};

export const createGraph = ({
  spec,
  transforms,
  validate,
}: {
  spec: OpenApiV3_1_X;
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

  if (spec.components) {
    // TODO: add other components
    if (spec.components.schemas) {
      for (const [key, schema] of Object.entries(spec.components.schemas)) {
        const dependencies = new Set<string>();
        collectSchemaDependencies({
          dependencies,
          path: ['components', 'schemas', key],
          schema,
          schemasToDelete,
          spec,
          transforms,
        });
        graph.schemas.set(addNamespace('schema', key), {
          dependencies,
          deprecated:
            'deprecated' in schema ? Boolean(schema.deprecated) : false,
        });
      }
    }

    if (spec.components.parameters) {
      for (const [key, parameter] of Object.entries(
        spec.components.parameters,
      )) {
        const dependencies = new Set<string>();
        if ('$ref' in parameter) {
          collectSchemaDependencies({
            dependencies,
            path: ['components', 'parameters', key],
            schema: parameter,
            schemasToDelete,
            spec,
            transforms,
          });
        } else {
          if (parameter.schema) {
            if (parameter.schema) {
              collectSchemaDependencies({
                dependencies,
                path: ['components', 'parameters', key],
                schema: parameter.schema,
                schemasToDelete,
                spec,
                transforms,
              });
            }
          }

          if (parameter.content) {
            for (const [mediaType, media] of Object.entries(
              parameter.content,
            )) {
              if (media && media.schema) {
                if (media.schema) {
                  collectSchemaDependencies({
                    dependencies,
                    path: [
                      'components',
                      'parameters',
                      key,
                      'content',
                      mediaType,
                      'schema',
                    ],
                    schema: media.schema,
                    schemasToDelete,
                    spec,
                    transforms,
                  });
                }
              }
            }
          }
        }
        graph.parameters.set(addNamespace('parameter', key), {
          dependencies,
          deprecated:
            'deprecated' in parameter ? Boolean(parameter.deprecated) : false,
        });
      }
    }

    if (spec.components.requestBodies) {
      for (const [key, requestBody] of Object.entries(
        spec.components.requestBodies,
      )) {
        const dependencies = new Set<string>();
        if ('$ref' in requestBody) {
          collectSchemaDependencies({
            dependencies,
            path: ['components', 'requestBodies', key],
            schema: requestBody,
            schemasToDelete,
            spec,
            transforms,
          });
        } else {
          for (const [mediaType, media] of Object.entries(
            requestBody.content,
          )) {
            if (media && media.schema) {
              if (media.schema) {
                collectSchemaDependencies({
                  dependencies,
                  path: [
                    'components',
                    'requestBodies',
                    key,
                    'content',
                    mediaType,
                    'schema',
                  ],
                  schema: media.schema,
                  schemasToDelete,
                  spec,
                  transforms,
                });
              }
            }
          }
        }
        graph.requestBodies.set(addNamespace('body', key), {
          dependencies,
          deprecated: false,
        });
      }
    }

    if (spec.components.responses) {
      for (const [key, response] of Object.entries(spec.components.responses)) {
        const dependencies = new Set<string>();
        if ('$ref' in response) {
          collectSchemaDependencies({
            dependencies,
            path: ['components', 'responses', key],
            schema: response,
            schemasToDelete,
            spec,
            transforms,
          });
        } else {
          if (response.content) {
            for (const [mediaType, media] of Object.entries(response.content)) {
              if (media && media.schema) {
                if (media.schema) {
                  collectSchemaDependencies({
                    dependencies,
                    path: [
                      'components',
                      'responses',
                      key,
                      'content',
                      mediaType,
                      'schema',
                    ],
                    schema: media.schema,
                    schemasToDelete,
                    spec,
                    transforms,
                  });
                }
              }
            }
          }
        }
        graph.responses.set(addNamespace('response', key), {
          dependencies,
          deprecated: false,
        });
      }
    }
  }

  if (spec.paths) {
    for (const entry of Object.entries(spec.paths)) {
      const path = entry[0] as keyof PathsObject;
      const pathItem = entry[1] as PathItemObject;
      for (const method of httpMethods) {
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

        if (operation.requestBody) {
          if ('$ref' in operation.requestBody) {
            collectSchemaDependencies({
              dependencies,
              path: ['paths', path, method, 'requestBody'],
              schema: operation.requestBody,
              schemasToDelete,
              spec,
              transforms,
            });
          } else if (operation.requestBody.content) {
            for (const [mediaType, media] of Object.entries(
              operation.requestBody.content,
            )) {
              if (media && media.schema) {
                if (media.schema) {
                  collectSchemaDependencies({
                    dependencies,
                    path: [
                      'paths',
                      path,
                      method,
                      'requestBody',
                      'content',
                      mediaType,
                      'schema',
                    ],
                    schema: media.schema,
                    schemasToDelete,
                    spec,
                    transforms,
                  });
                }
              }
            }
          }
        }

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
            } else if (response.content) {
              for (const [mediaType, media] of Object.entries(
                response.content,
              )) {
                if (media && media.schema) {
                  if (media.schema) {
                    collectSchemaDependencies({
                      dependencies,
                      path: [
                        'paths',
                        path,
                        method,
                        'responses',
                        responseKey,
                        'content',
                        mediaType,
                        'schema',
                      ],
                      schema: media.schema,
                      schemasToDelete,
                      spec,
                      transforms,
                    });
                  }
                }
              }
            }
          }
        }

        if (operation.parameters) {
          for (let i = 0; i < operation.parameters.length; i++) {
            const parameter = operation.parameters[i];
            if (!parameter) continue;
            if ('$ref' in parameter) {
              collectSchemaDependencies({
                dependencies,
                path: ['paths', path, method, 'parameters', i],
                schema: parameter,
                schemasToDelete,
                spec,
                transforms,
              });
            } else if (parameter.schema) {
              if (parameter.schema) {
                collectSchemaDependencies({
                  dependencies,
                  path: ['paths', path, method, 'parameters', i, 'schema'],
                  schema: parameter.schema,
                  schemasToDelete,
                  spec,
                  transforms,
                });
              }
            }
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

  if (validate) {
    if (spec.servers) {
      if (typeof spec.servers !== 'object' || !Array.isArray(spec.servers)) {
        issues.push({
          code: 'invalid_type',
          message: '`servers` must be an array.',
          path: [],
          severity: 'error',
        });
      }

      for (let index = 0; index < spec.servers.length; index++) {
        const server = spec.servers[index];
        if (!server || typeof server !== 'object') {
          issues.push({
            code: 'invalid_type',
            context: {
              actual: typeof server,
              expected: 'object',
            },
            message: 'Each entry in `servers` must be an object.',
            path: ['servers', index],
            severity: 'error',
          });
        } else {
          if (!server.url) {
            issues.push({
              code: 'missing_required_field',
              context: {
                field: 'url',
              },
              message: 'Missing required field `url` in server object.',
              path: ['servers', index],
              severity: 'error',
            });
          }
        }
      }
    }
  }

  if (spec.components && spec.components.schemas) {
    for (const key of schemasToDelete) {
      delete spec.components.schemas[key];
      graph.schemas.delete(addNamespace('schema', key));
    }
  }

  return {
    graph,
    issues,
    valid: !issues.some((issue) => issue.severity === 'error'),
  };
};
