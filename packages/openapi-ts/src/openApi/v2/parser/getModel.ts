import type { Client } from '../../../types/client';
import type { Model, ModelMeta } from '../../common/interfaces/client';
import { getEnums } from '../../common/parser/getEnums';
import { getPattern } from '../../common/parser/getPattern';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModelComposition } from './getModelComposition';
import { getModelProperties } from './getModelProperties';

export const getModel = ({
  definition,
  isDefinition = false,
  meta,
  openApi,
  types,
}: Pick<Client, 'types'> & {
  definition: OpenApiSchema;
  isDefinition?: boolean;
  meta?: ModelMeta;
  openApi: OpenApi;
}): Model => {
  const model: Model = {
    $refs: [],
    base: 'unknown',
    description: definition.description || null,
    enum: [],
    enums: [],
    exclusiveMaximum: definition.exclusiveMaximum,
    exclusiveMinimum: definition.exclusiveMinimum,
    export: 'interface',
    format: definition.format,
    imports: [],
    in: '',
    isDefinition,
    isNullable: definition['x-nullable'] === true,
    isReadOnly: definition.readOnly === true,
    isRequired: false,
    link: null,
    maxItems: definition.maxItems,
    maxLength: definition.maxLength,
    maxProperties: definition.maxProperties,
    maximum: definition.maximum,
    meta,
    minItems: definition.minItems,
    minLength: definition.minLength,
    minProperties: definition.minProperties,
    minimum: definition.minimum,
    multipleOf: definition.multipleOf,
    name: meta?.name ?? '',
    pattern: getPattern(definition.pattern),
    properties: [],
    template: null,
    type: 'unknown',
    uniqueItems: definition.uniqueItems,
  };

  if (definition.$ref) {
    const definitionRef = getType({ type: definition.$ref });
    model.export = 'reference';
    model.type = definitionRef.type;
    model.base = definitionRef.base;
    model.template = definitionRef.template;
    model.imports.push(...definitionRef.imports);
    return model;
  }

  if (definition.enum && definition.type !== 'boolean') {
    const enums = getEnums(definition, definition.enum);
    if (enums.length) {
      model.base = 'string';
      model.enum = [...model.enum, ...enums];
      model.export = 'enum';
      model.type = 'string';
      return model;
    }
  }

  if (definition.type === 'array' && definition.items) {
    if (definition.items.$ref) {
      const arrayItems = getType({ type: definition.items.$ref });
      model.export = 'array';
      model.type = arrayItems.type;
      model.base = arrayItems.base;
      model.template = arrayItems.template;
      model.imports.push(...arrayItems.imports);
      return model;
    } else {
      const arrayItems = getModel({
        definition: definition.items,
        openApi,
        types,
      });
      model.export = 'array';
      model.type = arrayItems.type;
      model.base = arrayItems.base;
      model.template = arrayItems.template;
      model.link = arrayItems;
      model.imports.push(...arrayItems.imports);
      return model;
    }
  }

  if (
    definition.type === 'object' &&
    typeof definition.additionalProperties === 'object'
  ) {
    if (definition.additionalProperties.$ref) {
      const additionalProperties = getType({
        type: definition.additionalProperties.$ref,
      });
      model.export = 'dictionary';
      model.type = additionalProperties.type;
      model.base = additionalProperties.base;
      model.template = additionalProperties.template;
      model.imports.push(...additionalProperties.imports);
      return model;
    } else {
      const additionalProperties = getModel({
        definition: definition.additionalProperties,
        openApi,
        types,
      });
      model.export = 'dictionary';
      model.type = additionalProperties.type;
      model.base = additionalProperties.base;
      model.template = additionalProperties.template;
      model.link = additionalProperties;
      model.imports.push(...additionalProperties.imports);
      return model;
    }
  }

  if (definition.allOf?.length) {
    const composition = getModelComposition({
      definition,
      definitions: definition.allOf,
      getModel,
      openApi,
      type: 'all-of',
      types,
    });
    model.export = composition.export;
    model.imports.push(...composition.imports);
    model.properties.push(...composition.properties);
    model.enums = [...model.enums, ...composition.enums];
    return model;
  }

  if (definition.type === 'object') {
    model.export = 'interface';
    model.type = 'unknown';
    model.base = 'unknown';

    if (definition.properties) {
      const modelProperties = getModelProperties({
        definition,
        getModel,
        openApi,
        types,
      });
      modelProperties.forEach((modelProperty) => {
        model.imports.push(...modelProperty.imports);
        model.enums = [...model.enums, ...modelProperty.enums];
        model.properties.push(modelProperty);
        if (modelProperty.export === 'enum') {
          model.enums = [...model.enums, modelProperty];
        }
      });
    }
    return model;
  }

  // If the schema has a type than it can be a basic or generic type.
  if (definition.type) {
    const definitionType = getType({
      format: definition.format,
      type: definition.type,
    });
    model.export = 'generic';
    model.type = definitionType.type;
    model.base = definitionType.base;
    model.template = definitionType.template;
    model.imports.push(...definitionType.imports);
    return model;
  }

  return model;
};
