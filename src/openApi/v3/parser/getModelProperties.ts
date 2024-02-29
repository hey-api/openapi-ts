import type { Model } from '../../../client/interfaces/Model';
import { findOneOfParentDiscriminator, mapPropertyValue } from '../../../utils/discriminator';
import { getPattern } from '../../../utils/getPattern';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { escapeName } from './escapeName';
import type { getModel } from './getModel';
import { getModelDefault } from './getModelDefault';
import { getType } from './getType';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

export const getAdditionalPropertiesModel = (
    openApi: OpenApi,
    definition: OpenApiSchema,
    getModel: GetModelFn,
    model: Model
): Model => {
    const ap = typeof definition.additionalProperties === 'object' ? definition.additionalProperties : {};
    const apModel = getModel(openApi, ap);

    if (definition.additionalProperties === true && definition.properties) {
        apModel.default = getModelDefault(definition, model);
        apModel.export = 'generic';
        apModel.isRequired = true;
        apModel.name = '[key: string]';
        return apModel;
    }

    if (ap.$ref) {
        const apType = getType(ap.$ref);
        model.base = apType.base;
        model.default = getModelDefault(definition, model);
        model.export = 'dictionary';
        model.imports.push(...apType.imports);
        model.template = apType.template;
        model.type = apType.type;
        return model;
    }

    model.base = apModel.base;
    model.default = getModelDefault(definition, model);
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
    parent?: Model
): Model[] => {
    const models: Model[] = [];
    const discriminator = findOneOfParentDiscriminator(openApi, parent);

    for (const propertyName in definition.properties) {
        if (definition.properties.hasOwnProperty(propertyName)) {
            const property = definition.properties[propertyName];
            const propertyRequired = !!definition.required?.includes(propertyName);
            const propertyValues: Omit<
                Model,
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
                deprecated: property.deprecated === true,
                description: property.description || null,
                exclusiveMaximum: property.exclusiveMaximum,
                exclusiveMinimum: property.exclusiveMinimum,
                format: property.format,
                isDefinition: false,
                isReadOnly: property.readOnly === true,
                isRequired: propertyRequired,
                maximum: property.maximum,
                maxItems: property.maxItems,
                maxLength: property.maxLength,
                maxProperties: property.maxProperties,
                minimum: property.minimum,
                minItems: property.minItems,
                minLength: property.minLength,
                minProperties: property.minProperties,
                multipleOf: property.multipleOf,
                name: escapeName(propertyName),
                pattern: getPattern(property.pattern),
                uniqueItems: property.uniqueItems,
            };

            if (parent && discriminator?.propertyName == propertyName) {
                models.push({
                    ...propertyValues,
                    base: `'${mapPropertyValue(discriminator, parent)}'`,
                    enum: [],
                    enums: [],
                    export: 'reference',
                    imports: [],
                    isNullable: property.nullable === true,
                    link: null,
                    properties: [],
                    template: null,
                    type: 'string',
                });
            } else if (property.$ref) {
                const model = getType(property.$ref);
                models.push({
                    ...propertyValues,
                    base: model.base,
                    enum: [],
                    enums: [],
                    export: 'reference',
                    imports: model.imports,
                    isNullable: model.isNullable || property.nullable === true,
                    link: null,
                    properties: [],
                    template: model.template,
                    type: model.type,
                });
            } else {
                const model = getModel(openApi, property);
                models.push({
                    ...propertyValues,
                    base: model.base,
                    enum: model.enum,
                    enums: model.enums,
                    export: model.export,
                    imports: model.imports,
                    isNullable: model.isNullable || property.nullable === true,
                    link: model.link,
                    properties: model.properties,
                    template: model.template,
                    type: model.type,
                });
            }
        }
    }

    return models;
};
