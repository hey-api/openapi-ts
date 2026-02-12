import type { IR } from '../../../ir/types';
import { refToName } from '../../../utils/ref';

/**
 * Supported types for discriminator properties.
 */
export type DiscriminatorPropertyType = 'boolean' | 'integer' | 'number' | 'string';

/**
 * Converts a string discriminator mapping value to the appropriate type based on
 * the actual property type in the schema.
 *
 * OpenAPI discriminator mappings always use string keys, but the actual discriminator
 * property may be a boolean, number, or integer. This function converts the string
 * key to the correct runtime value and IR type.
 */
export const convertDiscriminatorValue = (
  value: string,
  propertyType: DiscriminatorPropertyType,
): { const: IR.SchemaObject['const']; type: IR.SchemaObject['type'] } => {
  switch (propertyType) {
    case 'boolean': {
      const lowerValue = value.toLowerCase();
      if (lowerValue !== 'true' && lowerValue !== 'false') {
        console.warn(
          '🚨',
          `non-boolean discriminator mapping value "${value}" for boolean property, falling back to string`,
        );
        return {
          const: value,
          type: 'string',
        };
      }
      return {
        const: lowerValue === 'true',
        type: 'boolean',
      };
    }
    case 'integer': {
      const parsed = parseInt(value, 10);
      if (Number.isNaN(parsed)) {
        console.warn(
          '🚨',
          `non-numeric discriminator mapping value "${value}" for integer property, falling back to string`,
        );
        return {
          const: value,
          type: 'string',
        };
      }
      return {
        const: parsed,
        type: 'integer',
      };
    }
    case 'number': {
      const parsed = parseFloat(value);
      if (Number.isNaN(parsed)) {
        console.warn(
          '🚨',
          `non-numeric discriminator mapping value "${value}" for number property, falling back to string`,
        );
        return {
          const: value,
          type: 'string',
        };
      }
      return {
        const: parsed,
        type: 'number',
      };
    }
    default:
      return {
        const: value,
        type: 'string',
      };
  }
};

export const discriminatorValues = (
  $ref: string,
  mapping?: Record<string, string>,
  shouldUseRefAsValue?: () => boolean,
): ReadonlyArray<string> => {
  const values: Array<string> = [];

  for (const name in mapping) {
    if (mapping[name] === $ref) {
      values.push(name);
    }
  }

  if (!values.length && (!shouldUseRefAsValue || shouldUseRefAsValue())) {
    return [refToName($ref)];
  }

  return values;
};
