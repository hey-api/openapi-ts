import path from 'node:path';

import type { IProjectRenderMeta } from '../extensions';
import { FileRegistry } from '../files/registry';
import { defaultExtensions } from '../languages/extensions';
import { defaultNameConflictResolvers } from '../languages/resolvers';
import type { Extensions, NameConflictResolvers } from '../languages/types';
import { NodeRegistry } from '../nodes/registry';
import type { IOutput } from '../output';
import { Planner } from '../planner/planner';
import { simpleNameConflictResolver } from '../planner/resolvers';
import type { NameConflictResolver } from '../planner/types';
import type { Renderer } from '../renderer';
import { SymbolRegistry } from '../symbols/registry';
import type { IProject } from './types';

export class Project implements IProject {
  readonly files: FileRegistry;
  readonly nodes = new NodeRegistry();
  readonly symbols = new SymbolRegistry();

  readonly defaultFileName: string;
  readonly defaultNameConflictResolver: NameConflictResolver;
  readonly extensions: Extensions;
  readonly fileName?: (name: string) => string;
  readonly nameConflictResolvers: NameConflictResolvers;
  readonly renderers: ReadonlyArray<Renderer>;
  readonly root: string;

  constructor(
    args: Pick<
      Partial<IProject>,
      | 'defaultFileName'
      | 'defaultNameConflictResolver'
      | 'extensions'
      | 'fileName'
      | 'nameConflictResolvers'
      | 'renderers'
    > &
      Pick<IProject, 'root'>,
  ) {
    const fileName = args.fileName;
    this.defaultFileName = args.defaultFileName ?? 'main';
    this.defaultNameConflictResolver =
      args.defaultNameConflictResolver ?? simpleNameConflictResolver;
    this.extensions = {
      ...defaultExtensions,
      ...args.extensions,
    };
    this.fileName = typeof fileName === 'string' ? () => fileName : fileName;
    this.files = new FileRegistry(this);
    this.nameConflictResolvers = {
      ...defaultNameConflictResolvers,
      ...args.nameConflictResolvers,
    };
    this.renderers = args.renderers ?? [];
    this.root = path.resolve(args.root).replace(/[/\\]+$/, '');
  }

  render(meta?: IProjectRenderMeta): ReadonlyArray<IOutput> {
    new Planner(this).plan(meta);
    const files: Array<IOutput> = [];
    for (const file of this.files.registered()) {
      if (!file.external && file.finalPath && file.renderer) {
        const content = file.renderer.render({ file, meta, project: this });
        files.push({ content, path: file.finalPath });
      }
    }
    return files;
  }
}
