import type { DefinePlugin, OperationsStrategy, Plugin } from '@hey-api/shared';

import type { PluginClientNames } from '../../../plugins/types';
// import type { PluginClientNames, PluginValidatorNames } from '../../../plugins/types';
import type { ExamplesConfig, UserExamplesConfig } from './examples';
import type { OperationsConfig, UserOperationsConfig } from './operations';

export type UserConfig = Plugin.Name<'@hey-api/python-sdk'> &
  Plugin.Hooks &
  Plugin.UserComments &
  Plugin.UserExports & {
    /**
     * Should the generated functions contain auth mechanisms? You may want to
     * disable this option if you're handling auth yourself or defining it
     * globally on the client and want to reduce the size of generated code.
     *
     * @default true
     */
    // auth?: boolean;
    /**
     * Use an internal client instance to send HTTP requests? This is useful if
     * you don't want to manually pass the client to each SDK function.
     *
     * You can customize the selected client output through its plugin. You can
     * also set `client` to `true` to automatically choose the client from your
     * defined plugins. If we can't detect a client plugin when using `true`, we
     * will default to `@hey-api/client-httpx`.
     *
     * @default true
     */
    client?: PluginClientNames | boolean;
    /**
     * Generate code examples for SDK operations and attach them to the
     * input source (e.g. via `x-codeSamples`).
     *
     * Set to `false` to disable example generation entirely, or provide an
     * object for fine-grained control over the output and post-processing.
     *
     * @default false
     */
    examples?: boolean | UserExamplesConfig;
    /**
     * Define the structure of generated SDK operations.
     *
     * String shorthand:
     * - `'byTags'` – one container per operation tag
     * - `'single'` – all operations in a single container
     * - custom function for full control
     *
     * Use the object form for advanced configuration.
     *
     * @default 'single'
     */
    operations?: Exclude<OperationsStrategy, 'flat'> | UserOperationsConfig;
    /**
     * Define how request parameters are structured in generated SDK methods.
     *
     * - `'flat'` merges parameters into a single object.
     * - `'grouped'` separates parameters by transport layer.
     *
     * Use `'flat'` for simpler calls or `'grouped'` for stricter typing and code clarity.
     *
     * @default 'grouped'
     */
    paramsStructure?: 'flat' | 'grouped';
    /**
     * **This feature works only with the Fetch client**
     *
     * Should we return only data or multiple fields (data, error, response, etc.)?
     *
     * @default 'fields'
     */
    // responseStyle?: 'data' | 'fields';
    /**
     * Transform response data before returning. This is useful if you want to
     * convert for example ISO strings into Date objects. However, transformation
     * adds runtime overhead, so it's not recommended to use unless necessary.
     *
     * You can customize the selected transformer output through its plugin. You
     * can also set `transformer` to `true` to automatically choose the
     * transformer from your defined plugins.
     *
     * @default false
     */
    // transformer?: PluginTransformerNames | boolean;
    /**
     * Validate request and/or response data against schema before returning.
     * This is useful if you want to ensure the request and/or response conforms
     * to a desired shape. However, validation adds runtime overhead, so it's
     * not recommended to use unless absolutely necessary.
     *
     * You can customize the validator output through its plugin. You can also
     * set `validator` to `true` to automatically choose the validator from your
     * defined plugins.
     *
     * You can enable/disable validation for requests and responses separately
     * by setting `validator` to an object `{ request, response }`.
     *
     * Ensure you have declared the selected library as a dependency to avoid
     * errors.
     *
     * @default false
     */
    // validator?:
    //   | PluginValidatorNames
    //   | boolean
    //   | {
    //       /**
    //        * Validate request data against schema before sending.
    //        *
    //        * Can be a validator plugin name or boolean (true to auto-select, false
    //        * to disable).
    //        *
    //        * @default false
    //        */
    //       request?: PluginValidatorNames | boolean;
    //       /**
    //        * Validate response data against schema before returning.
    //        *
    //        * Can be a validator plugin name or boolean (true to auto-select, false
    //        * to disable).
    //        *
    //        * @default false
    //        */
    //       response?: PluginValidatorNames | boolean;
    //     };
  };

export type Config = Plugin.Name<'@hey-api/python-sdk'> &
  Plugin.Hooks &
  Plugin.Comments &
  Plugin.Exports & {
    /**
     * Should the generated functions contain auth mechanisms? You may want to
     * disable this option if you're handling auth yourself or defining it
     * globally on the client and want to reduce the size of generated code.
     *
     * @default true
     */
    // auth: boolean;
    /**
     * Use an internal client instance to send HTTP requests? This is useful if
     * you don't want to manually pass the client to each SDK function.
     *
     * You can customize the selected client output through its plugin. You can
     * also set `client` to `true` to automatically choose the client from your
     * defined plugins. If we can't detect a client plugin when using `true`, we
     * will default to `@hey-api/client-httpx`.
     *
     * @default true
     */
    client: PluginClientNames | false;
    /**
     * Configuration for generating SDK code examples.
     */
    examples: ExamplesConfig;
    /**
     * Define the structure of generated SDK operations.
     */
    operations: OperationsConfig;
    /**
     * Define how request parameters are structured in generated SDK methods.
     *
     * - `'flat'` merges parameters into a single object.
     * - `'grouped'` separates parameters by transport layer.
     *
     * Use `'flat'` for simpler calls or `'grouped'` for stricter typing and code clarity.
     *
     * @default 'grouped'
     */
    paramsStructure: 'flat' | 'grouped';
    /**
     * **This feature works only with the Fetch client**
     *
     * Should we return only data or multiple fields (data, error, response, etc.)?
     *
     * @default 'fields'
     */
    // responseStyle: 'data' | 'fields';
    /**
     * Transform response data before returning. This is useful if you want to
     * convert for example ISO strings into Date objects. However, transformation
     * adds runtime overhead, so it's not recommended to use unless necessary.
     *
     * You can customize the selected transformer output through its plugin. You
     * can also set `transformer` to `true` to automatically choose the
     * transformer from your defined plugins.
     *
     * @default false
     */
    // transformer: PluginTransformerNames | false;
    /**
     * Validate request and/or response data against schema before returning.
     * This is useful if you want to ensure the request and/or response conforms
     * to a desired shape. However, validation adds runtime overhead, so it's
     * not recommended to use unless absolutely necessary.
     */
    // validator: {
    //   /**
    //    * The validator plugin to use for request validation, or false to disable.
    //    *
    //    * @default false
    //    */
    //   request: PluginValidatorNames | false;
    //   /**
    //    * The validator plugin to use for response validation, or false to disable.
    //    *
    //    * @default false
    //    */
    //   response: PluginValidatorNames | false;
    // };
  };

export type HeyApiSdkPlugin = DefinePlugin<UserConfig, Config>;
