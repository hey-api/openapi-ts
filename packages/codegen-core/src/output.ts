export interface IOutput {
  /**
   * The main content of the file to output.
   *
   * A raw string representing source code.
   *
   * @example "function foo(): void {\n  // implementation\n}\n"
   */
  content: string;
  /**
   * Logical output path (used for writing the file).
   *
   * @example "models/user.ts"
   */
  path: string;
}
