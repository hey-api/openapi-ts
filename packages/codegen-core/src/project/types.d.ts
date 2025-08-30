import type { ICodegenFile } from '../files/types';
import type { ICodegenImport } from '../imports/types';
import type { ICodegenMeta } from '../meta/types';
import type { ICodegenOutput } from '../output/types';
import type { ICodegenRenderer } from '../renderers/types';
import type { ICodegenSymbol } from '../symbols/types';

/**
 * Represents a code generation project consisting of multiple codegen files.
 * Manages imports, symbols, and output generation across the project.
 */
export interface ICodegenProject {
  /**
   * Adds an export declaration to a specific file, creating the file if it doesn't exist.
   *
   * @param fileOrPath - File instance or file path where to add the export.
   * @param imp - The export declaration to add.
   * @example
   * project.addExportToFile("models/user.ts", { from: "lib", names: ["User"] });
   */
  addExportToFile(fileOrPath: ICodegenFile | string, imp: ICodegenImport): void;
  /**
   * Adds an import declaration to a specific file, creating the file if it doesn't exist.
   *
   * @param fileOrPath - File instance or file path where to add the import.
   * @param imp - The import declaration to add.
   * @example
   * project.addImportToFile("models/user.ts", { from: "lib", names: ["User"] });
   */
  addImportToFile(fileOrPath: ICodegenFile | string, imp: ICodegenImport): void;
  /**
   * Adds a symbol to a specific file, creating the file if it doesn't exist.
   *
   * @param fileOrPath - File instance or file path where to add the symbol.
   * @param symbol - The symbol to add.
   * @example
   * project.addSymbolToFile("models/user.ts", { name: "User", value: tsNode });
   */
  addSymbolToFile(
    fileOrPath: ICodegenFile | string,
    symbol: ICodegenSymbol,
  ): void;
  /**
   * Creates a new codegen file with optional metadata and adds it to the project.
   *
   * If a file with the same path already exists, it is returned instead.
   *
   * @param path - The logical output path for the file (e.g. "models/user.ts").
   * @param meta - Optional renderer and metadata to attach to the file (e.g. { isInternal: true }).
   * @returns The newly created file instance.
   * @example
   * const file = project.createFile("models/user.ts", { isInternal: true });
   */
  createFile(
    path: string,
    meta?: ICodegenFile['meta'] & { renderer?: ICodegenRenderer },
  ): ICodegenFile;
  /**
   * Ensures a codegen file exists and returns it.
   *
   * If a file does not exist yet, it is created with minimal information.
   * Later, it is expected `createFile()` will be called which will fill in
   * the missing information such as optional metadata.
   *
   * @param fileOrPath - The logical output path for the file or the file itself.
   * @returns The file instance.
   * @example
   * const file = project.ensureFile("models/user.ts");
   */
  ensureFile(fileOrPath: ICodegenFile | string): ICodegenFile;
  /**
   * Returns all files in the project in insertion order.
   *
   * @example
   * project.files.forEach(file => console.log(file.path));
   */
  readonly files: ReadonlyArray<ICodegenFile>;
  /**
   * Returns all symbols declared or imported across all files.
   *
   * @returns Flattened list of all codegen symbols.
   * @example
   * project.getAllSymbols().filter(s => s.name === "User");
   */
  getAllSymbols(): ReadonlyArray<ICodegenSymbol>;
  /**
   * Retrieves a file by its logical output path.
   *
   * @param path - The file path to find.
   * @returns The file if found, or undefined otherwise.
   * @example
   * const file = project.getFileByPath("models/user.ts");
   */
  getFileByPath(path: string): ICodegenFile | undefined;
  /**
   * Produces output representations for all files in the project.
   *
   * @param meta Arbitrary metadata.
   * @returns Array of outputs ready for writing or further processing.
   * @example
   * project.render().forEach(output => writeFile(output));
   */
  render(meta?: ICodegenMeta): ReadonlyArray<ICodegenOutput>;
}
