import type { Model } from '../../common/interfaces/client';
import { reservedWords } from '../../common/parser/reservedWords';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';

export const getModels = (openApi: OpenApi): Model[] => {
  let models: Model[] = [];

  Object.entries(openApi.definitions ?? {}).forEach(
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

  return models;
};
