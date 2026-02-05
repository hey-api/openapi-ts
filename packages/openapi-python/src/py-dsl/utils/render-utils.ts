import path from 'node:path';

import type { ExportModule, File, ImportModule } from '@hey-api/codegen-core';

import { py } from '../../ts-python';

const printer = py.createPrinter({
  indentSize: 4,
});

/** Print a Python node to a string. */
export function astToString(node: py.Node): string {
  const result = printer.printFile(node);
  return result;
}

export type SortGroup = number;
export type SortDistance = number;
export type SortModule = string;
export type SortKey = [SortGroup, SortDistance, SortModule];

export type ModuleExport = Omit<ExportModule, 'from'> & {
  /** Module specifier for re-exports, e.g. `./foo`. */
  modulePath: string;
};

export type ModuleImport = Omit<ImportModule, 'from'> & {
  /** Module specifier for imports, e.g. `./foo`. */
  modulePath: string;
};

export function moduleSortKey({
  file,
  fromFile,
  root,
}: {
  file: Pick<File, 'finalPath'>;
  fromFile: Pick<File, 'finalPath' | 'extension' | 'external' | 'name'>;
  preferFileExtension: string;
  root: string;
}): SortKey {
  const filePath = file.finalPath!.split(path.sep).join('/');
  let modulePath = fromFile.finalPath!.split(path.sep).join('/');

  // built-ins
  // TODO

  // external
  if (fromFile.external && !path.isAbsolute(modulePath)) {
    return [0, 0, modulePath];
  }

  // outside project root
  if (!modulePath.startsWith(root.split(path.sep).join('/'))) {
    return [1, 0, modulePath];
  }

  // local
  const rel = path
    .relative(path.dirname(filePath), path.dirname(modulePath))
    .split(path.sep)
    .join('/');

  const segments = rel ? rel.split('/') : [];
  const parentCount = segments.filter((s) => s === '..').length;

  const leadingDots = '.'.repeat(parentCount + 1);

  const pathSegments = segments.filter((s) => s !== '..' && s !== '.');

  const filename = modulePath.split('/').at(-1)!;
  // TODO: replace with extension check, there's an issue with external files
  // not having extension set
  const moduleName = filename.replace(/\.[^.]+$/, '');
  // const moduleName = fromFile.extension
  //   ? filename.slice(0, -fromFile.extension.length)
  //   : filename;

  // index/__init__ are implicit
  const isImplicitModule = moduleName === 'index' || moduleName === '__init__';
  if (!isImplicitModule) {
    pathSegments.push(moduleName);
  }

  modulePath = pathSegments.length > 0 ? leadingDots + pathSegments.join('.') : leadingDots;

  return [2, parentCount, modulePath];
}
