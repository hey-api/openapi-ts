import type { Model } from '../../../client/interfaces/Model';
import { reservedWords } from '../../../utils/reservedWords';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getType } from './getType';

export const getModels = (openApi: OpenApi): Model[] => {
    const models: Model[] = [];
    if (openApi.components) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const definition = openApi.components.schemas[definitionName];
                const definitionType = getType(definitionName);
                const model = getModel(openApi, definition, true, definitionType.base.replace(reservedWords, '_$1'));
                models.push(model);
            }
        }
        for (const definitionName in openApi.components.parameters) {
            if (openApi.components.parameters.hasOwnProperty(definitionName)) {
                const definition = openApi.components.parameters[definitionName];
                const definitionType = getType(definitionName);
                const schema = definition.schema;
                if (schema) {
                    const model = getModel(openApi, schema, true, definitionType.base.replace(reservedWords, '_$1'));
                    model.description = definition.description || null;
                    model.deprecated = definition.deprecated;
                    models.push(model);
                }
            }
        }
    }
    return models;
};
