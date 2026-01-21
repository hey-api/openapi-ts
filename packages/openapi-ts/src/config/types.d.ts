import type { MaybeArray } from '@hey-api/types';

import type { Plugin } from '~/plugins';
import type { PluginConfigMap } from '~/plugins/config';
import type { PluginNames } from '~/plugins/types';
import type { Input, UserInput, Watch } from '~/types/input';
import type { Logs } from '~/types/logs';
import type { Parser, UserParser } from '~/types/parser';

import type { Output, UserOutput } from './output';

export interface UserConfig {
  /**
   * Path to the config file. Set this value if you don't use the default
   * config file name, or it's not located in the project root.
   */
  configFile?: string;
  /**
   * Skip writing files to disk?
   *
   * @default false
   */
  dryRun?: boolean;
  /**
   * Path to the OpenAPI specification. This can be:
   *   - path
   *   - URL
   *   - API registry shorthand
   *
   * Both JSON and YAML file formats are supported. You can also pass the parsed
   * object directly if you're fetching the file yourself.
   *
   * Alternatively, you can define a configuration object with more options.
   *
   * If you define an array, we will generate a single output from multiple
   * inputs. If you define an array of outputs with the same length, we will
   * generate multiple outputs, one for each input.
   */
  input: MaybeArray<UserInput | Required<UserInput>['path']>;
  /**
   * Show an interactive error reporting tool when the program crashes? You
   * generally want to keep this disabled (default).
   *
   * @default false
   */
  interactive?: boolean;
  /**
   * The relative location of the logs folder.
   *
   * @default process.cwd()
   */
  logs?: string | Logs;
  /**
   * Path to the output folder.
   *
   * If you define an array of outputs with the same length as inputs, we will
   * generate multiple outputs, one for each input.
   */
  output: MaybeArray<string | UserOutput>;
  /**
   * Customize how the input is parsed and transformed before it's passed to
   * plugins.
   */
  parser?: UserParser;
  /**
   * Plugins generate artifacts from `input`. By default, we generate SDK
   * functions and TypeScript interfaces. If you manually define `plugins`,
   * you need to include the default plugins if you wish to use them.
   *
   * @default ['@hey-api/typescript', '@hey-api/sdk']
   */
  plugins?: ReadonlyArray<
    | PluginNames
    | {
        [K in PluginNames]: PluginConfigMap[K]['config'] & {
          name: K;
        };
      }[PluginNames]
  >;
  /**
   * @deprecated use `input.watch` instead
   */
  watch?: boolean | number | Watch;
}

export type Config = Omit<
  Required<UserConfig>,
  'input' | 'logs' | 'output' | 'parser' | 'plugins' | 'watch'
> & {
  /**
   * Path to the input specification.
   */
  input: ReadonlyArray<Input>;
  logs: Logs;
  /**
   * Path to the output folder.
   */
  output: Output;
  /**
   * Customize how the input is parsed and transformed before it's passed to
   * plugins.
   */
  parser: Parser;
  pluginOrder: ReadonlyArray<keyof PluginConfigMap>;
  plugins: {
    [K in PluginNames]?: Plugin.Config<PluginConfigMap[K]>;
  };
};
