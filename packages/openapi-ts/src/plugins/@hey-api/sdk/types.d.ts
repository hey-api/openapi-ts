import type { IR } from '../../../ir/types';
import type { Operation } from '../../../types/client';
import type { Plugin } from '../../types';

export interface Config extends Plugin.Name<'@hey-api/sdk'> {
  /**
   * Group operation methods into classes? When enabled, you can
   * select which classes to export with `sdk.include` and/or
   * transform their names with `sdk.serviceNameBuilder`.
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
   * @deprecated
   *
   * **This feature works only with the legacy parser**
   *
   * Filter endpoints to be included in the generated SDK. The provided
   * string should be a regular expression where matched results will be
   * included in the output. The input pattern this string will be tested
   * against is `{method} {path}`. For example, you can match
   * `POST /api/v1/foo` with `^POST /api/v1/foo$`.
   */
  filter?: string;
  /**
   * Include only service classes with names matching regular expression
   *
   * This option has no effect if `sdk.asClass` is `false`.
   */
  include?: string;
  /**
   * Customise the name of methods within the service. By default, {@link IR.OperationObject.id} or {@link Operation.name} is used.
   */
  methodNameBuilder?: (operation: IR.OperationObject | Operation) => string;
  // TODO: parser - rename operationId option to something like inferId?: boolean
  /**
   * Use operation ID to generate operation names?
   *
   * @default true
   */
  operationId?: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'sdk'
   */
  output?: string;
  /**
   * Define shape of returned value from service calls
   *
   * @default 'body'
   *
   * @deprecated
   */
  response?: 'body' | 'response';
  /**
   * Customize the generated service class names. The name variable is
   * obtained from your OpenAPI specification tags.
   *
   * This option has no effect if `sdk.asClass` is `false`.
   *
   * @default '{{name}}Service'
   */
  serviceNameBuilder?: string;
  /**
   * Throw an error instead of returning it in the response?
   *
   * @default false
   */
  throwOnError?: boolean;
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
   * Validate response data against schema before returning. This is useful
   * if you want to ensure the response conforms to a desired shape. However,
   * validation adds runtime overhead, so it's not recommended to use unless
   * absolutely necessary.
   *
   * Ensure you have declared the selected library as a dependency to avoid
   * errors. You can customize the selected validator output through its
   * plugin. You can also set `validator` to `true` to automatically choose
   * the validator from your defined plugins.
   *
   * @default false
   */
  validator?: 'zod' | boolean;
}
