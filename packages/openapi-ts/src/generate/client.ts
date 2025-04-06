import fs from 'node:fs';
import path from 'node:path';

import type { ImportExportItemObject } from '../compiler/utils';
import type { Client } from '../plugins/@hey-api/client-core/types';
import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import type { Plugin } from '../plugins/types';
import type { Config } from '../types/config';
import { ensureDirSync, relativeModulePath } from './utils';

const getClientSrcPath = (name: string) => {
  const pluginFilePathComponents = name.split(path.sep);
  const clientSrcPath = pluginFilePathComponents
    .slice(0, pluginFilePathComponents.length - 1)
    .join(path.sep);
  return clientSrcPath;
};

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
  const client = getClientPlugin(config);

  if ('bundle' in client && client.bundle) {
    return relativeModulePath({
      moduleOutput: 'client',
      sourceOutput,
    });
  }

  if (path.isAbsolute(client.name)) {
    const clientSrcPath = getClientSrcPath(client.name);
    const outputPath = path.resolve(config.output.path);
    return path.relative(outputPath, clientSrcPath).replace(/\\/g, '/');
  }

  return client.name;
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
  outputPath,
  plugin,
}: {
  outputPath: string;
  plugin: Plugin.Config<Client.Config & { name: any }>;
}): void => {
  // create folder for client modules
  const dirPath = path.resolve(outputPath, 'client');
  ensureDirSync(dirPath);

  let clientSrcPath = '';
  if (path.isAbsolute(plugin.name)) {
    clientSrcPath = getClientSrcPath(plugin.name);
  }

  if (plugin.bundleSource_EXPERIMENTAL && !clientSrcPath) {
    const clientModulePath = path.normalize(require.resolve(plugin.name));
    const clientModulePathComponents = clientModulePath.split(path.sep);
    clientSrcPath = [
      ...clientModulePathComponents.slice(
        0,
        clientModulePathComponents.indexOf('dist'),
      ),
      'src',
    ].join(path.sep);
  }

  if (clientSrcPath) {
    fs.cpSync(clientSrcPath, dirPath, {
      recursive: true,
    });
    return;
  }

  const clientModulePath = path.normalize(require.resolve(plugin.name));
  const clientModulePathComponents = clientModulePath.split(path.sep);
  const clientDistPath = clientModulePathComponents
    .slice(0, clientModulePathComponents.indexOf('dist') + 1)
    .join(path.sep);

  const indexJsFile =
    clientModulePathComponents[clientModulePathComponents.length - 1];
  const distFiles = [indexJsFile!, 'index.d.ts'];
  if (plugin.name !== '@hey-api/client-nuxt') {
    distFiles.push('index.d.cts');
  }
  for (const file of distFiles) {
    fs.copyFileSync(
      path.resolve(clientDistPath, file),
      path.resolve(dirPath, file),
    );
  }
};
