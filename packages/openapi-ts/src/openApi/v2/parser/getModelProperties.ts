import type { Client } from '../../../types/client';
import { escapeName } from '../../../utils/escape';
import type { Model } from '../../common/interfaces/client';
import { getPattern } from '../../common/parser/getPattern';
import { getType } from '../../common/parser/type';
import type { GetModelFn } from '../interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export const getModelProperties = ({
  definition,
  getModel,
  openApi,
  types,
}: {
  definition: OpenApiSchema;
  getModel: GetModelFn;
  openApi: OpenApi;
  types: Client['types'];
}): Model[] => {
  const models: Model[] = [];

  Object.entries(definition.properties ?? {}).forEach(
    ([propertyName, property]) => {
      const propertyRequired = Boolean(
        definition.required?.includes(propertyName),
      );
      if (property.$ref) {
        const model = getType({ type: property.$ref });
        models.push({
          $refs: [],
          base: model.base,
          description: property.description || null,
          enum: [],
          enums: [],
          exclusiveMaximum: property.exclusiveMaximum,
          exclusiveMinimum: property.exclusiveMinimum,
          export: 'reference',
          format: property.format,
          imports: model.imports,
          in: '',
          isDefinition: false,
          isNullable: property['x-nullable'] === true,
          isReadOnly: property.readOnly === true,
          isRequired: propertyRequired,
          link: null,
          maxItems: property.maxItems,
          maxLength: property.maxLength,
          maxProperties: property.maxProperties,
          maximum: property.maximum,
          minItems: property.minItems,
          minLength: property.minLength,
          minProperties: property.minProperties,
          minimum: property.minimum,
          multipleOf: property.multipleOf,
          name: escapeName(propertyName),
          pattern: getPattern(property.pattern),
          properties: [],
          template: model.template,
          type: model.type,
          uniqueItems: property.uniqueItems,
        });
      } else {
        const model = getModel({ definition: property, openApi, types });
        models.push({
          $refs: [],
          base: model.base,
          description: property.description || null,
          enum: model.enum,
          enums: model.enums,
          exclusiveMaximum: property.exclusiveMaximum,
          exclusiveMinimum: property.exclusiveMinimum,
          export: model.export,
          format: property.format,
          imports: model.imports,
          in: '',
          isDefinition: false,
          isNullable: property['x-nullable'] === true,
          isReadOnly: property.readOnly === true,
          isRequired: propertyRequired,
          link: model.link,
          maxItems: property.maxItems,
          maxLength: property.maxLength,
          maxProperties: property.maxProperties,
          maximum: property.maximum,
          minItems: property.minItems,
          minLength: property.minLength,
          minProperties: property.minProperties,
          minimum: property.minimum,
          multipleOf: property.multipleOf,
          name: escapeName(propertyName),
          pattern: getPattern(property.pattern),
          properties: model.properties,
          template: model.template,
          type: model.type,
          uniqueItems: property.uniqueItems,
        });
      }
    },
  );

  return models;
};
