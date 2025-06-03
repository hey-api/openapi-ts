import type { OpenApiV2_0_X } from './2.0.x';
import type { SchemaObject as OpenApiV2SchemaObject } from './2.0.x/types/spec';
import type { OpenApiV3_0_X } from './3.0.x';
import type { SchemaObject as OpenApiV3SchemaObject } from './3.0.x/types/spec';
import type { OpenApiV3_1_X } from './3.1.x';
import type { SchemaObject as OpenApiV3_1SchemaObject } from './3.1.x/types/spec';

export namespace OpenApi {
  export type V2_0_X = OpenApiV2_0_X;

  export type V3_0_X = OpenApiV3_0_X;

  export type V3_1_X = OpenApiV3_1_X;
}

export namespace OpenApiSchemaObject {
  export type V2_0_X = OpenApiV2SchemaObject;

  export type V3_0_X = OpenApiV3SchemaObject;

  export type V3_1_X = OpenApiV3_1SchemaObject;
}
