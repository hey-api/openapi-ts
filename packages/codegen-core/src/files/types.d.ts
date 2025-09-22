import type { IBiMap } from '../bimap/types';
import type { ISelector } from '../selectors/types';

export interface IFileIn {
  /**
   * File extension, if any.
   */
  readonly extension?: string;
  /**
   * Indicates whether the file is external, meaning it is not generated
   * as part of the project but is referenced (e.g., a module from
   * node_modules).
   *
   * @example true
   */
  readonly external?: boolean;
  /**
   * Unique file ID. If one is not provided, it will be auto-generated.
   */
  readonly id?: number;
  /**
   * The desired name for the file within the project. If there are multiple files
   * with the same desired name, this might not end up being the actual name.
   *
   * @example "UserModel"
   */
  readonly name?: string;
  /**
   * Absolute logical output path for the file.
   *
   * @example "/src/models/user.ts"
   */
  readonly path?: string;
  /**
   * Selector array used to select this file. It doesn't have to be
   * unique, but in practice it might be desirable.
   *
   * @example ["zod", "#/components/schemas/Foo"]
   */
  readonly selector?: ISelector;
}

export interface IFileOut extends IFileIn {
  /**
   * Unique file ID.
   */
  readonly id: number;
  /**
   * Map holding resolved names for symbols in this file.
   */
  readonly resolvedNames: IBiMap<number, string>;
  /**
   * Symbols in this file, categorized by their role.
   */
  readonly symbols: {
    /**
     * Symbols declared in the body of this file.
     */
    body: Array<number>;
    /**
     * Symbols re-exported from other files.
     */
    exports: Array<number>;
    /**
     * Symbols imported from other files.
     */
    imports: Array<number>;
  };
}

export interface IFileRegistry {
  /**
   * Get a file by its ID.
   *
   * @param fileIdOrSelector File ID or selector to reference.
   * @returns The file, or undefined if not found.
   */
  get(fileIdOrSelector: number | ISelector): IFileOut | undefined;
  /**
   * Returns the current file ID and increments it.
   *
   * @returns File ID before being incremented
   */
  readonly id: number;
  /**
   * Returns a file by ID or selector, registering it if it doesn't exist.
   *
   * @param fileIdOrSelector File ID or selector to reference.
   * @returns The referenced or newly registered file.
   */
  reference(fileIdOrSelector: number | ISelector): IFileOut;
  /**
   * Get all unregistered files in the order they were referenced.
   *
   * @returns Array of all unregistered files, in reference order.
   */
  referenced(): IterableIterator<IFileOut>;
  /**
   * Register a file globally.
   *
   * Deduplicates identical files by ID.
   *
   * @param file File to register.
   * @returns true if added, false if duplicate.
   */
  register(file: IFileIn): IFileOut;
  /**
   * Get all files in the order they were registered.
   *
   * @returns Array of all registered files, in insert order.
   */
  registered(): IterableIterator<IFileOut>;
}
