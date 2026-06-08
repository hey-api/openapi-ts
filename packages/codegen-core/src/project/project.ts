import path from 'node:path';

import type { IProjectMeta } from '../extensions';
import { FileRegistry } from '../files/registry';
import { defaultExtensions } from '../languages/extensions';
import { defaultModuleEntryNames } from '../languages/modules';
import { defaultNameConflictResolvers } from '../languages/resolvers';
import type { Extensions, ModuleEntryNames, NameConflictResolvers } from '../languages/types';
import { NodeRegistry } from '../nodes/registry';
import type { IOutput } from '../output';
import { Planner } from '../planner/planner';
import { simpleNameConflictResolver } from '../planner/resolvers';
import type { NameConflictResolver } from '../planner/types';
import type { Renderer } from '../renderer';
import { SymbolRegistry } from '../symbols/registry';
import type { IProject } from './types';

export class Project implements IProject {
  private _isPlanned = false;

  readonly files: FileRegistry;
  readonly meta: IProjectMeta;
  readonly nodes = new NodeRegistry();
  readonly symbols = new SymbolRegistry();

  readonly defaultFileName: string;
  readonly defaultNameConflictResolver: NameConflictResolver;
  readonly extensions: Extensions;
  readonly fileName?: (name: string) => string;
  readonly moduleEntryNames: ModuleEntryNames;
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
      | 'moduleEntryNames'
      | 'nameConflictResolvers'
      | 'renderers'
    > &
      Pick<IProject, 'root'> & { meta?: IProjectMeta },
  ) {
    this.meta = args.meta ?? {};
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
    this.moduleEntryNames = {
      ...defaultModuleEntryNames,
      ...args.moduleEntryNames,
    };
    this.nameConflictResolvers = {
      ...defaultNameConflictResolvers,
      ...args.nameConflictResolvers,
    };
    this.renderers = args.renderers ?? [];
    this.root = path.resolve(args.root).replace(/[/\\]+$/, '');
  }

  plan(): void {
    if (this._isPlanned) return;
    new Planner(this).plan();
    this._isPlanned = true;
  }

  render(): ReadonlyArray<IOutput> {
    if (!this._isPlanned) this.plan();
    const files: Array<IOutput> = [];
    for (const file of this.files.registered()) {
      if (!file.external && file.finalPath && file.renderer) {
        const content = file.renderer.render({ file, project: this });
        files.push({ content, path: file.finalPath });
      }
    }
    return files;
  }
}
