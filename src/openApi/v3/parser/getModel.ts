import type { Model } from '../../../client/interfaces/Model';
import { getPattern } from '../../../utils/getPattern';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { extendEnum } from './extendEnum';
import { getEnum } from './getEnum';
import { findModelComposition, getModelComposition } from './getModelComposition';
import { getModelDefault } from './getModelDefault';
import { getAdditionalPropertiesModel, getModelProperties } from './getModelProperties';
import { getType } from './getType';

export const getModel = (
    openApi: OpenApi,
    definition: OpenApiSchema,
    isDefinition: boolean = false,
    name: string = '',
    parentDefinition: OpenApiSchema | null = null
): Model => {
    const model: Model = {
        name,
        export: 'interface',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: definition.description || null,
        deprecated: definition.deprecated === true,
        isDefinition,
        isReadOnly: definition.readOnly === true,
        isNullable: definition.nullable === true,
        isRequired: false,
        format: definition.format,
        maximum: definition.maximum,
        exclusiveMaximum: definition.exclusiveMaximum,
        minimum: definition.minimum,
        exclusiveMinimum: definition.exclusiveMinimum,
        multipleOf: definition.multipleOf,
        maxLength: definition.maxLength,
        minLength: definition.minLength,
        maxItems: definition.maxItems,
        minItems: definition.minItems,
        uniqueItems: definition.uniqueItems,
        maxProperties: definition.maxProperties,
        minProperties: definition.minProperties,
        pattern: getPattern(definition.pattern),
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };

    if (definition.$ref) {
        const definitionRef = getType(definition.$ref);
        model.export = 'reference';
        model.type = definitionRef.type;
        model.base = definitionRef.base;
        model.template = definitionRef.template;
        model.imports.push(...definitionRef.imports);
        model.default = getModelDefault(definition, model);
        return model;
    }

    if (definition.enum && definition.type !== 'boolean') {
        const enumerators = getEnum(definition.enum);
        const extendedEnumerators = extendEnum(enumerators, definition);
        if (extendedEnumerators.length) {
            model.export = 'enum';
            model.type = 'string';
            model.base = 'string';
            model.enum.push(...extendedEnumerators);
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItems = getType(definition.items.$ref);
            model.export = 'array';
            model.type = arrayItems.type;
            model.base = arrayItems.base;
            model.template = arrayItems.template;
            model.imports.push(...arrayItems.imports);
            model.default = getModelDefault(definition, model);
            return model;
        }

        if (definition.items.anyOf && parentDefinition && parentDefinition.type) {
            const foundComposition = findModelComposition(parentDefinition);
            if (foundComposition && foundComposition.definitions.some(definition => definition.type !== 'array')) {
                return getModel(openApi, definition.items);
            }
        }

        const arrayItems = getModel(openApi, definition.items);
        model.export = 'array';
        model.type = arrayItems.type;
        model.base = arrayItems.base;
        model.template = arrayItems.template;
        model.link = arrayItems;
        model.imports.push(...arrayItems.imports);
        model.default = getModelDefault(definition, model);
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

    if (definition.type === 'object') {
        if (definition.properties) {
            model.export = 'interface';
            model.type = 'any';
            model.base = 'any';
            model.default = getModelDefault(definition, model);

            const modelProperties = getModelProperties(openApi, definition, getModel, model);
            modelProperties.forEach(modelProperty => {
                model.imports.push(...modelProperty.imports);
                model.enums.push(...modelProperty.enums);
                model.properties.push(modelProperty);
                if (modelProperty.export === 'enum') {
                    model.enums.push(modelProperty);
                }
            });

            if (definition.additionalProperties === true) {
                const modelProperty = getAdditionalPropertiesModel(openApi, definition, getModel, model);
                model.properties.push(modelProperty);
            }

            return model;
        }

        return getAdditionalPropertiesModel(openApi, definition, getModel, model);
    }

    if (definition.const !== undefined) {
        model.export = 'const';
        const definitionConst = definition.const;
        const modelConst = typeof definitionConst === 'string' ? `"${definitionConst}"` : `${definitionConst}`;
        model.type = modelConst;
        model.base = modelConst;
        return model;
    }

    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType(definition.type, definition.format);
        model.export = 'generic';
        model.type = definitionType.type;
        model.base = definitionType.base;
        model.template = definitionType.template;
        model.isNullable = definitionType.isNullable || model.isNullable;
        model.imports.push(...definitionType.imports);
        model.default = getModelDefault(definition, model);
        return model;
    }

    return model;
};
