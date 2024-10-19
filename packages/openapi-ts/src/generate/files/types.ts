import type { ModelMeta } from '../../openApi';

export type Namespace = Record<string, ModelMeta>;

export interface Namespaces {
  /**
   * Type namespace. Types, interfaces, and type aliases exist here.
   * @example
   * ```ts
   * export type Foo = string;
   * ```
   */
  type: Namespace;
  /**
   * Value namespace. Variables, functions, classes, and constants exist here.
   * @example
   * ```js
   * export const foo = '';
   * ```
   */
  value: Namespace;
}

export interface EnsureUniqueIdentifierResult {
  /**
   * Did this function add a new property to the file's `identifiers` map?
   */
  created: boolean;
  /**
   * Unique name for the resource.
   */
  name: string;
}
