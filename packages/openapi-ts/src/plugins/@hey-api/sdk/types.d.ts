import type { IR } from '~/ir/types';
import type { DefinePlugin, Plugin } from '~/plugins';
import type { PluginClientNames, PluginValidatorNames } from '~/plugins/types';
import type { StringName } from '~/types/case';

import type { IApi } from './api';

type ValidatorValue = PluginValidatorNames | boolean;
type ValidatorResult =
  | ValidatorValue
  | {
      /**
       * Validate request data against schema before sending.
       *
       * Can be a validator plugin name or boolean (true to auto-select, false
       * to disable).
       *
       * @default false
       */
      request?:
        | ValidatorValue
        | ((operation: IR.OperationObject) => ValidatorValue);
      /**
       * Validate response data against schema before returning.
       *
       * Can be a validator plugin name or boolean (true to auto-select, false
       * to disable).
       *
       * @default false
       */
      response?:
        | ValidatorValue
        | ((operation: IR.OperationObject) => ValidatorValue);
    };

export type UserConfig = Plugin.Name<'@hey-api/sdk'> &
  Plugin.Hooks & {
    /**
     * Group operation methods into classes? When enabled, you can select which
     * classes to export with `sdk.include` and/or transform their names with
     * `sdk.classNameBuilder`.
     *
     * Note that by enabling this option, your SDKs will **NOT**
     * support {@link https://developer.mozilla.org/docs/Glossary/Tree_shaking tree-shaking}.
     * For this reason, it is disabled by default.
     *
     * @default false
     */
    asClass?: boolean;
    /**
     * Should the generated functions contain auth mechanisms? You may want to
     * disable this option if you're handling auth yourself or defining it
     * globally on the client and want to reduce the size of generated code.
     *
     * @default true
     */
    auth?: boolean;
    /**
     * Customize the generated class names. The name variable is obtained from
     * your OpenAPI specification tags or `instance` value.
     *
     * This option has no effect if `sdk.asClass` is `false`.
     */
    classNameBuilder?: StringName;
    /**
     * How should we structure your SDK? By default, we try to infer the ideal
     * structure using `operationId` keywords. If you prefer a flatter structure,
     * you can set `classStructure` to `off` to disable this behavior.
     *
     * @default 'auto'
     */
    classStructure?: 'auto' | 'off';
    /**
     * Use an internal client instance to send HTTP requests? This is useful if
     * you don't want to manually pass the client to each SDK function.
     *
     * You can customize the selected client output through its plugin. You can
     * also set `client` to `true` to automatically choose the client from your
     * defined plugins. If we can't detect a client plugin when using `true`, we
     * will default to `@hey-api/client-fetch`.
     *
     * @default true
     */
    client?: PluginClientNames | boolean;
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default true
     */
    exportFromIndex?: boolean;
    /**
     * Include only service classes with names matching regular expression
     *
     * This option has no effect if `sdk.asClass` is `false`.
     */
    include?: string;
    /**
     * Set `instance` to create an instantiable SDK. Using `true` will use the
     * default instance name; in practice, you want to define your own by passing
     * a string value.
     *
     * @default false
     */
    instance?: string | boolean;
    /**
     * Customise the name of methods within the service. By default,
     * {@link IR.OperationObject.id} is used.
     */
    methodNameBuilder?: (operation: IR.OperationObject) => string;
    // TODO: parser - rename operationId option to something like inferId?: boolean
    /**
     * Use operation ID to generate operation names?
     *
     * @default true
     */
    operationId?: boolean;
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
    responseStyle?: 'data' | 'fields';
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
    transformer?: '@hey-api/transformers' | boolean;
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
    validator?:
      | ValidatorResult
      | ((operation: IR.OperationObject) => ValidatorResult);

    // DEPRECATED OPTIONS BELOW

    /**
     * Define shape of returned value from service calls
     *
     * @deprecated
     * @default 'body'
     */
    // eslint-disable-next-line typescript-sort-keys/interface
    response?: 'body' | 'response';
  };

export type Config = Plugin.Name<'@hey-api/sdk'> &
  Plugin.Hooks & {
    /**
     * Group operation methods into classes? When enabled, you can select which
     * classes to export with `sdk.include` and/or transform their names with
     * `sdk.classNameBuilder`.
     *
     * Note that by enabling this option, your SDKs will **NOT**
     * support {@link https://developer.mozilla.org/docs/Glossary/Tree_shaking tree-shaking}.
     * For this reason, it is disabled by default.
     *
     * @default false
     */
    asClass: boolean;
    /**
     * Should the generated functions contain auth mechanisms? You may want to
     * disable this option if you're handling auth yourself or defining it
     * globally on the client and want to reduce the size of generated code.
     *
     * @default true
     */
    auth: boolean;
    /**
     * Customize the generated class names. The name variable is obtained from
     * your OpenAPI specification tags or `instance` value.
     *
     * This option has no effect if `sdk.asClass` is `false`.
     */
    classNameBuilder: StringName;
    /**
     * How should we structure your SDK? By default, we try to infer the ideal
     * structure using `operationId` keywords. If you prefer a flatter structure,
     * you can set `classStructure` to `off` to disable this behavior.
     *
     * @default 'auto'
     */
    classStructure: 'auto' | 'off';
    /**
     * Use an internal client instance to send HTTP requests? This is useful if
     * you don't want to manually pass the client to each SDK function.
     *
     * You can customize the selected client output through its plugin. You can
     * also set `client` to `true` to automatically choose the client from your
     * defined plugins. If we can't detect a client plugin when using `true`, we
     * will default to `@hey-api/client-fetch`.
     *
     * @default true
     */
    client: PluginClientNames | false;
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default true
     */
    exportFromIndex: boolean;
    /**
     * Include only service classes with names matching regular expression
     *
     * This option has no effect if `sdk.asClass` is `false`.
     */
    include: string | undefined;
    /**
     * Set `instance` to create an instantiable SDK. Using `true` will use the
     * default instance name; in practice, you want to define your own by passing
     * a string value.
     *
     * @default false
     */
    instance: string | boolean;
    /**
     * Customise the name of methods within the service. By default,
     * {@link IR.OperationObject.id} is used.
     */
    methodNameBuilder?: (operation: IR.OperationObject) => string;
    // TODO: parser - rename operationId option to something like inferId?: boolean
    /**
     * Use operation ID to generate operation names?
     *
     * @default true
     */
    operationId: boolean;
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
    responseStyle: 'data' | 'fields';
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
    transformer: '@hey-api/transformers' | false;
    /**
     * Validate request and/or response data against schema before returning.
     * This is useful if you want to ensure the request and/or response conforms
     * to a desired shape. However, validation adds runtime overhead, so it's
     * not recommended to use unless absolutely necessary.
     */
    validator: (operation: IR.OperationObject) => {
      /**
       * The validator plugin to use for request validation, or false to disable.
       *
       * @default false
       */
      request: PluginValidatorNames | false;
      /**
       * The validator plugin to use for response validation, or false to disable.
       *
       * @default false
       */
      response: PluginValidatorNames | false;
    };

    // DEPRECATED OPTIONS BELOW

    /**
     * Define shape of returned value from service calls
     *
     * @deprecated
     * @default 'body'
     */
    // eslint-disable-next-line typescript-sort-keys/interface
    response: 'body' | 'response';
  };

export type HeyApiSdkPlugin = DefinePlugin<UserConfig, Config, IApi>;
