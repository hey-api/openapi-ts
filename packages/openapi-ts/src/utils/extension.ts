import { isDenoRuntime } from './runtime';

/**
 * Appends the file extension to a file name based on the current runtime
 *
 * Some TS runtimes require using the complete path for import/export,
 * including the extension
 */
export const appendExt = (fileName: string): string => {
  if (isDenoRuntime()) {
    return `${fileName}.ts`;
  }
  return fileName;
};

/**
 * Returns the file extension based on the current runtime
 */
export const getExt = (): string => appendExt('');
