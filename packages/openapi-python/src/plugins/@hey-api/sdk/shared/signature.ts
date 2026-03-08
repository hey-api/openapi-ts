import type { IR } from '@hey-api/shared';
import { refToName, toCase } from '@hey-api/shared';

type Location = keyof IR.ParametersObject | 'body';

type SignatureParameter = {
  in: Location;
  isRequired: boolean;
  name: string;
  originalName?: string;
  schema: IR.SchemaObject;
};

type SignatureParameters = Record<string, SignatureParameter>;

type Signature = {
  bodyRef?: string;
  parameters: SignatureParameters;
};

export function getSignatureParameters({
  operation,
}: {
  operation: IR.OperationObject;
}): Signature | undefined {
  const locations = ['header', 'path', 'query'] as const satisfies ReadonlyArray<Location>;
  const nameToLocations: Record<string, Set<Location>> = {};

  const addParameter = (name: string, location: Location): void => {
    if (!nameToLocations[name]) {
      nameToLocations[name] = new Set();
    }
    nameToLocations[name]!.add(location);
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
    if (
      !operation.body.schema.logicalOperator &&
      operation.body.schema.type === 'object' &&
      operation.body.schema.properties
    ) {
      const properties = operation.body.schema.properties;
      for (const key in properties) {
        addParameter(key, 'body');
      }
    } else if (operation.body.schema.$ref) {
      const name = refToName(operation.body.schema.$ref);
      const key = toCase(name, 'snake_case');
      addParameter(key, 'body');
    } else {
      addParameter('body', 'body');
    }
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
        const name = conflicts.has(originalName) ? `${location}_${originalName}` : originalName;
        const signatureParameter: SignatureParameter = {
          in: location,
          isRequired: parameter.required ?? false,
          name,
          schema: parameter.schema,
        };
        if (name !== originalName) {
          signatureParameter.originalName = originalName;
        }
        signatureParameters[name] = signatureParameter;
      }
    }
  }

  let bodyRef: string | undefined;

  if (operation.body) {
    const location = 'body';
    if (
      !operation.body.schema.logicalOperator &&
      operation.body.schema.type === 'object' &&
      operation.body.schema.properties
    ) {
      const properties = operation.body.schema.properties;
      for (const originalName in properties) {
        const property = properties[originalName]!;
        const name = conflicts.has(originalName) ? `${location}_${originalName}` : originalName;
        const signatureParameter: SignatureParameter = {
          in: location,
          isRequired: operation.body.schema.required?.includes(originalName) ?? false,
          name,
          schema: property,
        };
        if (name !== originalName) {
          signatureParameter.originalName = originalName;
        }
        signatureParameters[name] = signatureParameter;
      }
    } else if (operation.body.schema.$ref) {
      const value = refToName(operation.body.schema.$ref);
      const originalName = toCase(value, 'snake_case');
      const name = conflicts.has(originalName) ? `${location}_${originalName}` : originalName;
      bodyRef = toCase(value, 'PascalCase');
      const signatureParameter: SignatureParameter = {
        in: location,
        isRequired: operation.body.required ?? false,
        name,
        schema: operation.body.schema,
      };
      if (name !== originalName) {
        signatureParameter.originalName = originalName;
      }
      signatureParameters[name] = signatureParameter;
    } else {
      signatureParameters.body = {
        in: location,
        isRequired: operation.body.required ?? false,
        name: 'body',
        schema: operation.body.schema,
      };
    }
  }

  if (!Object.keys(signatureParameters).length) {
    return;
  }

  return { bodyRef, parameters: signatureParameters };
}
