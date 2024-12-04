import fs from 'node:fs';
import path from 'node:path';

import type { ImportExportItemObject } from '../compiler/utils';
import type { Config } from '../types/config';
import { ensureDirSync, relativeModulePath } from './utils';

/**
 * Returns path to the client module. When using client packages, this will be
 * simply the name of the package. When bundling a client, this will be a
 * relative path to the bundled client folder.
 */
export const clientModulePath = ({
  config,
  sourceOutput,
}: {
  config: Config;
  sourceOutput: string;
}): string => {
  if (config.client.bundle) {
    return relativeModulePath({
      moduleOutput: 'client',
      sourceOutput,
    });
  }

  return config.client.name;
};

export const clientApi = {
  Options: {
    asType: true,
    name: 'Options',
  },
  OptionsLegacyParser: {
    asType: true,
    name: 'OptionsLegacyParser',
  },
} satisfies Record<string, ImportExportItemObject>;

/**
 * Creates a `client` folder containing the same modules as the client package.
 */
export const generateClientBundle = ({
  name,
  outputPath,
}: {
  name: string;
  outputPath: string;
}): void => {
  // create folder for client modules
  const dirPath = path.resolve(outputPath, 'client');
  ensureDirSync(dirPath);

  const clientModulePath = path.normalize(require.resolve(name));
  const clientModulePathComponents = clientModulePath.split(path.sep);
  const clientSrcPath = [
    ...clientModulePathComponents.slice(
      0,
      clientModulePathComponents.indexOf('dist'),
    ),
    'src',
  ].join(path.sep);

  // copy client modules
  const files = ['index.ts', 'types.ts', 'utils.ts'];
  files.forEach((file) => {
    fs.copyFileSync(
      path.resolve(clientSrcPath, file),
      path.resolve(dirPath, file),
    );
  });
};
