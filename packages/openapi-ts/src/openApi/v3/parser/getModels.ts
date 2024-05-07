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
      const definitionType = getType({ type: definitionName });
      const model = getModel({
        definition,
        isDefinition: true,
        meta: {
          $ref: `#/components/schemas/${definitionName}`,
          name: definitionType.base.replace(reservedWords, '_$1'),
        },
        openApi,
      });
      models = [...models, model];
    },
  );

  Object.entries(openApi.components.parameters ?? {}).forEach(
    ([definitionName, definition]) => {
      const schema = definition.schema;
      if (!schema) {
        return;
      }

      const definitionType = getType({ type: definitionName });
      const model = getModel({
        definition: schema,
        isDefinition: true,
        meta: {
          $ref: `#/components/parameters/${definitionName}`,
          /**
           * Prefix parameter names to avoid name conflicts with schemas.
           * Assuming people are mostly interested in importing schema types
           * and don't care about this name as much. It should be resolved in
           * a cleaner way, there just isn't a good deduplication strategy
           * today. This is a workaround in the meantime, hopefully reducing
           * the chance of conflicts.
           *
           * Example where this would break: schema named `ParameterFoo` and
           * parameter named `Foo` (this would transform to `ParameterFoo`)
           *
           * Note: there's a related code to this workaround in `getType()`
           * method that needs to be cleaned up when this is addressed.
           */
          name: `Parameter${definitionType.base.replace(reservedWords, '_$1')}`,
        },
        openApi,
      });
      model.deprecated = definition.deprecated;
      model.description = definition.description || null;
      models = [...models, model];
    },
  );

  return models;
};
