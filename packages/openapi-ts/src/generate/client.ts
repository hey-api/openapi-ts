import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { getConfig, isStandaloneClient } from '../utils/config';
import { ensureDirSync } from './utils';

const require = createRequire(import.meta.url);

export const clientModulePath = () => {
  const config = getConfig();
  return config.client.bundle ? './client' : config.client.name;
};

export const clientOptionsTypeName = () => 'Options';

/**
 * (optional) Creates a `client.ts` file containing the same exports as a
 * standalone client package. Creates a `core` directory containing the modules
 * from standalone client. These files are generated only when `client.bundle`
 * is set to true.
 */
export const generateClient = async (
  outputPath: string,
  moduleName: string,
) => {
  const config = getConfig();

  if (!isStandaloneClient(config) || !config.client.bundle) {
    return;
  }

  // create directory for client modules
  const dirPath = path.resolve(outputPath, 'core');
  ensureDirSync(dirPath);

  const clientModulePath = path.normalize(require.resolve(moduleName));
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
    copyFileSync(
      path.resolve(clientSrcPath, file),
      path.resolve(dirPath, file),
    );
  });

  // copy index file with cherry-picked exports
  const nodeIndexFile = readFileSync(
    path.resolve(clientSrcPath, 'node', 'index.ts'),
    'utf-8',
  );
  const indexFile = nodeIndexFile.replaceAll('../', './core/');
  writeFileSync(path.resolve(outputPath, 'client.ts'), indexFile, 'utf-8');
};
