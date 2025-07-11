import type ts from 'typescript';

export interface Identifier {
  /**
   * Did this function add a new property to the file's `identifiers` map?
   */
  created: boolean;
  /**
   * The resolved identifier name. False means the identifier has been blacklisted.
   */
  name: string | false;
}

type NamespaceEntry = Pick<Identifier, 'name'> & {
  /**
   * Ref to the type in OpenAPI specification.
   */
  $ref: string;
};

export type Identifiers = Record<
  string,
  {
    /**
     * TypeScript enum only namespace.
     *
     * @example
     * ```ts
     * export enum Foo = {
     *   FOO = 'foo'
     * }
     * ```
     */
    enum?: Record<string, NamespaceEntry>;
    /**
     * Type namespace. Types, interfaces, and type aliases exist here.
     *
     * @example
     * ```ts
     * export type Foo = string;
     * ```
     */
    type?: Record<string, NamespaceEntry>;
    /**
     * Value namespace. Variables, functions, classes, and constants exist here.
     *
     * @example
     * ```js
     * export const foo = '';
     * ```
     */
    value?: Record<string, NamespaceEntry>;
  }
>;

export type Namespace = keyof Identifiers[keyof Identifiers];

export type FileImportResult<
  Name extends string | undefined = string | undefined,
  Alias extends string | undefined = undefined,
> = {
  asType?: boolean;
  name: Alias extends string ? Alias : Name;
};

export type NodeInfo = {
  /**
   * Is this node exported from the file?
   *
   * @default false
   */
  exported?: boolean;
  /**
   * Reference to the node object.
   */
  node: ts.TypeReferenceNode;
};
