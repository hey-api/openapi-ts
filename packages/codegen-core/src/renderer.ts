import type { IProjectRenderMeta } from './extensions';
import type { File } from './files/file';
import type { INode } from './nodes/node';
import type { IProject } from './project/types';

export interface RenderContext<Node extends INode = INode> {
  /**
   * The current file.
   */
  file: File<Node>;
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
