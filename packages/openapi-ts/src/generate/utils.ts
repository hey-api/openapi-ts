import { existsSync, mkdirSync, type PathLike } from 'node:fs';

export const ensureDirSync = (path: PathLike) => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
};

/**
 * Construct a relative import path to modules. This is used for example
 * in plugins to import types or services module.
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
    new Array(outputParts.length).fill('').join('../') || './';
  return `${relativePath}${moduleOutput}`;
};
