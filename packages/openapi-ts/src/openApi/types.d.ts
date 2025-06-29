import type { OpenApiV2_0_X, OpenApiV2_0_XTypes } from './2.0.x';
import type { OpenApiV3_0_X, OpenApiV3_0_XTypes } from './3.0.x';
import type { OpenApiV3_1_X, OpenApiV3_1_XTypes } from './3.1.x';

export namespace OpenApi {
  export type V2_0_X = OpenApiV2_0_X;

  export type V3_0_X = OpenApiV3_0_X;

  export type V3_1_X = OpenApiV3_1_X;
}

export namespace OpenApiMetaObject {
  export type V2_0_X = OpenApiV2_0_XTypes['InfoObject'];

  export type V3_0_X = OpenApiV3_0_XTypes['InfoObject'];

  export type V3_1_X = OpenApiV3_1_XTypes['InfoObject'];
}

export namespace OpenApiOperationObject {
  export type V2_0_X = OpenApiV2_0_XTypes['OperationObject'];

  export type V3_0_X = OpenApiV3_0_XTypes['OperationObject'];

  export type V3_1_X = OpenApiV3_1_XTypes['OperationObject'];
}

export namespace OpenApiParameterObject {
  export type V3_0_X =
    | OpenApiV3_0_XTypes['ParameterObject']
    | OpenApiV3_0_XTypes['ReferenceObject'];

  export type V3_1_X =
    | OpenApiV3_1_XTypes['ParameterObject']
    | OpenApiV3_1_XTypes['ReferenceObject'];
}

export namespace OpenApiRequestBodyObject {
  export type V3_0_X =
    | OpenApiV3_0_XTypes['RequestBodyObject']
    | OpenApiV3_0_XTypes['ReferenceObject'];

  export type V3_1_X =
    | OpenApiV3_1_XTypes['RequestBodyObject']
    | OpenApiV3_1_XTypes['ReferenceObject'];
}

export namespace OpenApiResponseObject {
  export type V3_0_X =
    | OpenApiV3_0_XTypes['ResponseObject']
    | OpenApiV3_0_XTypes['ReferenceObject'];

  export type V3_1_X =
    | OpenApiV3_1_XTypes['ResponseObject']
    | OpenApiV3_1_XTypes['ReferenceObject'];
}

export namespace OpenApiSchemaObject {
  export type V2_0_X = OpenApiV2_0_XTypes['SchemaObject'];

  export type V3_0_X = OpenApiV3_0_XTypes['SchemaObject'];

  export type V3_1_X = OpenApiV3_1_XTypes['SchemaObject'];
}
