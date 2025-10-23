import type { OpenApi as OpenApiV2 } from '~/openApi/v2/interfaces/OpenApi';
import type { OpenApi as OpenApiV3 } from '~/openApi/v3/interfaces/OpenApi';

export type OpenApi = OpenApiV2 | OpenApiV3;
