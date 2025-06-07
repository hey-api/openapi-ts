import { createOperationKey } from '../../../ir/operation';
import type { Graph } from '../../shared/utils/graph';
import { addNamespace, stringToNamespace } from '../../shared/utils/graph';
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

const collectSchemaDependencies = (
  schema: SchemaObject,
  dependencies: Set<string>,
) => {
  if ('$ref' in schema && schema.$ref) {
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
    collectSchemaDependencies(schema.items, dependencies);
  }

  if (schema.properties) {
    for (const property of Object.values(schema.properties)) {
      if (typeof property === 'object') {
        collectSchemaDependencies(property, dependencies);
      }
    }
  }

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === 'object'
  ) {
    collectSchemaDependencies(schema.additionalProperties, dependencies);
  }

  if (schema.allOf) {
    for (const item of schema.allOf) {
      collectSchemaDependencies(item, dependencies);
    }
  }

  if (schema.anyOf) {
    for (const item of schema.anyOf) {
      collectSchemaDependencies(item, dependencies);
    }
  }

  if (schema.contains) {
    collectSchemaDependencies(schema.contains, dependencies);
  }

  if (schema.not) {
    collectSchemaDependencies(schema.not, dependencies);
  }

  if (schema.oneOf) {
    for (const item of schema.oneOf) {
      collectSchemaDependencies(item, dependencies);
    }
  }

  if (schema.prefixItems) {
    for (const item of schema.prefixItems) {
      collectSchemaDependencies(item, dependencies);
    }
  }
};

export const createGraph = ({
  spec,
  validate,
}: {
  spec: OpenApiV3_1_X;
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

  if (spec.components) {
    // TODO: add other components
    if (spec.components.schemas) {
      for (const [key, schema] of Object.entries(spec.components.schemas)) {
        const dependencies = new Set<string>();
        collectSchemaDependencies(schema, dependencies);
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
          collectSchemaDependencies(parameter, dependencies);
        } else {
          if (parameter.schema) {
            collectSchemaDependencies(parameter.schema, dependencies);
          }

          if (parameter.content) {
            for (const media of Object.values(parameter.content)) {
              if (media.schema) {
                collectSchemaDependencies(media.schema, dependencies);
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
          collectSchemaDependencies(requestBody, dependencies);
        } else {
          for (const media of Object.values(requestBody.content)) {
            if (media.schema) {
              collectSchemaDependencies(media.schema, dependencies);
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
          collectSchemaDependencies(response, dependencies);
        } else {
          if (response.content) {
            for (const media of Object.values(response.content)) {
              if (media.schema) {
                collectSchemaDependencies(media.schema, dependencies);
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
            collectSchemaDependencies(operation.requestBody, dependencies);
          } else {
            for (const media of Object.values(operation.requestBody.content)) {
              if (media.schema) {
                collectSchemaDependencies(media.schema, dependencies);
              }
            }
          }
        }

        if (operation.responses) {
          for (const response of Object.values(operation.responses)) {
            if (!response) {
              continue;
            }

            if ('$ref' in response) {
              collectSchemaDependencies(response, dependencies);
            } else if (response.content) {
              for (const media of Object.values(response.content)) {
                if (media.schema) {
                  collectSchemaDependencies(media.schema, dependencies);
                }
              }
            }
          }
        }

        if (operation.parameters) {
          for (const parameter of operation.parameters) {
            if ('$ref' in parameter) {
              collectSchemaDependencies(parameter, dependencies);
            } else if (parameter.schema) {
              collectSchemaDependencies(parameter.schema, dependencies);
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

  return {
    graph,
    issues,
    valid: !issues.some((issue) => issue.severity === 'error'),
  };
};
