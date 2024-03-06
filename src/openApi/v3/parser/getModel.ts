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
        base: 'any',
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
        isNullable: definition.nullable === true,
        isReadOnly: definition.readOnly === true,
        isRequired: false,
        link: null,
        maximum: definition.maximum,
        maxItems: definition.maxItems,
        maxLength: definition.maxLength,
        maxProperties: definition.maxProperties,
        minimum: definition.minimum,
        minItems: definition.minItems,
        minLength: definition.minLength,
        minProperties: definition.minProperties,
        multipleOf: definition.multipleOf,
        name,
        pattern: getPattern(definition.pattern),
        properties: [],
        template: null,
        type: 'any',
        uniqueItems: definition.uniqueItems,
    };

    if (definition.$ref) {
        const definitionRef = getType(definition.$ref);
        model.base = definitionRef.base;
        model.export = 'reference';
        model.imports.push(...definitionRef.imports);
        model.template = definitionRef.template;
        model.type = definitionRef.type;
        model.default = getModelDefault(definition, model);
        return model;
    }

    if (definition.enum && definition.type !== 'boolean') {
        const enumerators = getEnum(definition.enum);
        const extendedEnumerators = extendEnum(enumerators, definition);
        if (extendedEnumerators.length) {
            model.base = 'string';
            model.enum.push(...extendedEnumerators);
            model.export = 'enum';
            model.type = 'string';
            model.default = getModelDefault(definition, model);
            return model;
        }
    }

    if (definition.type === 'array' && definition.items) {
        if (definition.items.$ref) {
            const arrayItems = getType(definition.items.$ref);
            model.base = arrayItems.base;
            model.export = 'array';
            model.imports.push(...arrayItems.imports);
            model.template = arrayItems.template;
            model.type = arrayItems.type;
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
        model.base = arrayItems.base;
        model.export = 'array';
        model.imports.push(...arrayItems.imports);
        model.link = arrayItems;
        model.template = arrayItems.template;
        model.type = arrayItems.type;
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

    if (definition.type === 'object' || definition.properties) {
        if (definition.properties) {
            model.base = 'any';
            model.export = 'interface';
            model.type = 'any';
            model.default = getModelDefault(definition, model);

            const modelProperties = getModelProperties(openApi, definition, getModel, model);
            modelProperties.forEach(modelProperty => {
                model.enums.push(...modelProperty.enums);
                model.imports.push(...modelProperty.imports);
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
        const definitionConst = definition.const;
        const modelConst = typeof definitionConst === 'string' ? `"${definitionConst}"` : `${definitionConst}`;
        model.base = modelConst;
        model.export = 'const';
        model.type = modelConst;
        return model;
    }

    // If the schema has a type than it can be a basic or generic type.
    if (definition.type) {
        const definitionType = getType(definition.type, definition.format);
        model.base = definitionType.base;
        model.export = 'generic';
        model.imports.push(...definitionType.imports);
        model.isNullable = definitionType.isNullable || model.isNullable;
        model.template = definitionType.template;
        model.type = definitionType.type;
        model.default = getModelDefault(definition, model);
        return model;
    }

    return model;
};
