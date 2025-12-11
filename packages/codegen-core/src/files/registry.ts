import path from 'node:path';

import type { IProject } from '../project/types';
import { File } from './file';
import type { FileKeyArgs, IFileIn, IFileRegistry } from './types';

type FileId = number;
type FileKey = string;

export class FileRegistry implements IFileRegistry {
  private _id: FileId = 0;
  private _values: Map<FileKey, File> = new Map();
  private readonly project: IProject;

  constructor(project: IProject) {
    this.project = project;
  }

  get(args: FileKeyArgs): File | undefined {
    return this._values.get(this.createFileKey(args));
  }

  isRegistered(args: FileKeyArgs): boolean {
    return this._values.has(this.createFileKey(args));
  }

  get nextId(): FileId {
    return this._id++;
  }

  register(file: IFileIn): File {
    const key = this.createFileKey(file);

    let result = this._values.get(key);
    if (result) {
      if (file.name) {
        result.setName(file.name);
      }
    } else {
      result = new File(file, this.nextId, this.project);
    }

    this._values.set(key, result);

    return result;
  }

  *registered(): IterableIterator<File> {
    for (const file of this._values.values()) {
      yield file;
    }
  }

  private createFileKey(args: FileKeyArgs): string {
    const logicalPath = args.logicalFilePath.split(path.sep).join('/');
    return `${args.external ? 'ext:' : ''}${logicalPath}${args.language ? `:${args.language}` : ''}`;
  }
}
