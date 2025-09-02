import type { ICodegenImport } from '../imports/types';
import type { ICodegenProject } from '../project/types';
import type { ICodegenRenderer } from '../renderers/types';
import type {
  ICodegenSymbolIn,
  ICodegenSymbolOut,
  SelectorMethods,
} from '../symbols/types';

export interface ICodegenFile extends SelectorMethods {
  /**
   * Adds an export to this file.
   *
   * This is also known as a re-export.
   *
   * @param exp The export to add
   */
  addExport(exp: ICodegenImport): void;
  /**
   * Adds an import to this file.
   *
   * @param imp The import to add
   */
  addImport(imp: ICodegenImport): void;
  /**
   * Adds a symbol defined by this file.
   *
   * @param symbol The symbol to add
   */
  addSymbol(symbol: ICodegenSymbolIn): ICodegenSymbolOut;
  /**
   * Ensures a symbol for the given selector exists, so it can be
   * safely used.
   *
   * @param symbol The symbol to find. The required selector is used
   *  to match a symbol. If there's no match, we create a headless
   *  instance with the provided fields.
   * @returns The symbol if it exists, headless instance otherwise.
   */
  ensureSymbol(
    symbol: Partial<ICodegenSymbolIn> &
      Pick<Required<ICodegenSymbolIn>, 'selector'>,
  ): ICodegenSymbolOut;
  /**
   * Symbols exported from other files.
   **/
  exports: ReadonlyArray<ICodegenImport>;
  /**
   * Returns all symbols used in this file (declared + imported).
   *
   * @returns List of all symbols used in this file
   */
  getAllSymbols(): ReadonlyArray<ICodegenSymbolOut>;
  /**
   * Finds a symbol by symbol ID.
   *
   * @param id Symbol ID
   * @returns The symbol if it exists, undefined otherwise.
   */
  getSymbolById(id: number): ICodegenSymbolOut | undefined;
  /**
   * Checks if this file contains any content.
   *
   * This is used to determine whether we want to process the file further.
   * By default, we consider only symbols and exports as content.
   *
   * @returns True if the file contains content
   */
  hasContent(): boolean;
  /**
   * Checks if this file defines a symbol with the given name.
   *
   * @param id Symbol ID to check
   * @returns True if the symbol is defined by this file
   */
  hasSymbol(id: number): boolean;
  /**
   * Symbols imported from other files.
   **/
  imports: ReadonlyArray<ICodegenImport>;
  /**
   * Optional metadata about the file.
   **/
  meta: {
    /**
     * Optional file extension.
     *
     * @example ".ts"
     */
    extension?: '.ts' | (string & {});
    /**
     * Optional logical module or package name.
     *
     * @example "models.user"
     */
    moduleName?: string;
    /**
     * Optional path transformer.
     *
     * @param path Original file path passed to the constructor.
     */
    path?: ((path: string) => string) | string;
    /**
     * Renderer ID.
     *
     * @example "typescript"
     */
    renderer?: ICodegenRenderer['id'];
  };
  /**
   * Partially updates a symbol defined by this file.
   *
   * @param symbol The symbol to patch.
   * @returns The patched symbol.
   */
  patchSymbol(
    id: number,
    symbol: Partial<ICodegenSymbolOut>,
  ): ICodegenSymbolOut;
  /**
   * Logical output path (used for writing the file).
   *
   * @example "models/user.ts"
   */
  path: string;
  /**
   * Parent project this file belongs to.
   */
  project: ICodegenProject;
  /**
   * Returns a relative path to this file from another file.
   *
   * @param file The file from which we want the relative path to this file.
   * @example "./this-file.ts"
   */
  relativePathFromFile(file: Pick<ICodegenFile, 'path'>): string;
  /**
   * Returns a relative path to file from this file.
   *
   * @param file The file to which we want the relative path.
   * @example "./another-file.ts"
   */
  relativePathToFile(file: Pick<ICodegenFile, 'path'>): string;
  /**
   * Top-level symbols declared in this file.
   **/
  symbols: ReadonlyArray<ICodegenSymbolOut>;
}
