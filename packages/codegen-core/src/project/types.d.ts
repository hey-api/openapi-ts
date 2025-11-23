import type { IProjectRenderMeta } from '../extensions';
import type { IFileOut, IFileRegistry } from '../files/types';
import type { IOutput } from '../output';
import type { IRenderer } from '../renderer/types';
import type { ISymbolRegistry } from '../symbols/types';

/**
 * Represents a code generation project consisting of multiple codegen files.
 * Manages imports, symbols, and output generation across the project.
 */
export interface IProject {
  /**
   * The default file to assign symbols without a specific file selector.
   *
   * @default 'main'
   */
  readonly defaultFileName?: string;
  /**
   * Optional function to transform file names before they are used.
   *
   * @param name The original file name.
   * @returns The transformed file name.
   */
  readonly fileName?: (name: string) => string;
  /**
   * Centralized file registry for the project.
   */
  readonly files: IFileRegistry;
  /**
   * Produces output representations for all files in the project.
   *
   * @param meta Arbitrary metadata.
   * @returns Array of outputs ready for writing or further processing.
   * @example
   * project.render().forEach(output => writeFile(output));
   */
  render(meta?: IProjectRenderMeta): ReadonlyArray<IOutput>;
  /**
   * Map of available renderers by file extension.
   *
   * @example
   * {
   *   ".ts": tsRenderer,
   *   ".js": jsRenderer,
   * }
   */
  readonly renderers: Record<string, IRenderer>;
  /**
   * The absolute path to the root folder of the project.
   */
  readonly root: string;
  /**
   * Retrieves files that include symbol ID. The first file is the one
   * where the symbol is declared, the rest are files that re-export it.
   *
   * @param symbolId The symbol ID to find.
   * @returns An array of files containing the symbol.
   * @example
   * const files = project.symbolIdToFiles(31);
   * for (const file of files) {
   *   console.log(file.path);
   * }
   */
  symbolIdToFiles(symbolId: number): ReadonlyArray<IFileOut>;
  /**
   * Centralized symbol registry for the project.
   */
  readonly symbols: ISymbolRegistry;
}
