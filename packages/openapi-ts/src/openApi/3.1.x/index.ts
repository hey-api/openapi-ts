export { parseV3_1_X } from './parser';
export type { OpenApiV3_1_X } from './types/spec';

import type {
  InfoObject,
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from './types/spec';

export interface OpenApiV3_1_XTypes {
  InfoObject: InfoObject;
  ParameterObject: ParameterObject;
  ReferenceObject: ReferenceObject;
  RequestBodyObject: RequestBodyObject;
  ResponseObject: ResponseObject;
  SchemaObject: SchemaObject;
}
