import type { Client } from '../../../types/client';
import { reservedWordsRegExp } from '../../../utils/reservedWords';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';

export const getModels = (
  openApi: OpenApi,
): Pick<Client, 'models' | 'types'> => {
  const types: Client['types'] = {};
  let models: Client['models'] = [];

  Object.entries(openApi.definitions ?? {}).forEach(
    ([definitionName, definition]) => {
      const definitionType = getType({ type: definitionName });
      const name = definitionType.base.replace(reservedWordsRegExp, '_$1');
      const meta = {
        $ref: `#/definitions/${definitionName}`,
        name,
      };
      types[name] = meta;
      const model = getModel({
        definition,
        isDefinition: true,
        meta,
        openApi,
        types,
      });
      models = [...models, model];
    },
  );

  return {
    models,
    types,
  };
};
