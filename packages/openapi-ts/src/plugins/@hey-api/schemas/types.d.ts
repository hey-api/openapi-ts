import type { OpenApiV2Schema, OpenApiV3Schema } from '../../../openApi';
import type { SchemaObject as OpenApiV2_0_XSchemaObject } from '../../../openApi/2.0.x/types/spec';
import type {
  ReferenceObject as OpenApiV3_0_XReferenceObject,
  SchemaObject as OpenApiV3_0_XSchemaObject,
} from '../../../openApi/3.0.x/types/spec';
import type { SchemaObject as OpenApiV3_1_XSchemaObject } from '../../../openApi/3.1.x/types/spec';
import type { Plugin } from '../../types';

export interface Config extends Plugin.Name<'@hey-api/schemas'> {
  /**
   * Customise the schema name. By default, `{{name}}Schema` is used. `name` is a
   * valid JavaScript/TypeScript identifier, e.g. if your schema name is
   * "Foo-Bar", `name` value would be "FooBar".
   */
  nameBuilder?: (
    name: string,
    schema:
      | OpenApiV2Schema
      | OpenApiV3Schema
      | OpenApiV2_0_XSchemaObject
      | OpenApiV3_0_XReferenceObject
      | OpenApiV3_0_XSchemaObject
      | OpenApiV3_1_XSchemaObject,
  ) => string;
  /**
   * Name of the generated file.
   * @default 'schemas'
   */
  output?: string;
  /**
   * Choose schema type to generate. Select 'form' if you don't want
   * descriptions to reduce bundle size and you plan to use schemas
   * for form validation
   * @default 'json'
   */
  type?: 'form' | 'json';
}
