import type { Operation } from '../../../types/client';
import type { DefinePlugin, Plugin } from '../../types';

export type UserConfig = Plugin.Name<'@hey-api/angular-resource'> & {
  /**
   * Whether to generate the resource as a class.
   * @default false
   */
  asClass?: boolean;

  classNameBuilder?: (className: string) => string;
  methodNameBuilder?: (operation: IR.OperationObject | Operation) => string;

  /**
   * Name of the generated file.
   *
   * @default 'httpResource'
   */
  output?: string;
};

export type Config = Plugin.Name<'@hey-api/angular-resource'> & {
  /**
   * Whether to generate the resource as a class.
   * @default false
   */
  asClass: boolean;

  classNameBuilder?: (className: string) => string;
  methodNameBuilder?: (operation: IR.OperationObject | Operation) => string;

  /**
   * Name of the generated file.
   *
   * @default 'httpResource'
   */
  output?: string;
};

export type HeyApiAngularResourcePlugin = DefinePlugin<UserConfig, Config>;
