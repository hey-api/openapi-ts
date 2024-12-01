import type { IROperationObject } from '../../../ir/ir';
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
   * @default false
   */
  asClass?: boolean;
  /**
   * Filter endpoints to be included in the generated SDK. The provided
   * string should be a regular expression where matched results will be
   * included in the output. The input pattern this string will be tested
   * against is `{method} {path}`. For example, you can match
   * `POST /api/v1/foo` with `^POST /api/v1/foo$`.
   *
   * This option does not work with the experimental parser.
   *
   * @deprecated
   */
  filter?: string;
  /**
   * Include only service classes with names matching regular expression
   *
   * This option has no effect if `sdk.asClass` is `false`.
   */
  include?: string;
  /**
   * Customise the name of methods within the service. By default, {@link IROperationObject.id} or {@link Operation.name} is used.
   */
  methodNameBuilder?: (operation: IROperationObject | Operation) => string;
  // TODO: parser - rename operationId option to something like inferId?: boolean
  /**
   * Use operation ID to generate operation names?
   * @default true
   */
  operationId?: boolean;
  /**
   * Name of the generated file.
   * @default 'sdk'
   */
  output?: string;
  /**
   * Define shape of returned value from service calls
   * @default 'body'
   * @deprecated
   */
  response?: 'body' | 'response';
  /**
   * Customize the generated service class names. The name variable is
   * obtained from your OpenAPI specification tags.
   *
   * This option has no effect if `sdk.asClass` is `false`.
   * @default '{{name}}Service'
   */
  serviceNameBuilder?: string;
}
