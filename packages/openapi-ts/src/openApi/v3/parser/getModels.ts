import type { Model } from '../../common/interfaces/client';
import { reservedWords } from '../../common/parser/reservedWords';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';

export const getModels = (openApi: OpenApi): Model[] => {
  if (!openApi.components) {
    return [];
  }

  let models: Model[] = [];

  Object.entries(openApi.components.schemas ?? {}).forEach(
    ([definitionName, definition]) => {
      const definitionType = getType(definitionName);
      const model = getModel(
        openApi,
        definition,
        true,
        definitionType.base.replace(reservedWords, '_$1'),
      );
      models = [...models, model];
    },
  );

  Object.entries(openApi.components.parameters ?? {}).forEach(
    ([definitionName, definition]) => {
      const schema = definition.schema;
      if (!schema) {
        return;
      }

      const definitionType = getType(definitionName);
      const model = getModel(
        openApi,
        schema,
        true,
        // prefix parameter names to avoid conflicts, assuming people are mostly
        // interested in importing schema types and don't care about this naming
        `Parameter${definitionType.base.replace(reservedWords, '_$1')}`,
      );
      model.deprecated = definition.deprecated;
      model.description = definition.description || null;
      models = [...models, model];
    },
  );

  return models;
};
