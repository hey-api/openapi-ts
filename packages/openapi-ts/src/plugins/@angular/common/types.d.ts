import type { StringName } from '../../../types/case';
import type { DefinePlugin, Plugin } from '../../types';
import type { IApi } from './api';

export type UserConfig = Plugin.Name<'@angular/common'> & {
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Options for generating HTTP Request instances.
   *
   * @default true
   */
  httpRequests?:
    | boolean
    | {
        /**
         * Whether to generate the resource as a class.
         *
         * @default false
         */
        asClass?: boolean;
        /**
         * Builds the class name for the generated resource.
         * By default, the class name is suffixed with "Resources".
         */
        classNameBuilder?: StringName;
        /**
         * Whether or not to create HTTP Request instances.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Builds the method name for the generated resource.
         *
         * By default, the operation id is used, if `asClass` is false, the method is also suffixed with "Resource".
         */
        methodNameBuilder?: (operation: IR.OperationObject) => string;
      };
  /**
   * Options for generating HTTP resource APIs.
   *
   * @default true
   */
  httpResources?:
    | boolean
    | {
        /**
         * Whether to generate the resource as a class.
         * @default false
         */
        asClass?: boolean;
        /**
         * Builds the class name for the generated resource.
         * By default, the class name is suffixed with "Resources".
         */
        classNameBuilder?: StringName;
        /**
         * Whether or not to create HTTP resource APIs.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Builds the method name for the generated resource.
         *
         * By default, the operation id is used, if `asClass` is false, the method is also suffixed with "Resource".
         */
        methodNameBuilder?: (operation: IR.OperationObject) => string;
      };
  /**
   * Name of the generated file.
   *
   * @default '@angular/common'
   */
  output?: string;
};

export type Config = Plugin.Name<'@angular/common'> & {
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex: boolean;
  /**
   * Options for generating HTTP Request instances.
   */
  httpRequests: {
    /**
     * Whether to generate the resource as a class.
     *
     * @default false
     */
    asClass: boolean;
    /**
     * Builds the class name for the generated resource.
     * By default, the class name is suffixed with "Resources".
     */
    classNameBuilder: StringName;
    /**
     * Whether or not to create HTTP Request instances.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Builds the method name for the generated resource.
     * By default, the operation id is used, if `asClass` is false, the method is also suffixed with "Resource".
     */
    methodNameBuilder: (operation: IR.OperationObject) => string;
  };
  /**
   * Options for generating HTTP resource APIs.
   */
  httpResources: {
    /**
     * Whether to generate the resource as a class.
     *
     * @default false
     */
    asClass: boolean;
    /**
     * Builds the class name for the generated resource.
     * By default, the class name is suffixed with "Resources".
     */
    classNameBuilder: StringName;
    /**
     * Whether or not to create HTTP resource APIs.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Builds the method name for the generated resource.
     * By default, the operation id is used, if `asClass` is false, the method is also suffixed with "Resource".
     */
    methodNameBuilder: (operation: IR.OperationObject) => string;
  };
  /**
   * Name of the generated file.
   *
   * @default '@angular/common'
   */
  output: string;
};

export type AngularCommonPlugin = DefinePlugin<UserConfig, Config, IApi>;
