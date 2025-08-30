/**
 * Arbitrary metadata passed to render functions.
 *
 * Implementors should extend this interface for their own needs.
 */
export interface ICodegenMeta {
  [key: string]: unknown;
}
