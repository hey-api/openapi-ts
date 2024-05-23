import type { Client } from '../../../types/client';
import { getConfig } from '../../../utils/config';
import { reservedWords } from '../../common/parser/reservedWords';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import { getModel } from './getModel';
import { getParameterSchema } from './parameter';

export const getModels = (
  openApi: OpenApi,
): Pick<Client, 'models' | 'types'> => {
  const config = getConfig();

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
      const definitionType = getType({ type: definitionName });
      const name = definitionType.base.replace(reservedWords, '_$1');
      const meta = {
        $ref: `#/components/schemas/${definitionName}`,
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

  Object.entries(openApi.components.parameters ?? {}).forEach(
    ([definitionName, definition]) => {
      const schema = getParameterSchema(definition);
      if (!schema) {
        if (config.debug) {
          console.warn('Skipping generating parameter:', definitionName);
        }
        return;
      }

      const definitionType = getType({ type: definitionName });
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
      const name = `Parameter${definitionType.base.replace(reservedWords, '_$1')}`;
      const meta = {
        $ref: `#/components/parameters/${definitionName}`,
        name,
      };
      types[name] = meta;
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
