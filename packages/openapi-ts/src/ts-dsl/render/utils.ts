import path from 'node:path';

import type { ExportGroup, File, ImportGroup } from '@hey-api/codegen-core';
import ts from 'typescript';

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
});

const blankFile = ts.createSourceFile(
  '',
  '',
  ts.ScriptTarget.ESNext,
  false,
  ts.ScriptKind.TS,
);

/** Print a TypeScript node to a string. */
export function nodeToString(node: ts.Node): string {
  const result = printer.printNode(ts.EmitHint.Unspecified, node, blankFile);

  try {
    /**
     * TypeScript Compiler API escapes unicode characters by default and there
     * is no way to disable this behavior
     * {@link https://github.com/microsoft/TypeScript/issues/36174}
     */
    return result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
  } catch {
    return result;
  }
}

export const nodeBuiltins = new Set([
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'freelist',
  'fs',
  'http',
  'https',
  'module',
  'net',
  'os',
  'path',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'worker_threads',
  'zlib',
]);

export type SortGroup = number;
export type SortDistance = number;
export type SortModule = string;
export type SortKey = [SortGroup, SortDistance, SortModule];

export type ModuleExport = Omit<ExportGroup, 'from'> & {
  /** Module specifier for re-exports, e.g. `./foo`. */
  modulePath: string;
};

export type ModuleImport = Omit<ImportGroup, 'from'> & {
  /** Module specifier for imports, e.g. `./foo`. */
  modulePath: string;
};

export const moduleSortKey = ({
  file,
  fromFile,
  preferFileExtension,
  root,
}: {
  file: File;
  fromFile: File;
  preferFileExtension: string;
  root: string;
}): SortKey => {
  const fromPath = fromFile.finalPath!;
  const filePath = file.finalPath!;
  let modulePath = fromPath;

  // built-ins
  // TODO: based on nodeBuiltins set

  // external
  if (fromFile.external && !path.isAbsolute(modulePath)) {
    return [0, 0, modulePath];
  }

  // outside project root
  if (!modulePath.startsWith(root)) {
    return [1, 0, modulePath];
  }

  // local
  const rel = path
    .relative(path.dirname(filePath), path.dirname(modulePath))
    .split(path.sep)
    .join('/');

  let parentCount: number;
  // same folder
  if (!rel.startsWith('..')) {
    modulePath = `./${rel ? `${rel}/` : ''}${fromFile.name}${fromFile.extension ?? ''}`;
    parentCount = 0;
  } else {
    modulePath = `${rel}/${fromFile.name}${fromFile.extension ?? ''}`;
    parentCount = rel
      .split(path.sep)
      .filter((segment) => segment === '..').length;
  }

  if (modulePath.endsWith('.ts')) {
    modulePath = modulePath.slice(0, -'.ts'.length);
  }
  if (preferFileExtension) {
    modulePath += preferFileExtension;
  } else if (modulePath.endsWith('/index')) {
    modulePath = modulePath.slice(0, -'/index'.length);
  }

  return [2, parentCount, modulePath];
};
