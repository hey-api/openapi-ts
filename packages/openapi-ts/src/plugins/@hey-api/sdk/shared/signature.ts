import type { IR, PluginInstance } from '@hey-api/shared';
import { refToName, toCase } from '@hey-api/shared';

import type { Field } from '../../client-core/bundle/params';

type Location = keyof IR.ParametersObject | 'body';

type SignatureParameter = {
  /**
   * Is this parameter required in the SDK method signature?
   */
  isRequired: boolean;
  /**
   * Parameter name in the SDK method signature.
   */
  name: string;
  /**
   * If the name was modified due to conflicts, this holds the original name.
   */
  originalName?: string;
  /**
   * Parameter schema object.
   */
  schema: IR.SchemaObject;
};

type SignatureParameters = Record<string, SignatureParameter>;

type Signature = {
  fields: ReadonlyArray<Field>;
  parameters: SignatureParameters;
};

/**
 * Collects and resolves all operation parameters for flattened SDK signatures.
 * - Prefixes all conflicting names with their location (e.g. path_foo, query_foo)
 * - Returns a flat map of resolved parameter names to their metadata
 */
export function getSignatureParameters({
  operation,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): Signature | undefined {
  // TODO: add cookies
  const locations = ['header', 'path', 'query'] as const satisfies ReadonlyArray<Location>;
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
    // spread body if there's only a single object
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
      // alias body for more ergonomic naming, e.g. user if the type is User
      const name = refToName(operation.body.schema.$ref);
      const key = toCase(name, 'camelCase');
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
  const fields: Array<Field> = [];

  for (const location of locations) {
    const parameters = operation.parameters?.[location];
    if (parameters) {
      for (const key in parameters) {
        const parameter = parameters[key]!;
        const originalName = parameter.name;
        const name = conflicts.has(originalName) ? `${location}_${originalName}` : originalName;
        const signatureParameter: SignatureParameter = {
          isRequired: parameter.required ?? false,
          name,
          schema: parameter.schema,
        };
        if (name !== originalName) {
          signatureParameter.originalName = originalName;
        }
        signatureParameters[name] = signatureParameter;
        fields.push({
          in: location === 'header' ? 'headers' : location,
          key: name,
          ...(name !== originalName ? { map: originalName } : {}),
        });
      }
    }
  }

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
          isRequired: operation.body.schema.required?.includes(originalName) ?? false,
          name,
          schema: property,
        };
        if (name !== originalName) {
          signatureParameter.originalName = originalName;
        }
        signatureParameters[name] = signatureParameter;
        fields.push({
          in: location,
          key: name,
          ...(name !== originalName ? { map: originalName } : {}),
        });
      }
    } else if (operation.body.schema.$ref) {
      const value = refToName(operation.body.schema.$ref);
      const originalName = toCase(value, 'camelCase');
      const name = conflicts.has(originalName) ? `${location}_${originalName}` : originalName;
      const signatureParameter: SignatureParameter = {
        isRequired: operation.body.required ?? false,
        name,
        schema: operation.body.schema,
      };
      if (name !== originalName) {
        signatureParameter.originalName = originalName;
      }
      signatureParameters[name] = signatureParameter;
      fields.push({
        key: name,
        map: 'body',
      });
    } else {
      // never alias body
      signatureParameters.body = {
        isRequired: operation.body.required ?? false,
        name: 'body',
        schema: operation.body.schema,
      };
      fields.push({
        key: 'body',
        map: 'body',
      });
    }
  }

  if (!Object.keys(signatureParameters).length) {
    return;
  }

  return { fields, parameters: signatureParameters };
}
