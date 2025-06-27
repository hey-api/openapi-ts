import { dumpToFile } from '../../../debug/dumpToFile';
import type { Config } from '../../../types/config';
import {
  pathToRef,
  refToName,
  refToPath,
  resolveRef,
} from '../../../utils/ref';
import { getUniqueComponentName, setAtPath } from '../../shared/utils/graph';
import { httpMethods } from '../../shared/utils/operation';
import { getReadWriteName } from '../../shared/utils/transform';
import type {
  OpenApiV3_1_X,
  PathItemObject,
  PathsObject,
  SchemaObject,
} from '../types/spec';

type AccessScope = 'normal' | 'read' | 'write';

type Pass = 'exclude' | 'walk';

type TransformedSchemaObject = SchemaObject & {
  /**
   * Should this schema be excluded?
   */
  _exclude?: boolean;
  /**
   * Have any properties been excluded from this schema?
   */
  _excludedProperties?: boolean;
  /**
   * Name of the pass functions that processed this schema.
   */
  _passes?: ReadonlyArray<Pass>;
  /**
   * Access scopes of this schema's properties.
   */
  _scopes?: ReadonlyArray<AccessScope>;
};

type WalkSchemaArgs = {
  path: ReadonlyArray<string | number>;
  /**
   * Keys are original reference paths to schemas, values are transformed
   * reference paths to schemas.
   */
  refs: Record<
    string,
    {
      [key in AccessScope]?: string;
    }
  >;
  schema: TransformedSchemaObject;
  schemasToAdd: Record<string, SchemaObject>;
  schemasToDelete: Set<string>;
  spec: OpenApiV3_1_X;
  transforms: Config['parser']['transforms'];
};

const addScopes = (
  schema: TransformedSchemaObject,
  scopes: Set<AccessScope>,
) => {
  if (!schema._scopes) {
    return;
  }

  for (const scope of schema._scopes) {
    scopes.add(scope);
  }
};

const deleteScopes = (
  scopes: Set<AccessScope>,
  exclude: ReadonlyArray<AccessScope>,
) => {
  for (const scope of exclude) {
    scopes.delete(scope);
  }
};

const addPass = (schema: TransformedSchemaObject, pass: Pass) => {
  schema._passes = [...(schema._passes ?? []), pass];
};

const deepClone = <T>(schema: T): T => JSON.parse(JSON.stringify(schema));

const isPathComponent = ({
  path,
  type,
}: {
  path: ReadonlyArray<string | number>;
  type?: 'schemas';
}): boolean => {
  const isComponent = path.length === 3 && path[0] === 'components';
  if (!type) {
    return isComponent;
  }
  return isComponent && path[1] === type;
};

const removeScopes = (
  schema: TransformedSchemaObject,
  scopes: ReadonlyArray<AccessScope>,
) => {
  if (!schema._scopes) {
    return;
  }

  schema._scopes = schema._scopes.filter((scope) => !scopes.includes(scope));
};

const shouldSplitSchema = ({
  path,
  schema,
  transforms,
}: Pick<WalkSchemaArgs, 'path' | 'schema' | 'transforms'>): boolean =>
  Boolean(
    transforms.readWrite.enabled &&
      schema._scopes &&
      schema._scopes.length > 1 &&
      isPathComponent({ path, type: 'schemas' }),
  );

const didSplitSchema = ({
  path,
  schema,
}: Pick<WalkSchemaArgs, 'path' | 'schema'>): boolean =>
  Boolean(isPathComponent({ path, type: 'schemas' }) && schema._scopes?.length);

const pathToScope = (
  path: ReadonlyArray<string | number>,
): AccessScope | undefined => {
  if (path[0] === 'paths') {
    if (path[3] === 'requestBody') {
      return 'read';
    }
    if (path[3] === 'responses') {
      return 'write';
    }
  } else if (path[0] === 'components') {
    if (path[1] === 'parameters') {
      return 'read';
    }
    if (path[1] === 'requestBodies') {
      return 'read';
    }
    if (path[1] === 'responses') {
      return 'write';
    }
  }
  return;
};

const excludeSchemaProperties = ({
  path,
  schema,
  ...args
}: WalkSchemaArgs & {
  exclude: AccessScope;
}): TransformedSchemaObject => {
  const { exclude, refs, schemasToAdd, schemasToDelete, spec, transforms } =
    args;

  if (schema._passes?.includes('exclude')) {
    return schema;
  }

  if (exclude === 'read' && schema.readOnly) {
    schema._exclude = true;
    return schema;
  }

  if (exclude === 'write' && schema.writeOnly) {
    schema._exclude = true;
    return schema;
  }

  // $ref
  if (schema.$ref) {
    let refSchema = resolveRef<TransformedSchemaObject>({
      $ref: schema.$ref,
      spec,
    });
    if (refSchema._scopes?.includes(exclude)) {
      refSchema = deepClone(refSchema);
      const refPath = refToPath(schema.$ref);
      excludeSchemaProperties({ ...args, path: refPath, schema: refSchema });
      if (didSplitSchema({ path: refPath, schema: refSchema })) {
        const ref = pathToRef(refPath);
        schema.$ref = refs[ref]![exclude];
      }
    }
  }
  // properties
  if (schema.properties) {
    for (const [propertyName, property] of Object.entries(schema.properties)) {
      if (typeof property === 'object') {
        excludeSchemaProperties({
          ...args,
          path: [...path, 'properties', propertyName],
          schema: property,
        });
        if ((property as TransformedSchemaObject)._exclude) {
          delete schema.properties[propertyName];
          schema._excludedProperties = true;
        }
      }
    }
    // also filter required
    if (schema.required) {
      schema.required = schema.required.filter(
        (name) => name in schema.properties!,
      );
      if (!schema.required.length) {
        delete schema.required;
      }
    }
    // maybe remove properties altogether
    if (schema._excludedProperties && !Object.keys(schema.properties).length) {
      delete schema.properties;
    }
  }
  // items
  if (schema.items && typeof schema.items === 'object') {
    excludeSchemaProperties({
      ...args,
      path: [...path, 'items'],
      schema: schema.items,
    });
  }
  // additionalProperties
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === 'object'
  ) {
    excludeSchemaProperties({
      ...args,
      path: [...path, 'additionalProperties'],
      schema: schema.additionalProperties,
    });
  }
  // allOf
  if (schema.allOf) {
    schema.allOf = schema.allOf
      .map((item, index) =>
        excludeSchemaProperties({
          ...args,
          path: [...path, 'allOf', index],
          schema: item,
        }),
      )
      .filter((item) => !item._exclude);
  }
  // anyOf
  if (schema.anyOf) {
    schema.anyOf = schema.anyOf
      .map((item, index) =>
        excludeSchemaProperties({
          ...args,
          path: [...path, 'anyOf', index],
          schema: item,
        }),
      )
      .filter((item) => !item._exclude);
  }
  // oneOf
  if (schema.oneOf) {
    schema.oneOf = schema.oneOf
      .map((item, index) =>
        excludeSchemaProperties({
          ...args,
          path: [...path, 'oneOf', index],
          schema: item,
        }),
      )
      .filter((item) => !item._exclude);
  }
  // prefixItems
  if (schema.prefixItems) {
    schema.prefixItems = schema.prefixItems
      .map((item, index) =>
        excludeSchemaProperties({
          ...args,
          path: [...path, 'prefixItems', index],
          schema: item,
        }),
      )
      .filter((item) => !item._exclude);
  }
  // contains
  if (schema.contains && typeof schema.contains === 'object') {
    excludeSchemaProperties({
      ...args,
      path: [...path, 'contains'],
      schema: schema.contains,
    });
  }
  // not
  if (schema.not && typeof schema.not === 'object') {
    excludeSchemaProperties({
      ...args,
      path: [...path, 'not'],
      schema: schema.not,
    });
  }
  // propertyNames
  if (schema.propertyNames && typeof schema.propertyNames === 'object') {
    excludeSchemaProperties({
      ...args,
      path: [...path, 'propertyNames'],
      schema: schema.propertyNames,
    });
  }

  removeScopes(schema, [exclude]);

  if (!schema._scopes?.length) {
    schema._exclude = true;
  } else if (
    schema.type === 'object' &&
    schema._excludedProperties &&
    !Object.keys(schema).filter((key) => !key.startsWith('_') && key !== 'type')
      .length
  ) {
    schema._exclude = true;
  }

  addPass(schema, 'exclude');

  if (didSplitSchema({ path, schema })) {
    const name = path[2] as string;
    let base = name;
    if (exclude === 'read') {
      base = getReadWriteName({
        config: transforms.readWrite.requests,
        name: base,
      });
    } else if (exclude === 'write') {
      base = getReadWriteName({
        config: transforms.readWrite.responses,
        name: base,
      });
    }
    const schemaName =
      base === name
        ? base
        : getUniqueComponentName({
            base,
            components: spec.components?.schemas ?? {},
            extraComponents: schemasToAdd,
          });
    const ref = pathToRef(path);
    if (!refs[ref]) refs[ref] = {};
    refs[ref][exclude] = `#/${path[0]}/${path[1]}/${schemaName}`;
    schemasToAdd[schemaName] = schema;
    schemasToDelete.add(name);
  }

  return schema;
};

const walkSchema = ({ path, schema, ...args }: WalkSchemaArgs): void => {
  const { refs, schemasToAdd, schemasToDelete, spec, transforms } = args;

  if (schema._passes?.includes('walk')) {
    return;
  }

  const scopes = new Set<AccessScope>();

  if (schema.readOnly) {
    scopes.add('read');
  } else if (schema.writeOnly) {
    scopes.add('write');
  }

  // enum
  if (
    schema.enum &&
    transforms.enums === 'root' &&
    !isPathComponent({ path, type: 'schemas' })
  ) {
    const schemaName = getUniqueComponentName({
      base: String(path[path.length - 1]),
      components: spec.components?.schemas ?? {},
      extraComponents: schemasToAdd,
    });
    schemasToAdd[schemaName] = deepClone(schema);
    setAtPath(spec, path, { $ref: `#/components/schemas/${schemaName}` });
  }
  // $ref
  if (schema.$ref) {
    const refSchema = resolveRef<SchemaObject>({ $ref: schema.$ref, spec });
    const refPath = refToPath(schema.$ref);
    walkSchema({
      ...args,
      path: refPath,
      schema: refSchema,
    });
    addScopes(refSchema, scopes);

    if (refSchema.enum && transforms.enums === 'inline') {
      schemasToDelete.add(refToName(schema.$ref));
      Object.assign(schema, deepClone(refSchema));
      delete schema.$ref;
    } else if (didSplitSchema({ path: refPath, schema: refSchema })) {
      const scope = pathToScope(path);
      if (scope) {
        const ref = pathToRef(refPath);
        schema.$ref = refs[ref]![scope]!;
        deleteScopes(scopes, [scope]);
      }
    }
  }
  // properties
  if (schema.properties) {
    for (const [propertyName, property] of Object.entries(schema.properties)) {
      if (typeof property === 'object') {
        walkSchema({
          ...args,
          path: [...path, 'properties', propertyName],
          schema: property,
        });
        addScopes(property, scopes);
      }
    }
  }
  // items
  if (schema.items && typeof schema.items === 'object') {
    walkSchema({
      ...args,
      path: [...path, 'items'],
      schema: schema.items,
    });
    addScopes(schema.items, scopes);
  }
  // additionalProperties
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === 'object'
  ) {
    walkSchema({
      ...args,
      path: [...path, 'additionalProperties'],
      schema: schema.additionalProperties,
    });
    addScopes(schema.additionalProperties, scopes);
  }
  // allOf
  if (schema.allOf) {
    schema.allOf.forEach((item, index) => {
      walkSchema({
        ...args,
        path: [...path, 'allOf', index],
        schema: item,
      });
      addScopes(item, scopes);
    });
  }
  // anyOf
  if (schema.anyOf) {
    schema.anyOf.forEach((item, index) => {
      walkSchema({
        ...args,
        path: [...path, 'anyOf', index],
        schema: item,
      });
      addScopes(item, scopes);
    });
  }
  // oneOf
  if (schema.oneOf) {
    schema.oneOf.forEach((item, index) => {
      walkSchema({
        ...args,
        path: [...path, 'oneOf', index],
        schema: item,
      });
      addScopes(item, scopes);
    });
  }
  // prefixItems
  if (schema.prefixItems) {
    schema.prefixItems.forEach((item, index) => {
      walkSchema({
        ...args,
        path: [...path, 'prefixItems', index],
        schema: item,
      });
      addScopes(item, scopes);
    });
  }
  // contains
  if (schema.contains && typeof schema.contains === 'object') {
    walkSchema({
      ...args,
      path: [...path, 'contains'],
      schema: schema.contains,
    });
    addScopes(schema.contains, scopes);
  }
  // not
  if (schema.not && typeof schema.not === 'object') {
    walkSchema({
      ...args,
      path: [...path, 'not'],
      schema: schema.not,
    });
    addScopes(schema.not, scopes);
  }
  // propertyNames
  if (schema.propertyNames && typeof schema.propertyNames === 'object') {
    walkSchema({
      ...args,
      path: [...path, 'propertyNames'],
      schema: schema.propertyNames,
    });
    addScopes(schema.propertyNames, scopes);
  }

  if (!scopes.size) {
    scopes.add('normal');
  }

  schema._scopes = Array.from(scopes);
  addPass(schema, 'walk');

  if (shouldSplitSchema({ path, schema, transforms })) {
    const requestSchema = deepClone(schema);
    const responseSchema = deepClone(schema);
    addPass(schema, 'exclude');
    excludeSchemaProperties({
      ...args,
      exclude: 'read',
      path,
      schema: requestSchema,
    });
    excludeSchemaProperties({
      ...args,
      exclude: 'write',
      path,
      schema: responseSchema,
    });
  }
};

export const transformSpec = ({
  spec,
  transforms,
}: {
  spec: OpenApiV3_1_X;
  transforms: Config['parser']['transforms'];
}) => {
  const refs: WalkSchemaArgs['refs'] = {};
  const schemasToAdd: WalkSchemaArgs['schemasToAdd'] = {};
  const schemasToDelete: WalkSchemaArgs['schemasToDelete'] = new Set();
  const walkSchemaArgs: Omit<WalkSchemaArgs, 'path' | 'schema'> = {
    refs,
    schemasToAdd,
    schemasToDelete,
    spec,
    transforms,
  };

  if (spec.components) {
    // TODO: add other components
    if (spec.components.schemas) {
      for (const [key, schema] of Object.entries(spec.components.schemas)) {
        walkSchema({
          ...walkSchemaArgs,
          path: ['components', 'schemas', key],
          schema,
        });
      }
    }

    if (spec.components.parameters) {
      for (const [key, parameter] of Object.entries(
        spec.components.parameters,
      )) {
        if ('$ref' in parameter) {
          walkSchema({
            ...walkSchemaArgs,
            path: ['components', 'parameters', key],
            schema: parameter,
          });
        } else {
          if (parameter.schema) {
            walkSchema({
              ...walkSchemaArgs,
              path: ['components', 'parameters', key],
              schema: parameter.schema,
            });
          }
          if (parameter.content) {
            for (const [mediaType, media] of Object.entries(
              parameter.content,
            )) {
              if (media && media.schema) {
                walkSchema({
                  ...walkSchemaArgs,
                  path: [
                    'components',
                    'parameters',
                    key,
                    'content',
                    mediaType,
                    'schema',
                  ],
                  schema: media.schema,
                });
              }
            }
          }
        }
      }
    }

    if (spec.components.requestBodies) {
      for (const [key, requestBody] of Object.entries(
        spec.components.requestBodies,
      )) {
        if ('$ref' in requestBody) {
          walkSchema({
            ...walkSchemaArgs,
            path: ['components', 'requestBodies', key],
            schema: requestBody,
          });
        } else {
          for (const [mediaType, media] of Object.entries(
            requestBody.content,
          )) {
            if (media && media.schema) {
              walkSchema({
                ...walkSchemaArgs,
                path: [
                  'components',
                  'requestBodies',
                  key,
                  'content',
                  mediaType,
                  'schema',
                ],
                schema: media.schema,
              });
            }
          }
        }
      }
    }

    if (spec.components.responses) {
      for (const [key, response] of Object.entries(spec.components.responses)) {
        if ('$ref' in response) {
          walkSchema({
            ...walkSchemaArgs,
            path: ['components', 'responses', key],
            schema: response,
          });
        } else {
          if (response.content) {
            for (const [mediaType, media] of Object.entries(response.content)) {
              if (media && media.schema) {
                walkSchema({
                  ...walkSchemaArgs,
                  path: [
                    'components',
                    'responses',
                    key,
                    'content',
                    mediaType,
                    'schema',
                  ],
                  schema: media.schema,
                });
              }
            }
          }
        }
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

        if (operation.requestBody) {
          if ('$ref' in operation.requestBody) {
            walkSchema({
              ...walkSchemaArgs,
              path: ['paths', path, method, 'requestBody'],
              schema: operation.requestBody,
            });
          } else if (operation.requestBody.content) {
            for (const [mediaType, media] of Object.entries(
              operation.requestBody.content,
            )) {
              if (media && media.schema) {
                walkSchema({
                  ...walkSchemaArgs,
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
                });
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
              walkSchema({
                ...walkSchemaArgs,
                path: ['paths', path, method, 'responses', responseKey],
                schema: response,
              });
            } else if (response.content) {
              for (const [mediaType, media] of Object.entries(
                response.content,
              )) {
                if (media && media.schema) {
                  walkSchema({
                    ...walkSchemaArgs,
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
                  });
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
              walkSchema({
                ...walkSchemaArgs,
                path: ['paths', path, method, 'parameters', i],
                schema: parameter,
              });
            } else if (parameter.schema) {
              walkSchema({
                ...walkSchemaArgs,
                path: ['paths', path, method, 'parameters', i, 'schema'],
                schema: parameter.schema,
              });
            }
          }
        }
      }
    }
  }

  // Only delete keys that are not being added back later to preserve object order
  if (spec.components?.schemas) {
    for (const key of schemasToDelete) {
      if (!(key in schemasToAdd)) {
        delete spec.components.schemas[key];
      }
    }
  }

  if (spec.components?.schemas) {
    for (const [key, schema] of Object.entries(schemasToAdd)) {
      spec.components.schemas[key] = schema;
    }
  }

  dumpToFile({
    data: spec,
    filePath: './debug/openapi-ts-debug-dump.json',
  });
};
