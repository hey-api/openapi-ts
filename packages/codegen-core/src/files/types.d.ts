import type { Language } from '../languages/types';
import type { File } from './file';

export type FileKeyArgs = Pick<Required<File>, 'logicalFilePath'> &
  Pick<Partial<File>, 'external' | 'language'>;

export type IFileIn = {
  /**
   * Indicates whether the file is external, meaning it is not generated
   * as part of the project but is referenced (e.g., a module from
   * node_modules).
   *
   * @example true
   */
  external?: boolean;
  /**
   * Language of the file.
   *
   * @example "typescript"
   */
  language?: Language;
  /**
   * Logical, extension-free path used for planning and routing.
   *
   * @example "src/models/user"
   */
  logicalFilePath: string;
  /**
   * The desired name for the file within the project. If there are multiple files
   * with the same desired name, this might not end up being the actual name.
   *
   * @example "UserModel"
   */
  name?: string;
};

export interface IFileRegistry {
  /**
   * Get a file.
   *
   * @returns The file, or undefined if not found.
   */
  get(args: FileKeyArgs): File | undefined;
  /**
   * Returns whether a file is registered in the registry.
   *
   * @returns True if the file is registered, false otherwise.
   */
  isRegistered(args: FileKeyArgs): boolean;
  /**
   * Returns the current file ID and increments it.
   *
   * @returns File ID before being incremented
   */
  readonly nextId: number;
  /**
   * Register a file globally.
   *
   * @param file File to register.
   * @returns Newly registered file if created, merged file otherwise.
   */
  register(file: IFileIn): File;
  /**
   * Get all files in the order they were registered.
   *
   * @returns Array of all registered files, in insert order.
   */
  registered(): IterableIterator<File>;
}
