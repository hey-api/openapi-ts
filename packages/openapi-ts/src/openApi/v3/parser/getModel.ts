import type { Model, ModelMeta } from '../../common/interfaces/client';
import { getDefault } from '../../common/parser/getDefault';
import { getEnums } from '../../common/parser/getEnums';
import { getPattern } from '../../common/parser/getPattern';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import {
  findModelComposition,
  getModelComposition,
} from './getModelComposition';
import {
  getAdditionalPropertiesModel,
  getModelProperties,
} from './getModelProperties';
import {
  getDefinitionTypes,
  inferType,
  isDefinitionNullable,
} from './inferType';

export const getModel = ({
  definition,
  isDefinition = false,
  meta,
  openApi,
  parentDefinition = null,
}: {
  definition: OpenApiSchema;
  isDefinition?: boolean;
  meta?: ModelMeta;
  openApi: OpenApi;
  parentDefinition?: OpenApiSchema | null;
}): Model => {
  const definitionTypes = getDefinitionTypes(definition);
  const inferredType = inferType(definition, definitionTypes);

  const model: Model = {
    $refs: [],
    base: 'unknown',
    deprecated: Boolean(definition.deprecated),
    description: definition.description || null,
    enum: [],
    enums: [],
    exclusiveMaximum: definition.exclusiveMaximum,
    exclusiveMinimum: definition.exclusiveMinimum,
    export: 'interface',
    format: definition.format,
    imports: [],
    isDefinition,
    isNullable: isDefinitionNullable(definition),
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
    model.$refs = [...model.$refs, definition.$ref];
    model.base = definitionRef.base;
    model.export = 'reference';
    model.imports = [...model.imports, ...definitionRef.imports];
    model.template = definitionRef.template;
    model.type = definitionRef.type;
    model.default = getDefault(definition, model);
    return model;
  }

  if (inferredType === 'enum') {
    const enums = getEnums(definition, definition.enum);
    if (enums.length) {
      model.base = 'string';
      model.enum = [...model.enum, ...enums];
      model.export = 'enum';
      model.type = 'string';
      model.default = getDefault(definition, model);
      return model;
    }
  }

  if (definitionTypes.includes('array') && definition.items) {
    if (definition.items.$ref) {
      const arrayItems = getType({ type: definition.items.$ref });
      model.$refs = [...model.$refs, definition.items.$ref];
      model.base = arrayItems.base;
      model.export = 'array';
      model.imports = [...model.imports, ...arrayItems.imports];
      model.template = arrayItems.template;
      model.type = arrayItems.type;
      model.default = getDefault(definition, model);
      return model;
    }

    if (definition.items.anyOf && parentDefinition && parentDefinition.type) {
      const foundComposition = findModelComposition(parentDefinition);
      if (
        foundComposition &&
        foundComposition.definitions.some(
          (definition) => !getDefinitionTypes(definition).includes('array'),
        )
      ) {
        return getModel({ definition: definition.items, openApi });
      }
    }

    /**
     * if items are a plain array, infer any-of composition
     * {@link} https://github.com/ferdikoomen/openapi-typescript-codegen/issues/2062
     */
    const arrayItemsDefinition: OpenApiSchema = Array.isArray(definition.items)
      ? {
          anyOf: definition.items,
        }
      : definition.items;
    const arrayItems = getModel({ definition: arrayItemsDefinition, openApi });
    model.base = arrayItems.base;
    model.export = 'array';
    model.$refs = [...model.$refs, ...arrayItems.$refs];
    model.imports = [...model.imports, ...arrayItems.imports];
    model.link = arrayItems;
    model.template = arrayItems.template;
    model.type = arrayItems.type;
    model.default = getDefault(definition, model);
    return model;
  }

  const foundComposition = findModelComposition(definition);
  if (foundComposition) {
    const composition = getModelComposition({
      ...foundComposition,
      definition,
      getModel,
      model,
      openApi,
    });
    return { ...model, ...composition };
  }

  if (definitionTypes.includes('object') || definition.properties) {
    if (definition.properties) {
      model.base = 'unknown';
      model.export = 'interface';
      model.type = 'unknown';
      model.default = getDefault(definition, model);

      const modelProperties = getModelProperties(
        openApi,
        definition,
        getModel,
        model,
      );
      modelProperties.forEach((modelProperty) => {
        model.$refs = [...model.$refs, ...modelProperty.$refs];
        model.enums = [...model.enums, ...modelProperty.enums];
        model.imports = [...model.imports, ...modelProperty.imports];
        model.properties.push(modelProperty);
        if (modelProperty.export === 'enum') {
          model.enums = [...model.enums, modelProperty];
        }
      });

      if (definition.additionalProperties) {
        const modelProperty = getAdditionalPropertiesModel(
          openApi,
          definition,
          getModel,
          model,
        );
        model.properties.push(modelProperty);
      }

      return model;
    }

    return getAdditionalPropertiesModel(openApi, definition, getModel, model);
  }

  if (definition.const !== undefined) {
    const definitionConst = definition.const;
    const modelConst =
      typeof definitionConst === 'string'
        ? `"${definitionConst}"`
        : `${definitionConst}`;
    model.base = modelConst;
    model.export = 'const';
    model.type = modelConst;
    return model;
  }

  // If the schema has a type than it can be a basic or generic type.
  if (definitionTypes.length) {
    const definitionType = getType({
      format: definition.format,
      type: definition.type,
    });
    model.base = definitionType.base;
    model.export = 'generic';
    model.$refs = [...model.$refs, ...definitionType.$refs];
    model.imports = [...model.imports, ...definitionType.imports];
    model.isNullable = definitionType.isNullable || model.isNullable;
    model.template = definitionType.template;
    model.type = definitionType.type;
    model.default = getDefault(definition, model);
    return model;
  }

  return model;
};
