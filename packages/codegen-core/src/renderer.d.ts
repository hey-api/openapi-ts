import type { IProjectRenderMeta } from './extensions';
import type { File } from './files/file';
import type { IProject } from './project/types';

export interface RenderContext {
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
  supports(ctx: RenderContext): boolean;
}
