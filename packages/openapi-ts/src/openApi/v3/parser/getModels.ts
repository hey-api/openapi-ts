import type { Client } from '../../../types/client';
import { getParametersMeta, getSchemasMeta } from '../../../utils/meta';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getParameterSchema } from './parameter';

export const getModels = (
  openApi: OpenApi,
): Pick<Client, 'models' | 'types'> => {
  const types: Client['types'] = {};
  let models: Client['models'] = [];

  if (!openApi.components) {
    return {
      models,
      types,
    };
  }

  Object.entries(openApi.components.schemas ?? {}).forEach(
    ([definitionName, definition]) => {
      const meta = getSchemasMeta(definitionName);
      types[meta.name] = meta;
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

  Object.entries(openApi.components.parameters ?? {}).forEach(
    ([definitionName, definition]) => {
      const schema = getParameterSchema(definition);
      if (!schema) {
        return;
      }

      const meta = getParametersMeta(definitionName);
      types[meta.name] = meta;
      const model = getModel({
        definition: schema,
        isDefinition: true,
        meta,
        openApi,
        types,
      });
      model.deprecated = definition.deprecated;
      model.description = definition.description || null;
      models = [...models, model];
    },
  );

  return {
    models,
    types,
  };
};
