import type { Model } from '../../../client/interfaces/Model';
import type { ModelComposition } from '../../../client/interfaces/ModelComposition';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import type { getModel } from './getModel';
import { getModelProperties } from './getModelProperties';
import { getRequiredPropertiesFromComposition } from './getRequiredPropertiesFromComposition';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

type Composition = {
    definitions: OpenApiSchema[];
    type: ModelComposition['export'];
};

export const findModelComposition = (definition: OpenApiSchema): Composition | undefined => {
    const compositions: ReadonlyArray<{
        definitions: Composition['definitions'] | undefined;
        type: Composition['type'];
    }> = [
        {
            definitions: definition.allOf,
            type: 'all-of',
        },
        {
            definitions: definition.anyOf,
            type: 'any-of',
        },
        {
            definitions: definition.oneOf,
            type: 'one-of',
        },
    ];
    return compositions.find(composition => composition.definitions?.length) as ReturnType<typeof findModelComposition>;
};

export const getModelComposition = ({
    definition,
    definitions,
    getModel,
    model,
    openApi,
    type,
}: Composition & {
    definition: OpenApiSchema;
    getModel: GetModelFn;
    model: Model;
    openApi: OpenApi;
}): ModelComposition => {
    const composition: ModelComposition = {
        enums: model.enums,
        export: type,
        imports: model.imports,
        properties: model.properties,
    };

    const properties: Model[] = [];

    definitions
        .map(def => getModel(openApi, def, undefined, undefined, definition))
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
            name: 'properties',
            export: 'interface',
            type: 'any',
            base: 'any',
            template: null,
            link: null,
            description: '',
            isDefinition: false,
            isReadOnly: false,
            isNullable: false,
            isRequired: false,
            imports: [],
            enum: [],
            enums: [],
            properties,
        });
    }

    return composition;
};
