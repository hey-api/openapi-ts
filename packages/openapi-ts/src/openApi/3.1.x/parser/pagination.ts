import { paginationKeywordsRegExp } from '../../../ir/pagination';
import type { IR } from '../../../ir/types';
import type { ParameterObject, RequestBodyObject } from '../types/spec';
import { type SchemaObject } from '../types/spec';
import { mediaTypeObject } from './mediaType';
import { getSchemaTypes } from './schema';

// We handle only simple values for now, up to 1 nested field
export const paginationField = ({
  context,
  name,
  schema,
}: {
  context: IR.Context;
  name: string;
  schema: SchemaObject;
}): boolean | string => {
  paginationKeywordsRegExp.lastIndex = 0;
  if (paginationKeywordsRegExp.test(name)) {
    return true;
  }

  if (schema.$ref) {
    const ref = context.resolveRef<
      ParameterObject | RequestBodyObject | SchemaObject
    >(schema.$ref);

    if ('content' in ref || 'in' in ref) {
      let refSchema: SchemaObject | undefined;

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
      const property = schema.properties[name];

      if (typeof property !== 'boolean') {
        const schemaTypes = getSchemaTypes({ schema: property });
        // TODO: resolve deeper references

        if (
          schemaTypes.includes('boolean') ||
          schemaTypes.includes('integer') ||
          schemaTypes.includes('number') ||
          schemaTypes.includes('string')
        ) {
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
