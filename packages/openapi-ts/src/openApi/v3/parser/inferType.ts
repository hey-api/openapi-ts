import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export const inferType = (
  definition: OpenApiSchema,
  definitionTypes: string[],
) => {
  if (definition.enum && !definitionTypes.includes('boolean')) {
    return 'enum';
  }
  return undefined;
};

export const isDefinitionTypeNullable = (
  definition: Pick<OpenApiSchema, 'type'>,
) => getDefinitionTypes(definition).includes('null');

export const isDefinitionNullable = (
  definition: Pick<OpenApiSchema, 'nullable' | 'type'>,
) => definition.nullable === true || isDefinitionTypeNullable(definition);

export const getDefinitionTypes = ({ type }: Pick<OpenApiSchema, 'type'>) => {
  if (Array.isArray(type)) {
    return type;
  }
  if (type) {
    return [type];
  }
  return [];
};
