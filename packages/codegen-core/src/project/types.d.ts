import type { IProjectRenderMeta } from '../extensions';
import type { IFileRegistry } from '../files/types';
import type { Extensions, NameConflictResolvers } from '../languages/types';
import type { INodeRegistry } from '../nodes/types';
import type { IOutput } from '../output';
import type { NameConflictResolver } from '../planner/types';
import type { Renderer } from '../renderer';
import type { ISymbolRegistry } from '../symbols/types';

/**
 * Represents a code generation project consisting of codegen files.
 *
 * Manages imports, symbols, and output generation across the project.
 */
export interface IProject {
  /**
   * The default file to assign symbols without a specific file selector.
   *
   * @default 'main'
   */
  readonly defaultFileName: string;
  /** Default name conflict resolver used when a file has no specific resolver. */
  readonly defaultNameConflictResolver: NameConflictResolver;
  /** Maps language to array of extensions. First element is used by default. */
  readonly extensions: Extensions;
  /**
   * Function to transform file names before they are used.
   *
   * @param name The original file name.
   * @returns The transformed file name.
   */
  readonly fileName?: (name: string) => string;
  /** Centralized file registry for the project. */
  readonly files: IFileRegistry;
  /** Map of language-specific name conflict resolvers for files in the project. */
  readonly nameConflictResolvers: NameConflictResolvers;
  /** Centralized node registry for the project. */
  readonly nodes: INodeRegistry;
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
   * List of available renderers.
   *
   * @example
   * [new TypeScriptRenderer()]
   */
  readonly renderers: ReadonlyArray<Renderer>;
  /** The absolute path to the root folder of the project. */
  readonly root: string;
  /** Centralized symbol registry for the project. */
  readonly symbols: ISymbolRegistry;
}
