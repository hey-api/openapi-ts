import type { ModelComposition } from '../../../client/interfaces/ModelComposition';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import type { getModel } from './getModel';

// Fix for circular dependency
export type GetModelFn = typeof getModel;

export function getModelComposition(openApi: OpenApi, definitions: OpenApiSchema[], type: 'one-of' | 'any-of' | 'all-of', getModel: GetModelFn): ModelComposition {
    const composition: ModelComposition = {
        type,
        imports: [],
        enums: [],
        properties: [],
    };

    const models = definitions.map(definition => getModel(openApi, definition));
    models
        .filter(model => {
            const hasProperties = model.properties.length;
            const hasEnums = model.enums.length;
            const isObject = model.type === 'any';
            const isEmpty = isObject && !hasProperties && !hasEnums;
            return !isEmpty;
        })
        .forEach(model => {
            composition.imports.push(...model.imports);
            composition.enums.push(...model.enums);
            composition.properties.push(model);
        });

    return composition;
}
