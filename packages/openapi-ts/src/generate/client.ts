import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import type { ImportExportItemObject } from '../compiler/utils';
import type { Client } from '../plugins/@hey-api/client-core/types';
import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import type { DefinePlugin } from '../plugins/types';
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

  if ('bundle' in client.config && client.config.bundle) {
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

const replaceRelativeImports = (filePath: string) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace relative imports to append .js extension for ESM compatibility
  // This handles patterns like: from './foo' -> from './foo.js'
  // and: from '../bar' -> from '../bar.js'
  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]*?)['"]/g,
    (match, importPath) => {
      // Don't add .js if it already has an extension
      const lastSlashIndex = importPath.lastIndexOf('/');
      const fileName =
        lastSlashIndex >= 0 ? importPath.slice(lastSlashIndex + 1) : importPath;
      if (fileName.includes('.')) {
        return match;
      }
      return `from '${importPath}.js'`;
    },
  );

  fs.writeFileSync(filePath, content, 'utf8');
};

/**
 * Creates a `client` folder containing the same modules as the client package.
 */
export const generateClientBundle = ({
  outputPath,
  plugin,
  tsConfig,
}: {
  outputPath: string;
  plugin: DefinePlugin<Client.Config & { $name: string }>['Config'];
  tsConfig: ts.ParsedCommandLine | null;
}): void => {
  // copy Hey API clients to output
  const isHeyApiClientPlugin = plugin.name.startsWith('@hey-api/client-');
  if (isHeyApiClientPlugin) {
    const shouldAppendJs =
      tsConfig?.options.moduleResolution === ts.ModuleResolutionKind.NodeNext;

    // copy client core
    const coreOutputPath = path.resolve(outputPath, 'core');
    ensureDirSync(coreOutputPath);
    const coreDistPath = path.resolve(__dirname, 'clients', 'core');
    fs.cpSync(coreDistPath, coreOutputPath, { recursive: true });
    if (shouldAppendJs) {
      const coreFiles = fs.readdirSync(coreOutputPath);
      for (const file of coreFiles) {
        replaceRelativeImports(path.resolve(coreOutputPath, file));
      }
    }
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
    if (shouldAppendJs) {
      const clientFiles = fs.readdirSync(clientOutputPath);
      for (const file of clientFiles) {
        replaceRelativeImports(path.resolve(clientOutputPath, file));
      }
    }
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
