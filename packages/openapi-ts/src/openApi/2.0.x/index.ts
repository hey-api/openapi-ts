export { parseV2_0_X } from './parser';
export type { OpenApiV2_0_X } from './types/spec';

import type { InfoObject, OperationObject, SchemaObject } from './types/spec';

export interface OpenApiV2_0_XTypes {
  InfoObject: InfoObject;
  OperationObject: OperationObject;
  SchemaObject: SchemaObject;
}
