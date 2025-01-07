import { paginationKeywordsRegExp } from '../../../ir/pagination';
import type { IR } from '../../../ir/types';
import type { SchemaType } from '../../shared/types/schema';
import type {
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
} from '../types/spec';
import { type SchemaObject } from '../types/spec';
import { mediaTypeObject } from './mediaType';
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
  schema: SchemaObject | ReferenceObject;
}): boolean | string => {
  paginationKeywordsRegExp.lastIndex = 0;
  if (paginationKeywordsRegExp.test(name)) {
    return true;
  }

  if ('$ref' in schema) {
    const ref = context.resolveRef<
      ParameterObject | RequestBodyObject | SchemaObject
    >(schema.$ref);

    if ('content' in ref || 'in' in ref) {
      let refSchema: SchemaObject | ReferenceObject | undefined;

      if ('in' in ref) {
        refSchema = ref.schema;
      }

      if (!refSchema) {
        // parameter or body
        const content = mediaTypeObject({ content: ref.content });
        if (content?.schema) {
          refSchema = content.schema;
        }
      }

      if (!refSchema) {
        return false;
      }

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
