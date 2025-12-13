import type { IProjectRenderMeta } from './extensions';
import type { File } from './files/file';
import type { AstContext } from './nodes/context';
import type { IProject } from './project/types';

export interface RenderContext {
  /**
   * The context passed to `.toAst()` methods.
   */
  astContext: AstContext;
  /**
   * The current file.
   */
  file: File;
  /**
   * Arbitrary metadata.
   */
  meta?: IProjectRenderMeta;
  /**
   * The project the file belongs to.
   */
  project: IProject;
}

export interface Renderer {
  /** Renders the given file. */
  render(ctx: RenderContext): string;
  /** Returns whether this renderer can render the given file. */
  supports(ctx: Omit<RenderContext, 'astContext'>): boolean;
}
