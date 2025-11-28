export interface Rules {
  /** Whether two exported names may collide. */
  allowExportNameShadowing: boolean;
  /** Whether a local symbol can shadow another local name without error. */
  allowLocalNameShadowing: boolean;
  /** Whether the language requires file-scoped name uniqueness. */
  fileScopedNamesMustBeUnique: boolean;
  /** Whether `import { X } from "mod"` introduces a local binding `X`. */
  importCreatesLocalBinding: boolean;
  /** Whether `export { X } from "mod"` introduces a local binding `X`. */
  reexportCreatesLocalBinding: boolean;
  /** Whether the language distinguishes type-only imports. */
  supportsTypeImports: boolean;
}
