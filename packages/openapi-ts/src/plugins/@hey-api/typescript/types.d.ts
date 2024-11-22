import type { PluginName } from '../../types';

export interface Config extends PluginName<'@hey-api/typescript'> {
  /**
   * By default, enums are generated as TypeScript types. In addition to that,
   * you can choose to generate them as JavaScript objects, TypeScript enums,
   * or TypeScript enums contained within namespaces.
   * @default false
   */
  enums?: 'javascript' | 'typescript' | 'typescript+namespace' | false;
  /**
   * By default, inline enums (enums not defined as reusable components in
   * the input file) are generated as inlined union types. You can set
   * `exportInlineEnums` to `true` to treat inline enums as reusable components.
   * When `true`, the exported enums will follow the style defined in `enums`.
   *
   * This option works only with the experimental parser.
   *
   * @default false
   */
  exportInlineEnums?: boolean;
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
