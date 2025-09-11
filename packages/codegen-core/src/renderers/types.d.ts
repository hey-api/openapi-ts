import type { ICodegenFile } from '../files/types';
import type { ICodegenMeta } from '../meta/types';

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
   * Returns printable data containing header and imports.
   *
   * @param file The file to render.
   * @param meta Arbitrary metadata.
   * @returns Printable string containing header and imports.
   */
  renderHeader(file: ICodegenFile, meta?: ICodegenMeta): string;
  /**
   * Returns printable data containing symbols and exports.
   *
   * @param file The file to render.
   * @param meta Arbitrary metadata.
   * @returns Printable string containing symbols and exports.
   */
  renderSymbols(file: ICodegenFile, meta?: ICodegenMeta): string;
  /**
   * Function replacing symbols with resolved names.
   *
   * @returns String with replaced symbols.
   */
  replacerFn(args: {
    file: ICodegenFile;
    headless?: boolean;
    scope?: 'file' | 'project';
    symbolId: number;
  }): string | undefined;
}
