import { escapeName } from '../../../utils/escape';
import { unique } from '../../../utils/unique';
import type { Model } from '../../common/interfaces/client';
import { getDefault } from '../../common/parser/getDefault';
import { getPattern } from '../../common/parser/getPattern';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import {
  findOneOfParentDiscriminator,
  mapPropertyValue,
} from './discriminator';
import type { getModel } from './getModel';
import { isDefinitionNullable } from './inferType';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

export const getAdditionalPropertiesModel = (
  openApi: OpenApi,
  definition: OpenApiSchema,
  getModel: GetModelFn,
  model: Model,
): Model => {
  const ap =
    typeof definition.additionalProperties === 'object'
      ? definition.additionalProperties
      : {};
  const apModel = getModel({ definition: ap, openApi });

  if (ap.$ref) {
    const apType = getType({ type: ap.$ref });
    model.base = apType.base;
    model.default = getDefault(definition, model);
    model.export = 'dictionary';
    model.imports.push(...apType.imports);
    model.template = apType.template;
    model.type = apType.type;
    return model;
  }

  if (definition.additionalProperties && definition.properties) {
    const additionalPropertiesType =
      typeof definition.additionalProperties === 'object' &&
      definition.additionalProperties.type &&
      !Array.isArray(definition.additionalProperties.type)
        ? definition.additionalProperties.type
        : apModel.base;
    const additionalProperties = [
      additionalPropertiesType,
      ...model.properties.map((property) => property.base),
    ];
    apModel.base = additionalProperties.filter(unique).join(' | ');
    apModel.default = getDefault(definition, model);
    apModel.export = 'generic';
    apModel.isRequired = definition.additionalProperties === true;
    apModel.name = '[key: string]';
    return apModel;
  }

  model.base = apModel.base;
  model.default = getDefault(definition, model);
  model.export = 'dictionary';
  model.imports.push(...apModel.imports);
  model.link = apModel;
  model.template = apModel.template;
  model.type = apModel.type;
  return model;
};

export const getModelProperties = (
  openApi: OpenApi,
  definition: OpenApiSchema,
  getModel: GetModelFn,
  parent?: Model,
): Model[] => {
  const models: Model[] = [];
  const discriminator = findOneOfParentDiscriminator(openApi, parent);

  Object.entries(definition.properties ?? {}).forEach(
    ([propertyName, property]) => {
      const propertyRequired = !!definition.required?.includes(propertyName);
      const propertyValues: Omit<
        Model,
        | '$refs'
        | 'base'
        | 'enum'
        | 'enums'
        | 'export'
        | 'imports'
        | 'isNullable'
        | 'link'
        | 'properties'
        | 'template'
        | 'type'
      > = {
        default: property.default,
        deprecated: property.deprecated === true,
        description: property.description || null,
        exclusiveMaximum: property.exclusiveMaximum,
        exclusiveMinimum: property.exclusiveMinimum,
        format: property.format,
        isDefinition: false,
        isReadOnly: property.readOnly === true,
        isRequired: propertyRequired,
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
        uniqueItems: property.uniqueItems,
      };

      if (parent && discriminator?.propertyName == propertyName) {
        models.push({
          ...propertyValues,
          $refs: [],
          base: `'${mapPropertyValue(discriminator, parent)}'`,
          enum: [],
          enums: [],
          export: 'reference',
          imports: [],
          isNullable: isDefinitionNullable(property),
          link: null,
          properties: [],
          template: null,
          type: 'string',
        });
      } else if (property.$ref) {
        const model = getType({ type: property.$ref });
        models.push({
          ...propertyValues,
          $refs: model.$refs,
          base: model.base,
          enum: [],
          enums: [],
          export: 'reference',
          imports: model.imports,
          isNullable: model.isNullable || isDefinitionNullable(property),
          link: null,
          properties: [],
          template: model.template,
          type: model.type,
        });
      } else {
        const model = getModel({ definition: property, openApi });
        models.push({
          ...propertyValues,
          $refs: model.$refs,
          base: model.base,
          default: model.default,
          enum: model.enum,
          enums: model.enums,
          export: model.export,
          imports: model.imports,
          isNullable: model.isNullable || isDefinitionNullable(property),
          link: model.link,
          properties: model.properties,
          template: model.template,
          type: model.type,
        });
      }
    },
  );

  return models;
};
