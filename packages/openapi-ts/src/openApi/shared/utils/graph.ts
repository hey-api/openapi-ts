import type { SchemaObject as OpenApiV2_0_XSchemaObject } from '../../2.0.x/types/spec';
import type { SchemaObject as OpenApiV3_0_XSchemaObject } from '../../3.0.x/types/spec';
import type {
  PathItemObject,
  PathsObject,
  SchemaObject as OpenApiV3_1_XSchemaObject,
} from '../../3.1.x/types/spec';
import type { OpenApi } from '../../types';
import { httpMethods } from './operation';

export type Graph = {
  operations: Map<
    string,
    {
      dependencies: Set<string>;
      deprecated: boolean;
      tags: Set<string>;
    }
  >;
  parameters: Map<
    string,
    {
      dependencies: Set<string>;
      deprecated: boolean;
    }
  >;
  requestBodies: Map<
    string,
    {
      dependencies: Set<string>;
      deprecated: boolean;
    }
  >;
  responses: Map<
    string,
    {
      dependencies: Set<string>;
      deprecated: boolean;
    }
  >;
  schemas: Map<
    string,
    {
      dependencies: Set<string>;
      deprecated: boolean;
    }
  >;
};

export type GraphType =
  | 'body'
  | 'operation'
  | 'parameter'
  | 'response'
  | 'schema'
  | 'unknown';

/**
 * Converts reference strings from OpenAPI $ref keywords into namespaces.
 * @example '#/components/schemas/Foo' -> 'schema'
 */
export const stringToNamespace = (value: string): GraphType => {
  switch (value) {
    case 'parameters':
      return 'parameter';
    case 'requestBodies':
      return 'body';
    case 'responses':
      return 'response';
    case 'definitions':
    case 'schemas':
      return 'schema';
    default:
      return 'unknown';
  }
};

const namespaceNeedle = '/';

export const addNamespace = (
  namespace: GraphType,
  value: string = '',
): string => `${namespace}${namespaceNeedle}${value}`;

export const removeNamespace = (
  key: string,
): {
  name: string;
  namespace: GraphType;
} => {
  const index = key.indexOf(namespaceNeedle);
  const name = key.slice(index + 1);
  return {
    name,
    namespace: key.slice(0, index)! as GraphType,
  };
};

const collectSchemaDependencies = (
  schema:
    | OpenApiV2_0_XSchemaObject
    | OpenApiV3_0_XSchemaObject
    | OpenApiV3_1_XSchemaObject,
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

  if ('allOf' in schema && schema.allOf) {
    for (const item of schema.allOf) {
      collectSchemaDependencies(item, dependencies);
    }
  }

  if ('anyOf' in schema && schema.anyOf) {
    for (const item of schema.anyOf) {
      collectSchemaDependencies(item, dependencies);
    }
  }

  if ('contains' in schema && schema.contains) {
    collectSchemaDependencies(schema.contains, dependencies);
  }

  if ('not' in schema && schema.not) {
    collectSchemaDependencies(schema.not, dependencies);
  }

  if ('oneOf' in schema && schema.oneOf) {
    for (const item of schema.oneOf) {
      collectSchemaDependencies(item, dependencies);
    }
  }

  if ('prefixItems' in schema && schema.prefixItems) {
    for (const item of schema.prefixItems) {
      collectSchemaDependencies(item, dependencies);
    }
  }
};

const collectOpenApiV2Dependencies = (spec: OpenApi.V2_0_X, graph: Graph) => {
  if (spec.definitions) {
    for (const [key, schema] of Object.entries(spec.definitions)) {
      const dependencies = new Set<string>();
      collectSchemaDependencies(schema, dependencies);
      graph.schemas.set(addNamespace('schema', key), {
        dependencies,
        deprecated: false,
      });
    }

    // TODO: add parameters
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
};

const collectOpenApiV3Dependencies = (
  spec: OpenApi.V3_0_X | OpenApi.V3_1_X,
  graph: Graph,
) => {
  type ExtractedType<T> = T extends Record<string, infer V> ? V : never;

  if (spec.components) {
    // TODO: add other components
    if (spec.components.schemas) {
      type Schema = ExtractedType<typeof spec.components.schemas>;
      for (const [key, value] of Object.entries(spec.components.schemas)) {
        const schema = value as Schema;
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
      type Parameter = ExtractedType<typeof spec.components.parameters>;
      for (const [key, value] of Object.entries(spec.components.parameters)) {
        const parameter = value as Parameter;
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
      type RequestBody = ExtractedType<typeof spec.components.requestBodies>;
      for (const [key, value] of Object.entries(
        spec.components.requestBodies,
      )) {
        const requestBody = value as RequestBody;
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
      type Response = ExtractedType<typeof spec.components.responses>;
      for (const [key, value] of Object.entries(spec.components.responses)) {
        const response = value as Response;
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
};

export const createGraph = (
  spec: OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X,
): Graph => {
  const graph: Graph = {
    operations: new Map(),
    parameters: new Map(),
    requestBodies: new Map(),
    responses: new Map(),
    schemas: new Map(),
  };

  if ('swagger' in spec) {
    collectOpenApiV2Dependencies(spec, graph);
  } else {
    collectOpenApiV3Dependencies(spec, graph);
  }

  return graph;
};
