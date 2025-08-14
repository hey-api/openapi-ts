import type { Operation } from '../../../types/client';
import type { DefinePlugin, Plugin } from '../../types';

export type AngularHttpResourceOptions = {
  /**
   * Whether to generate the resource as a class.
   * @default false
   */
  asClass?: boolean;

  /**
   * Builds the class name for the generated resource.
   * By default, the class name is suffixed with "Resources".
   */
  classNameBuilder?: (className: string) => string;

  /**
   * Wether or not to create http resource APIs.
   */
  enabled: boolean;

  /**
   * Builds the method name for the generated resource.
   * By default, the operation id is used, if `asClass` is false, the method is also suffixed with "Resource".
   */
  methodNameBuilder?: (operation: IR.OperationObject | Operation) => string;
};

export type AngularHttpRequestOptions = {
  /**
   * Whether to generate the resource as a class.
   * @default false
   */
  asClass?: boolean;

  /**
   * Builds the class name for the generated resource.
   * By default, the class name is suffixed with "Resources".
   */
  classNameBuilder?: (className: string) => string;

  /**
   * Builds the method name for the generated resource.
   * By default, the operation id is used, if `asClass` is false, the method is also suffixed with "Resource".
   */
  methodNameBuilder?: (operation: IR.OperationObject | Operation) => string;
};

export type UserConfig = Plugin.Name<'@angular/common'> & {
  /**
   * Options for generating HTTP Request instances.
   */
  httpRequest?: AngularHttpRequestOptions;

  /**
   * Options for generating HTTP resource APIs.
   */
  httpResource?: AngularHttpResourceOptions;
};

export type AngularCommonPlugin = DefinePlugin<UserConfig, UserConfig>;
