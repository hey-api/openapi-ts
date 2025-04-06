import type { PathLike } from 'node:fs';
import fs from 'node:fs';

export const ensureDirSync = (path: PathLike) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

export const removeDirSync = (path: PathLike) => {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { force: true, recursive: true });
  }
};

/**
 * Construct a relative import path to modules. This is used for example
 * in plugins to import types or SDK module.
 */
export const relativeModulePath = ({
  moduleOutput,
  sourceOutput,
}: {
  /**
   * Output path to the imported module.
   * @example
   * 'types'
   */
  moduleOutput: string;
  /**
   * Output path to the source module.
   * @example
   * '@tanstack/react-query'
   */
  sourceOutput: string;
}): string => {
  const outputParts = sourceOutput.split('/');
  const relativePath =
    Array.from({ length: outputParts.length }).fill('').join('../') || './';
  return `${relativePath}${moduleOutput}`;
};
