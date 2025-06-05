export { parseV3_0_X } from './parser';
export type { OpenApiV3_0_X } from './types/spec';

import type {
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from './types/spec';

export interface OpenApiV3_0_XTypes {
  ParameterObject: ParameterObject;
  ReferenceObject: ReferenceObject;
  RequestBodyObject: RequestBodyObject;
  ResponseObject: ResponseObject;
  SchemaObject: SchemaObject;
}
