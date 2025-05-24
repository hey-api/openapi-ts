import type {
  OpenApiV3_1_X,
  PathItemObject,
  PathsObject,
  SchemaObject,
} from '../types/spec';

const httpMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
] as const;

const collectSchemaDependencies = (
  schema: SchemaObject,
  dependencies: Set<string>,
) => {
  // TODO: add more keywords, e.g. prefixItems

  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    if (refName) {
      dependencies.add(refName);
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

  for (const compositeKeyword of ['allOf', 'anyOf', 'oneOf'] as const) {
    if (schema[compositeKeyword]) {
      for (const item of schema[compositeKeyword]!) {
        collectSchemaDependencies(item, dependencies);
      }
    }
  }

  if (schema.contains) {
    collectSchemaDependencies(schema.contains, dependencies);
  }

  if (schema.not) {
    collectSchemaDependencies(schema.not, dependencies);
  }
};

// TODO: references might reference other components besides schemas
type DependencyGraphScope = Map<string, Set<string>>;
type DependencyGraph = {
  operations: DependencyGraphScope;
  schemas: DependencyGraphScope;
};

type FiltersScope = {
  operations: Set<string>;
  schemas: Set<string>;
};
type Filters = {
  exclude: FiltersScope;
  include: FiltersScope;
};

export const createDependencyGraph = (spec: OpenApiV3_1_X): DependencyGraph => {
  const dependencyGraph: DependencyGraph = {
    operations: new Map(),
    schemas: new Map(),
  };

  if (spec.components) {
    // TODO: add other components
    if (spec.components.schemas) {
      for (const [schemaName, schema] of Object.entries(
        spec.components.schemas,
      )) {
        const dependencies = new Set<string>();
        collectSchemaDependencies(schema, dependencies);
        dependencyGraph.schemas.set(schemaName, dependencies);
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

        const operationKey = `${method.toUpperCase()} ${path}`;
        const dependencies = new Set<string>();

        if (operation.requestBody) {
          if ('$ref' in operation.requestBody) {
            collectSchemaDependencies(operation.requestBody, dependencies);
          } else
            for (const media of Object.values(operation.requestBody.content)) {
              if (media.schema) {
                collectSchemaDependencies(media.schema, dependencies);
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

        dependencyGraph.operations.set(operationKey, dependencies);
      }
    }
  }

  return dependencyGraph;
};

// TODO: construct filters from config
export const createFilters = (): Filters => {
  // TODO: support filters on tags, deprecated keyword
  const filters: Filters = {
    exclude: {
      operations: new Set(),
      schemas: new Set(),
    },
    include: {
      operations: new Set(),
      schemas: new Set(),
    },
  };
  return filters;
};

// TODO: make generic to work with any spec version
export const filterSpec = ({
  dependencyGraph,
  filters,
  spec,
}: {
  dependencyGraph: DependencyGraph;
  filters: Filters;
  spec: OpenApiV3_1_X;
}): void => {
  // pass 1: collect schemas that satisfy the include/exclude filters
  const allIncludedSchemas = new Set<string>();
  const initialSchemas = filters.include.schemas.size
    ? filters.include.schemas
    : new Set(dependencyGraph.schemas.keys());
  const schemasStack = [...initialSchemas];
  while (schemasStack.length) {
    const schemaName = schemasStack.pop()!;

    if (
      filters.exclude.schemas.has(schemaName) ||
      allIncludedSchemas.has(schemaName)
    ) {
      continue;
    }

    allIncludedSchemas.add(schemaName);

    const dependencies = dependencyGraph.schemas.get(schemaName);

    if (!dependencies) {
      continue;
    }

    for (const dependency of dependencies) {
      if (
        !allIncludedSchemas.has(dependency) &&
        !filters.exclude.schemas.has(dependency)
      ) {
        schemasStack.push(dependency);
      }
    }
  }

  // pass 2: drop schemas that depend on already excluded schemas
  for (const schemaName of allIncludedSchemas) {
    const dependencies = dependencyGraph.schemas.get(schemaName);

    if (!dependencies) {
      continue;
    }

    for (const excludedSchema of filters.exclude.schemas) {
      if (dependencies.has(excludedSchema)) {
        allIncludedSchemas.delete(schemaName);
        break;
      }
    }
  }

  // pass 3: collect operations that satisfy the include/exclude filters and schema dependencies
  const allIncludedOperations = new Set<string>();
  const initialOperations = filters.include.operations.size
    ? filters.include.operations
    : new Set(dependencyGraph.operations.keys());
  const operationsStack = [...initialOperations];
  while (operationsStack.length) {
    const operationKey = operationsStack.pop()!;

    if (
      filters.exclude.operations.has(operationKey) ||
      allIncludedOperations.has(operationKey)
    ) {
      continue;
    }

    // skip operation if it references any schema not included
    const dependencies = dependencyGraph.operations.get(operationKey);
    if (
      dependencies &&
      [...dependencies].some(
        (dependency) => !allIncludedSchemas.has(dependency),
      )
    ) {
      continue;
    }

    allIncludedOperations.add(operationKey);
  }

  // pass 4: remove schemas that are referenced only by excluded operations
  const referencedByIncludedOperations = new Set<string>();
  const referencedStack = [...allIncludedOperations].flatMap((operationKey) => [
    ...(dependencyGraph.operations.get(operationKey) ?? []),
  ]);
  while (referencedStack.length) {
    const schemaName = referencedStack.pop()!;

    if (referencedByIncludedOperations.has(schemaName)) {
      continue;
    }

    referencedByIncludedOperations.add(schemaName);

    const dependencies = dependencyGraph.schemas.get(schemaName);

    if (!dependencies) {
      continue;
    }

    for (const dependency of dependencies) {
      if (!referencedByIncludedOperations.has(dependency)) {
        referencedStack.push(dependency);
      }
    }
  }
  // TODO: add option to preserve orphaned schemas
  for (const schemaName of allIncludedSchemas) {
    if (!referencedByIncludedOperations.has(schemaName)) {
      allIncludedSchemas.delete(schemaName);
    }
  }

  // pass 5: replace source schemas with filtered schemas
  if (spec.components) {
    if (spec.components.schemas) {
      const schemasFiltered: typeof spec.components.schemas = {};
      for (const schemaName of allIncludedSchemas) {
        const schemaSource = spec.components.schemas[schemaName];
        if (schemaSource) {
          schemasFiltered[schemaName] = schemaSource;
        }
      }
      spec.components.schemas = schemasFiltered;
    }
  }

  // pass 6: replace source operations with filtered operations
  if (spec.paths) {
    for (const entry of Object.entries(spec.paths)) {
      const path = entry[0] as keyof PathsObject;
      const pathItem = entry[1] as PathItemObject;

      for (const method of httpMethods) {
        const operation = pathItem[method];
        if (!operation) {
          continue;
        }

        const operationKey = `${method.toUpperCase()} ${path}`;
        if (!allIncludedOperations.has(operationKey)) {
          delete pathItem[method];
        }
      }

      // remove paths that have no operations left
      if (!Object.keys(pathItem).length) {
        delete spec.paths[path];
      }
    }
  }
};
