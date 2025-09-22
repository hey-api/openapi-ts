/**
 * Arbitrary metadata passed to the project's render function.
 *
 * Implementers should extend this interface for their own needs.
 */
export interface IProjectRenderMeta {
  [key: string]: unknown;
}

/**
 * Additional metadata about the symbol.
 *
 * Implementers should extend this interface for their own needs.
 */
export interface ISymbolMeta {
  [key: string]: unknown;
}
