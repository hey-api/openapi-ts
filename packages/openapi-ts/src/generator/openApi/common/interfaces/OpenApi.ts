import type { OpenApi as OpenApiV2 } from '../../v2/interfaces/OpenApi';
import type { OpenApiSchema as OpenApiV2Schema } from '../../v2/interfaces/OpenApiSchema';
import type { OpenApi as OpenApiV3 } from '../../v3/interfaces/OpenApi';
import type { OpenApiSchema as OpenApiV3Schema } from '../../v3/interfaces/OpenApiSchema';

export type OpenApi = OpenApiV2 | OpenApiV3;
export type OpenApiSchema = OpenApiV2Schema | OpenApiV3Schema;
