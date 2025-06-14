import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ImportExportItemObject } from '../compiler/utils';
import type { Client } from '../plugins/@hey-api/client-core/types';
import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import type { Plugin } from '../plugins/types';
import type { Config } from '../types/config';
import { ensureDirSync, relativeModulePath } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  // copy Hey API clients to output
  const isHeyApiClientPlugin = plugin.name.startsWith('@hey-api/client-');
  if (isHeyApiClientPlugin) {
    // copy client core
    const coreOutputPath = path.resolve(outputPath, 'core');
    ensureDirSync(coreOutputPath);
    const coreDistPath = path.resolve(__dirname, 'clients', 'core');
    fs.cpSync(coreDistPath, coreOutputPath, { recursive: true });
    // copy client bundle
    const clientOutputPath = path.resolve(outputPath, 'client');
    ensureDirSync(clientOutputPath);
    const clientDistFolderName = plugin.name.slice('@hey-api/client-'.length);
    const clientDistPath = path.resolve(
      __dirname,
      'clients',
      clientDistFolderName,
    );
    fs.cpSync(clientDistPath, clientOutputPath, { recursive: true });
    return;
  }

  let clientSrcPath = '';
  if (path.isAbsolute(plugin.name)) {
    clientSrcPath = getClientSrcPath(plugin.name);
  }

  // copy custom local client to output
  if (clientSrcPath) {
    const dirPath = path.resolve(outputPath, 'client');
    ensureDirSync(dirPath);
    fs.cpSync(clientSrcPath, dirPath, {
      recursive: true,
    });
    return;
  }

  // copy third-party client to output
  const clientModulePath = path.normalize(require.resolve(plugin.name));
  const clientModulePathComponents = clientModulePath.split(path.sep);
  const clientDistPath = clientModulePathComponents
    .slice(0, clientModulePathComponents.indexOf('dist') + 1)
    .join(path.sep);

  const indexJsFile =
    clientModulePathComponents[clientModulePathComponents.length - 1];
  const distFiles = [indexJsFile!, 'index.d.ts', 'index.d.cts'];
  const dirPath = path.resolve(outputPath, 'client');
  ensureDirSync(dirPath);
  for (const file of distFiles) {
    fs.copyFileSync(
      path.resolve(clientDistPath, file),
      path.resolve(dirPath, file),
    );
  }
};
