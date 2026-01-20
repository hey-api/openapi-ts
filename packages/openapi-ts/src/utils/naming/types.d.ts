import type { MaybeFunc } from '@hey-api/types';

/**
 * Available casing strategies.
 */
export type Casing =
  | 'camelCase'
  | 'PascalCase'
  | 'preserve'
  | 'snake_case'
  | 'SCREAMING_SNAKE_CASE';

/**
 * Name transformer: template string or function.
 *
 * Template supports `{{name}}` variable.
 */
export type NameTransformer = MaybeFunc<(name: string) => string>;

/**
 * Full naming configuration.
 */
export interface NamingConfig {
  /**
   * Casing strategy applied after transformation.
   *
   * @deprecated Use `casing` instead.
   */
  case?: Casing;
  /**
   * Casing strategy applied after transformation.
   */
  casing?: Casing;
  /**
   * Name template or transformer function.
   *
   * Applied before `casing` transformation.
   */
  name?: NameTransformer;
}

/**
 * Name customization: shorthand or full configuration.
 */
export type NamingRule = NameTransformer | NamingConfig;
