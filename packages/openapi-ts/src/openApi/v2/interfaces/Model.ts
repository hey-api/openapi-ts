import type { Client } from '../../../types/client';
import type { Model, ModelMeta } from '../../common/interfaces/client';
import type { OpenApi } from './OpenApi';
import type { OpenApiSchema } from './OpenApiSchema';

export type GetModelFn = (
  args: Pick<Client, 'types'> & {
    definition: OpenApiSchema;
    isDefinition?: boolean;
    meta?: ModelMeta;
    openApi: OpenApi;
  },
) => Model;
