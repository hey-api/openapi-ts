import type { IROperationObject } from '../../../ir/ir';
import type { Operation } from '../../../types/client';
import type { PluginName } from '../../types';

export interface Config extends PluginName<'@hey-api/services'> {
  /**
   * Group operation methods into service classes? When enabled, you can
   * select which classes to export with `services.include` and/or
   * transform their names with `services.name`.
   *
   * Note that by enabling this option, your services will **NOT**
   * support {@link https://developer.mozilla.org/docs/Glossary/Tree_shaking tree-shaking}.
   * For this reason, it is disabled by default.
   * @default false
   */
  asClass?: boolean;
  /**
   * Filter endpoints to be included in the generated services.
   * The provided string should be a regular expression where matched
   * results will be included in the output. The input pattern this
   * string will be tested against is `{method} {path}`. For example,
   * you can match `POST /api/v1/foo` with `^POST /api/v1/foo$`.
   */
  filter?: string;
  /**
   * Include only service classes with names matching regular expression
   *
   * This option has no effect if `services.asClass` is `false`.
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
   * @default 'services'
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
   * This option has no effect if `services.asClass` is `false`.
   * @default '{{name}}Service'
   */
  serviceNameBuilder?: string;
}
