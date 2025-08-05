import type { CodegenFile } from '../files/file';
import type { ICodegenMeta } from '../meta/types';
import type { ICodegenOutput } from '../output/types';

export interface ICodegenRenderer {
  /**
   * Optional: hook for renderer-level setup logic (e.g., formatting, config)
   */
  configure?(options: Record<string, unknown>): void;
  /**
   * Unique identifier for this renderer.
   *
   * @example "typescript"
   */
  id: string;
  /**
   * Returns printable data.
   *
   * @param file The file to render.
   * @param meta Arbitrary metadata.
   * @returns Output for file emit step
   */
  render(file: CodegenFile, meta?: ICodegenMeta): ICodegenOutput;
}
