import type { OpenApi as OpenApiV2 } from '../../v2/interfaces/OpenApi';
import type { OpenApi as OpenApiV3 } from '../../v3/interfaces/OpenApi';

export type OpenApi = OpenApiV2 | OpenApiV3;
