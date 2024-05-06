import type { Model } from '../../common/interfaces/client';
import { reservedWords } from '../../common/parser/reservedWords';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';

export const getModels = (openApi: OpenApi): Model[] => {
  let models: Model[] = [];

  Object.entries(openApi.definitions ?? {}).forEach(
    ([definitionName, definition]) => {
      const definitionType = getType({ type: definitionName });
      const model = getModel({
        definition,
        isDefinition: true,
        meta: {
          $ref: `#/definitions/${definitionName}`,
          name: definitionType.base.replace(reservedWords, '_$1'),
        },
        openApi,
      });
      models = [...models, model];
    },
  );

  return models;
};
