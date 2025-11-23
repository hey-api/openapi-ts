import type { IProjectRenderMeta } from '../extensions';
import type { IFileOut } from '../files/types';
import type { IProject } from '../project/types';

export interface IRenderer {
  /**
   * Renders content with replaced symbols.
   *
   * @param content Content to render.
   * @param file The file to render.
   * @param project The parent project the file belongs to.
   * @returns Rendered content.
   */
  renderFile(
    content: string,
    file: IFile,
    project: IProject,
    meta?: IProjectRenderMeta,
  ): string;
  /**
   * Returns printable data containing symbols and exports.
   *
   * @param file The file to render.
   * @param project The parent project the file belongs to.
   * @param meta Arbitrary metadata.
   * @returns Printable string containing symbols and exports.
   */
  renderSymbols(
    file: IFileOut,
    project: IProject,
    meta?: IProjectRenderMeta,
  ): string;
}
