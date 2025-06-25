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
 *
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

/**
 * Helper to set a value at a path in an object.
 */
export const setAtPath = (
  obj: any,
  path: Array<string | number>,
  value: unknown,
) => {
  let curr = obj;
  for (let i = 0; i < path.length - 1; i++) {
    curr = curr[path[i]!];
  }
  curr[path[path.length - 1]!] = value;
};

export const getUniqueComponentName = (
  components: Record<string, unknown>,
  base: string,
): string => {
  let i = 1;
  let name = base;
  while (Object.prototype.hasOwnProperty.call(components, name)) {
    name = `${base}${i++}`;
  }
  return name;
};
