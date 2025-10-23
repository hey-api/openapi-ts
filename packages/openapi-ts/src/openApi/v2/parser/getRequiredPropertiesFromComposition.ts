import type { Model } from '~/openApi/common/interfaces/client';
import { getRef } from '~/openApi/common/parser/getRef';

import type { Client } from '../../../types/client';
import type { GetModelFn } from '../interfaces/Model';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export const getRequiredPropertiesFromComposition = ({
  definitions,
  getModel,
  openApi,
  required,
  types,
}: {
  definitions: OpenApiSchema[];
  getModel: GetModelFn;
  openApi: OpenApi;
  required: string[];
  types: Client['types'];
}): Model[] =>
  definitions
    .reduce((properties, definition) => {
      if (definition.$ref) {
        const schema = getRef<OpenApiSchema>(openApi, definition);
        return [
          ...properties,
          ...getModel({ definition: schema, openApi, types }).properties,
        ];
      }
      return [
        ...properties,
        ...getModel({ definition, openApi, types }).properties,
      ];
    }, [] as Model[])
    .filter(
      (property) => !property.isRequired && required.includes(property.name),
    )
    .map((property) => ({
      ...property,
      isRequired: true,
    }));
