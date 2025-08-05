export interface ICodegenOutput {
  /**
   * The main content of the file to output.
   *
   * A raw string representing source code.
   *
   * @example "function foo(): void {\n  // implementation\n}\n"
   */
  content: string;
  /**
   * Optional metadata or hints for the emitter, such as formatting options,
   * source maps, or language-specific flags.
   *
   * @example { format: "prettier", sourceMap: true }
   */
  meta: Record<string, unknown>;
  /**
   * Logical output path (used for writing the file).
   *
   * @example "models/user.ts"
   */
  path: string;
}
