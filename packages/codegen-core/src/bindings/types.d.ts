export interface IBinding {
  /**
   * Optional aliasing map for named symbols.
   *
   * Keys must be a subset of `names`, values are aliases.
   *
   * @example { User: "ImportedUser" }
   */
  aliases?: Record<string, string>;
  /**
   * Name of the default binding, if any.
   *
   * @example "React"
   */
  defaultBinding?: string;
  /**
   * Source file or external module from which symbols are imported.
   *
   * @example "./models/user"
   * @example "node:path"
   */
  from: string;
  /**
   * Names of the symbols imported from the source.
   *
   * Must be non-empty unless `namespaceBinding` is true.
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
  namespaceBinding?: boolean | string;
  /**
   * Whether the default binding is type-only.
   *
   * @example true
   */
  typeDefaultBinding?: boolean;
  /**
   * Subset of `names` that are imported using the `type` modifier.
   * These symbols will be emitted as type-only imports in TypeScript.
   *
   * @example ["UserDTO"]
   */
  typeNames?: ReadonlyArray<string>;
  /**
   * Whether the namespace binding is type-only.
   *
   * @example true
   */
  typeNamespaceBinding?: boolean;
}
