import { paginationKeywordsRegExp } from '../../../ir/pagination';
import type { IR } from '../../../ir/types';
import type { SchemaType } from '../../shared/types/schema';
import type { ParameterObject, ReferenceObject } from '../types/spec';
import { type SchemaObject } from '../types/spec';
import { getSchemaType } from './schema';

const isPaginationType = (
  schemaType: SchemaType<SchemaObject> | undefined,
): boolean =>
  schemaType === 'boolean' ||
  schemaType === 'integer' ||
  schemaType === 'number' ||
  schemaType === 'string';

// We handle only simple values for now, up to 1 nested field
export const paginationField = ({
  context,
  name,
  schema,
}: {
  context: IR.Context;
  name: string;
  schema:
    | ParameterObject
    | SchemaObject
    | ReferenceObject
    | {
        in: undefined;
      };
}): boolean | string => {
  paginationKeywordsRegExp.lastIndex = 0;
  if (paginationKeywordsRegExp.test(name)) {
    return true;
  }

  if ('$ref' in schema) {
    const ref = context.resolveRef<ParameterObject | SchemaObject>(
      schema.$ref ?? '',
    );

    if ('in' in ref && ref.in) {
      const refSchema =
        'schema' in ref
          ? ref.schema
          : {
              ...ref,
              in: undefined,
            };

      return paginationField({
        context,
        name,
        schema: refSchema,
      });
    }

    return paginationField({
      context,
      name,
      schema: ref,
    });
  }

  if ('in' in schema) {
    if (!schema.in) {
      return false;
    }

    const finalSchema =
      'schema' in schema
        ? schema.schema
        : {
            ...schema,
            in: undefined,
          };

    return paginationField({
      context,
      name,
      schema: finalSchema,
    });
  }

  for (const name in schema.properties) {
    paginationKeywordsRegExp.lastIndex = 0;

    if (paginationKeywordsRegExp.test(name)) {
      const property = schema.properties[name]!;

      if (typeof property !== 'boolean' && !('$ref' in property)) {
        const schemaType = getSchemaType({ schema: property });
        // TODO: resolve deeper references

        if (isPaginationType(schemaType)) {
          return name;
        }
      }
    }
  }

  for (const allOf of schema.allOf ?? []) {
    const pagination = paginationField({
      context,
      name,
      schema: allOf,
    });
    if (pagination) {
      return pagination;
    }
  }

  return false;
};
