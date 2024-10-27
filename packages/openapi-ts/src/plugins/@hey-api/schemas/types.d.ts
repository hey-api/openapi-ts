import type { OpenApiV2Schema, OpenApiV3Schema } from '../../../openApi';
import type { SchemaObject as OpenApiV3_1_0SchemaObject } from '../../../openApi/3.1.0/types/spec';
import type { PluginName } from '../../types';

export interface Config extends PluginName<'@hey-api/schemas'> {
  /**
   * Customise the schema name. By default, `{{name}}Schema` is used. `name` is a
   * valid JavaScript/TypeScript identifier, e.g. if your schema name is
   * "Foo-Bar", `name` value would be "FooBar".
   */
  nameBuilder?: (
    name: string,
    schema: OpenApiV2Schema | OpenApiV3Schema | OpenApiV3_1_0SchemaObject,
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
