import type { ICodegenFile } from '../files/types';

export interface ICodegenImport {
  /**
   * Optional aliasing map for imported symbols.
   *
   * Keys must be a subset of `names`, values are aliases.
   *
   * @example { User: "ImportedUser" }
   */
  aliases?: Record<string, string>;
  /**
   * Name of the default import, if any.
   *
   * @example "React"
   */
  defaultImport?: string;
  /**
   * Source file or external module from which symbols are imported.
   *
   * For internal files, this should be a ICodegenFile instance to enable
   * dynamic path computation. For external or system modules, use a string.
   *
   * @example "./models/user"
   * @example "node:path"
   */
  from: ICodegenFile | string;
  /**
   * Names of the symbols imported from the source.
   *
   * Must be non-empty unless `isNamespaceImport` is true.
   * All imported names, regardless of whether they are used as types or values.
   *
   * @example ["User", "UserDTO"]
   */
  names?: ReadonlyArray<string>;
  /**
   * If this import is a namespace import (e.g. `import * as ns from "..."`),
   * this should be the namespace alias. Set to `true` if no alias is needed.
   *
   * @example "utils"
   * @example true
   */
  namespaceImport?: boolean | string;
  /**
   * Whether the default import is type-only.
   *
   * @example true
   */
  typeDefaultImport?: boolean;
  /**
   * Subset of `names` that are imported using the `type` modifier.
   * These symbols will be emitted as type-only imports in TypeScript.
   *
   * @example ["UserDTO"]
   */
  typeNames?: ReadonlyArray<string>;
  /**
   * Whether the namespace import is type-only.
   *
   * @example true
   */
  typeNamespaceImport?: boolean;
}
