import type { Model, ModelComposition } from '../../common/interfaces/client';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import type { getModel } from './getModel';
import { getModelProperties } from './getModelProperties';
import { getRequiredPropertiesFromComposition } from './getRequiredPropertiesFromComposition';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

export const getModelComposition = (
    openApi: OpenApi,
    definition: OpenApiSchema,
    definitions: OpenApiSchema[],
    type: 'one-of' | 'any-of' | 'all-of',
    getModel: GetModelFn
): ModelComposition => {
    const composition: ModelComposition = {
        $refs: [],
        enums: [],
        export: type,
        imports: [],
        properties: [],
    };

    const properties: Model[] = [];

    definitions
        .map(definition => getModel(openApi, definition))
        .filter(model => {
            const hasProperties = model.properties.length;
            const hasEnums = model.enums.length;
            const isObject = model.type === 'unknown';
            const isEmpty = isObject && !hasProperties && !hasEnums;
            return !isEmpty;
        })
        .forEach(model => {
            composition.imports.push(...model.imports);
            composition.enums.push(...model.enums);
            composition.properties.push(model);
        });

    if (definition.required) {
        const requiredProperties = getRequiredPropertiesFromComposition(
            openApi,
            definition.required,
            definitions,
            getModel
        );
        requiredProperties.forEach(requiredProperty => {
            composition.imports.push(...requiredProperty.imports);
            composition.enums.push(...requiredProperty.enums);
        });
        properties.push(...requiredProperties);
    }

    if (definition.properties) {
        const modelProperties = getModelProperties(openApi, definition, getModel);
        modelProperties.forEach(modelProperty => {
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
