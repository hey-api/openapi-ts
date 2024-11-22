import type { PluginName } from '../../types';

export interface Config extends PluginName<'@hey-api/typescript'> {
  /**
   * Generate enum definitions?
   * @default false
   */
  enums?: 'javascript' | 'typescript' | 'typescript+namespace' | false;
  /**
   * Include only types matching regular expression.
   *
   * This option does not work with the experimental parser.
   *
   * @deprecated
   */
  include?: string;
  /**
   * Name of the generated file.
   * @default 'types'
   */
  output?: string;
  /**
   * Use your preferred naming pattern
   * @default 'preserve'
   */
  style?: 'PascalCase' | 'preserve';
  /**
   * Generate a tree of types containing all operations? It will be named
   * $OpenApiTs.
   * @default false
   *
   * @deprecated
   */
  tree?: boolean;
}
