export interface ICodegenSymbol {
  /**
   * Optional description or doc comment.
   *
   * @example "Represents a user in the system"
   */
  description?: string;
  /**
   * Optional kind of symbol (e.g. "class", "function", "type", etc.).
   *
   * @example "class"
   */
  kind?: string;
  /**
   * Unique identifier for the symbol within its file.
   *
   * @example "UserModel"
   */
  name: string;
  /**
   * Internal representation of the symbol (e.g. AST node, IR object, raw
   * code). Used to generate output.
   */
  value?: unknown;
}
