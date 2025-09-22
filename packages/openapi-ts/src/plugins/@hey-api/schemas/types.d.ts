import type { OpenApiV2Schema, OpenApiV3Schema } from '../../../openApi';
import type { OpenApiV2_0_XTypes } from '../../../openApi/2.0.x';
import type { OpenApiV3_0_XTypes } from '../../../openApi/3.0.x';
import type { OpenApiV3_1_XTypes } from '../../../openApi/3.1.x';
import type { DefinePlugin, Plugin } from '../../types';
import type { IApi } from './api';

export type UserConfig = Plugin.Name<'@hey-api/schemas'> &
  Plugin.Hooks & {
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Customise the schema name. By default, `{{name}}Schema` is used. `name` is a
     * valid JavaScript/TypeScript identifier, e.g. if your schema name is
     * "Foo-Bar", `name` value would be "FooBar".
     *
     * @default '{{name}}Schema'
     */
    nameBuilder?:
      | string
      | ((
          name: string,
          schema:
            | OpenApiV2Schema
            | OpenApiV3Schema
            | OpenApiV2_0_XTypes['SchemaObject']
            | OpenApiV3_0_XTypes['ReferenceObject']
            | OpenApiV3_0_XTypes['SchemaObject']
            | OpenApiV3_1_XTypes['SchemaObject'],
        ) => string);
    /**
     * Choose schema type to generate. Select 'form' if you don't want
     * descriptions to reduce bundle size and you plan to use schemas
     * for form validation
     *
     * @default 'json'
     */
    type?: 'form' | 'json';
  };

export type HeyApiSchemasPlugin = DefinePlugin<UserConfig, UserConfig, IApi>;
