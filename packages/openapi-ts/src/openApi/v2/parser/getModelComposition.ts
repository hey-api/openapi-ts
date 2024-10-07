import type { Client } from '../../../types/client';
import type { Model, ModelComposition } from '../../common/interfaces/client';
import type { GetModelFn } from '../interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModelProperties } from './getModelProperties';
import { getRequiredPropertiesFromComposition } from './getRequiredPropertiesFromComposition';

export const getModelComposition = ({
  definition,
  definitions,
  getModel,
  openApi,
  type,
  types,
}: {
  definition: OpenApiSchema;
  definitions: OpenApiSchema[];
  getModel: GetModelFn;
  openApi: OpenApi;
  type: 'one-of' | 'any-of' | 'all-of';
  types: Client['types'];
}): ModelComposition => {
  const composition: ModelComposition = {
    $refs: [],
    enums: [],
    export: type,
    imports: [],
    properties: [],
  };

  const properties: Model[] = [];

  definitions
    .map((definition) => getModel({ definition, openApi, types }))
    .filter((model) => {
      const hasProperties = model.properties.length;
      const hasEnums = model.enums.length;
      const isObject = model.type === 'unknown';
      const isEmpty = isObject && !hasProperties && !hasEnums;
      return !isEmpty;
    })
    .forEach((model) => {
      composition.imports.push(...model.imports);
      composition.enums.push(...model.enums);
      composition.properties.push(model);
    });

  if (definition.required && type === 'all-of') {
    const requiredProperties = getRequiredPropertiesFromComposition({
      definitions,
      getModel,
      openApi,
      required: definition.required,
      types,
    });
    requiredProperties.forEach((requiredProperty) => {
      composition.imports.push(...requiredProperty.imports);
      composition.enums.push(...requiredProperty.enums);
    });
    properties.push(...requiredProperties);
  }

  if (definition.properties) {
    const modelProperties = getModelProperties({
      definition,
      getModel,
      openApi,
      types,
    });
    modelProperties.forEach((modelProperty) => {
      composition.imports.push(...modelProperty.imports);
      composition.enums.push(...modelProperty.enums);
      if (modelProperty.export === 'enum') {
        composition.enums.push(modelProperty);
      }
    });
    properties.push(...modelProperties);
  }

  if (properties.length) {
    composition.properties.push({
      $refs: [],
      base: 'unknown',
      description: '',
      enum: [],
      enums: [],
      export: 'interface',
      imports: [],
      in: '',
      isDefinition: false,
      isNullable: false,
      isReadOnly: false,
      isRequired: false,
      link: null,
      name: 'properties',
      properties,
      template: null,
      type: 'unknown',
    });
  }

  return composition;
};
