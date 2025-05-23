import type { Config } from '../../../types/config';
import type { Graph } from './graph';
import { addNamespace, removeNamespace } from './graph';

type FiltersConfigToState<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends ReadonlyArray<infer U>
    ? Set<U>
    : NonNullable<T[K]> extends object
      ? FiltersConfigToState<NonNullable<T[K]>>
      : T[K];
};

export type Filters = FiltersConfigToState<
  NonNullable<Config['input']['filters']>
>;

export const createFilters = (config: Config['input']['filters']): Filters => {
  const filters: Filters = {
    deprecated: config?.deprecated ?? true,
    operations: {
      exclude: new Set(
        config?.operations?.exclude?.map((value) =>
          addNamespace('operation', value),
        ),
      ),
      include: new Set(
        config?.operations?.include?.map((value) =>
          addNamespace('operation', value),
        ),
      ),
    },
    orphans: config?.orphans ?? false,
    preserveOrder: config?.preserveOrder ?? false,
    requestBodies: {
      exclude: new Set(
        config?.requestBodies?.exclude?.map((value) =>
          addNamespace('body', value),
        ),
      ),
      include: new Set(
        config?.requestBodies?.include?.map((value) =>
          addNamespace('body', value),
        ),
      ),
    },
    schemas: {
      exclude: new Set(
        config?.schemas?.exclude?.map((value) => addNamespace('schema', value)),
      ),
      include: new Set(
        config?.schemas?.include?.map((value) => addNamespace('schema', value)),
      ),
    },
    tags: {
      exclude: new Set(config?.tags?.exclude),
      include: new Set(config?.tags?.include),
    },
  };
  return filters;
};

export const hasFilters = (config: Config['input']['filters']): boolean => {
  if (!config) {
    return false;
  }

  // we explicitly want to strip orphans or deprecated
  if (config.orphans === false || config.deprecated === false) {
    return true;
  }

  return Boolean(
    config.operations?.exclude?.length ||
      config.operations?.include?.length ||
      config.requestBodies?.exclude?.length ||
      config.requestBodies?.include?.length ||
      config.schemas?.exclude?.length ||
      config.schemas?.include?.length ||
      config.tags?.exclude?.length ||
      config.tags?.include?.length,
  );
};

/**
 * Collect operations that satisfy the include/exclude filters and schema dependencies.
 */
const collectOperations = ({
  filters,
  graph,
  requestBodies,
  schemas,
}: {
  filters: Filters;
  graph: Graph;
  requestBodies: Set<string>;
  schemas: Set<string>;
}): {
  operations: Set<string>;
} => {
  const finalSet = new Set<string>();
  const initialSet = filters.operations.include.size
    ? filters.operations.include
    : new Set(graph.operations.keys());
  const stack = [...initialSet];
  while (stack.length) {
    const key = stack.pop()!;

    if (filters.operations.exclude.has(key) || finalSet.has(key)) {
      continue;
    }

    const node = graph.operations.get(key);

    if (!node) {
      continue;
    }

    if (!filters.deprecated && node.deprecated) {
      continue;
    }

    if (
      filters.tags.exclude.size &&
      node.tags.size &&
      [...filters.tags.exclude].some((tag) => node.tags.has(tag))
    ) {
      continue;
    }

    if (
      filters.tags.include.size &&
      !new Set([...filters.tags.include].filter((tag) => node.tags.has(tag)))
        .size
    ) {
      continue;
    }

    // skip operation if it references any component not included
    if (
      [...node.dependencies].some((dependency) => {
        const { namespace } = removeNamespace(dependency);
        switch (namespace) {
          case 'body':
            return !requestBodies.has(dependency);
          case 'schema':
            return !schemas.has(dependency);
          default:
            return false;
        }
      })
    ) {
      continue;
    }

    finalSet.add(key);
  }
  return { operations: finalSet };
};

/**
 * Collect requestBodies that satisfy the include/exclude filters and schema dependencies.
 */
const collectRequestBodies = ({
  filters,
  graph,
  schemas,
}: {
  filters: Filters;
  graph: Graph;
  schemas: Set<string>;
}): {
  requestBodies: Set<string>;
} => {
  const finalSet = new Set<string>();
  const initialSet = filters.requestBodies.include.size
    ? filters.requestBodies.include
    : new Set(graph.requestBodies.keys());
  const stack = [...initialSet];
  while (stack.length) {
    const key = stack.pop()!;

    if (filters.requestBodies.exclude.has(key) || finalSet.has(key)) {
      continue;
    }

    const node = graph.requestBodies.get(key);

    if (!node) {
      continue;
    }

    if (!filters.deprecated && node.deprecated) {
      continue;
    }

    finalSet.add(key);

    if (!node.dependencies.size) {
      continue;
    }

    for (const dependency of node.dependencies) {
      const { namespace } = removeNamespace(dependency);
      switch (namespace) {
        case 'body': {
          if (filters.requestBodies.exclude.has(dependency)) {
            finalSet.delete(key);
          } else if (!finalSet.has(dependency)) {
            stack.push(dependency);
          }
          break;
        }
        case 'schema': {
          if (filters.schemas.exclude.has(dependency)) {
            finalSet.delete(key);
          } else if (!schemas.has(dependency)) {
            schemas.add(dependency);
          }
          break;
        }
      }
    }
  }
  return { requestBodies: finalSet };
};

/**
 * Collect schemas that satisfy the include/exclude filters.
 */
const collectSchemas = ({
  filters,
  graph,
}: {
  filters: Filters;
  graph: Graph;
}): {
  schemas: Set<string>;
} => {
  const finalSet = new Set<string>();
  const initialSet = filters.schemas.include.size
    ? filters.schemas.include
    : new Set(graph.schemas.keys());
  const stack = [...initialSet];
  while (stack.length) {
    const key = stack.pop()!;

    if (filters.schemas.exclude.has(key) || finalSet.has(key)) {
      continue;
    }

    const node = graph.schemas.get(key);

    if (!node) {
      continue;
    }

    if (!filters.deprecated && node.deprecated) {
      continue;
    }

    finalSet.add(key);

    if (!node.dependencies.size) {
      continue;
    }

    for (const dependency of node.dependencies) {
      const { namespace } = removeNamespace(dependency);
      switch (namespace) {
        case 'schema': {
          if (
            !finalSet.has(dependency) &&
            !filters.schemas.exclude.has(dependency)
          ) {
            stack.push(dependency);
          }
          break;
        }
      }
    }
  }
  return { schemas: finalSet };
};

/**
 * Drop request bodies that depend on already excluded request bodies.
 */
const dropExcludedRequestBodies = ({
  filters,
  graph,
  requestBodies,
}: {
  filters: Filters;
  graph: Graph;
  requestBodies: Set<string>;
}): void => {
  if (!filters.requestBodies.exclude.size) {
    return;
  }

  for (const key of requestBodies) {
    const node = graph.requestBodies.get(key);

    if (!node?.dependencies.size) {
      continue;
    }

    for (const excludedKey of filters.requestBodies.exclude) {
      if (node.dependencies.has(excludedKey)) {
        requestBodies.delete(key);
        break;
      }
    }
  }
};

/**
 * Drop schemas that depend on already excluded schemas.
 */
const dropExcludedSchemas = ({
  filters,
  graph,
  schemas,
}: {
  filters: Filters;
  graph: Graph;
  schemas: Set<string>;
}): void => {
  if (!filters.schemas.exclude.size) {
    return;
  }

  for (const key of schemas) {
    const node = graph.schemas.get(key);

    if (!node?.dependencies.size) {
      continue;
    }

    for (const excludedKey of filters.schemas.exclude) {
      if (node.dependencies.has(excludedKey)) {
        schemas.delete(key);
        break;
      }
    }
  }
};

const dropOrphans = ({
  operationDependencies,
  requestBodies,
  schemas,
}: {
  operationDependencies: Set<string>;
  requestBodies: Set<string>;
  schemas: Set<string>;
}) => {
  for (const key of schemas) {
    if (!operationDependencies.has(key)) {
      schemas.delete(key);
    }
  }
  for (const key of requestBodies) {
    if (!operationDependencies.has(key)) {
      requestBodies.delete(key);
    }
  }
};

const collectOperationDependencies = ({
  graph,
  operations,
}: {
  graph: Graph;
  operations: Set<string>;
}): {
  operationDependencies: Set<string>;
} => {
  const finalSet = new Set<string>();
  const initialSet = new Set(
    [...operations].flatMap((key) => [
      ...(graph.operations.get(key)?.dependencies ?? []),
    ]),
  );
  const stack = [...initialSet];
  while (stack.length) {
    const key = stack.pop()!;

    if (finalSet.has(key)) {
      continue;
    }

    finalSet.add(key);

    const { namespace } = removeNamespace(key);
    let dependencies: Set<string> | undefined;
    if (namespace === 'body') {
      dependencies = graph.requestBodies.get(key)?.dependencies;
    } else if (namespace === 'operation') {
      dependencies = graph.operations.get(key)?.dependencies;
    } else if (namespace === 'schema') {
      dependencies = graph.schemas.get(key)?.dependencies;
    }

    if (!dependencies?.size) {
      continue;
    }

    for (const dependency of dependencies) {
      if (!finalSet.has(dependency)) {
        stack.push(dependency);
      }
    }
  }
  return { operationDependencies: finalSet };
};

export const createFilteredDependencies = ({
  filters,
  graph,
}: {
  filters: Filters;
  graph: Graph;
}): {
  operations: Set<string>;
  requestBodies: Set<string>;
  schemas: Set<string>;
} => {
  const { schemas } = collectSchemas({ filters, graph });
  const { requestBodies } = collectRequestBodies({
    filters,
    graph,
    schemas,
  });

  dropExcludedSchemas({ filters, graph, schemas });
  dropExcludedRequestBodies({ filters, graph, requestBodies });

  // collect operations after dropping components
  const { operations } = collectOperations({
    filters,
    graph,
    requestBodies,
    schemas,
  });

  if (!filters.orphans) {
    const { operationDependencies } = collectOperationDependencies({
      graph,
      operations,
    });
    dropOrphans({ operationDependencies, requestBodies, schemas });
  }

  return {
    operations,
    requestBodies,
    schemas,
  };
};
