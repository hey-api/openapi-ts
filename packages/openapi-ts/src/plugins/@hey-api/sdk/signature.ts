import type { IR } from '~/ir/types';

type Location = keyof IR.ParametersObject | 'body';

type SignatureParameter = {
  name: string;
  /**
   * If the name was modified due to conflicts, this holds the original name.
   */
  originalName?: string;
  /**
   * JSON Path to the parameter within the operation object.
   */
  path: ReadonlyArray<string | number>;
};

type SignatureParameters = Record<string, SignatureParameter>;

type SignatureField =
  | {
      kind: 'inline';
      value: SignatureParameter;
    }
  | {
      kind: 'object';
      value: SignatureParameters;
    };

export type Signature = ReadonlyArray<SignatureField>;

export const sig1 = [
  {
    kind: 'value',
    name: 'id',
    value: {
      name: 'id',
      path: ['path', 'id'],
    },
  },
  {
    kind: 'object',
    name: '',
    value: {
      limit: {
        name: 'limit',
        path: ['query', 'limit'],
      },
      search: {
        name: 'search',
        path: ['query', 'search'],
      },
    },
  },
];

/**
 * Collects and resolves all operation parameters for flattened SDK signatures.
 * - Prefixes all conflicting names with their location (e.g. path_foo, query_foo)
 * - Returns a flat map of resolved parameter names to their metadata
 */
export const getSignatureParameters = ({
  operation,
}: {
  operation: IR.OperationObject;
}): SignatureParameters | undefined => {
  // TODO: add cookies
  const locations = [
    'header',
    'path',
    'query',
  ] as const satisfies ReadonlyArray<Location>;
  const nameToLocations: Record<string, Set<Location>> = {};

  const addParameter = (name: string, location: Location): void => {
    if (!nameToLocations[name]) {
      nameToLocations[name] = new Set();
    }
    nameToLocations[name].add(location);
  };

  for (const location of locations) {
    const parameters = operation.parameters?.[location];
    if (parameters) {
      for (const key in parameters) {
        const parameter = parameters[key]!;
        addParameter(parameter.name, location);
      }
    }
  }

  if (operation.body) {
    // TODO: we might want to spread body too if there's only a single object
    // TODO: we might want to alias body for more ergonomic naming, e.g. user
    // if the type is User
    addParameter('body', 'body');
  }

  const conflicts = new Set<string>();
  for (const name in nameToLocations) {
    if (nameToLocations[name]!.size > 1) {
      conflicts.add(name);
    }
  }

  const signatureParameters: SignatureParameters = {};

  for (const location of locations) {
    const parameters = operation.parameters?.[location];
    if (parameters) {
      for (const key in parameters) {
        const parameter = parameters[key]!;
        const originalName = parameter.name;
        const name = conflicts.has(originalName)
          ? `${location}_${originalName}`
          : originalName;
        const signatureParameter: SignatureParameter = {
          name,
          path: [location, key],
        };
        if (name !== originalName) {
          signatureParameter.originalName = originalName;
        }
        signatureParameters[name] = signatureParameter;
      }
    }
  }

  if (operation.body) {
    // never alias body
    signatureParameters.body = {
      name: 'body',
      path: ['body'],
    };
  }

  if (!Object.keys(signatureParameters).length) {
    return undefined;
  }

  console.log(signatureParameters);
  return signatureParameters;
};
