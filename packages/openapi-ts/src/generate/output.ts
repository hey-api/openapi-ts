import path from 'node:path';

import ts from 'typescript';

import { compiler } from '../compiler';
import type { IR } from '../ir/types';
import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import { generateClientBundle } from './client';
import { findTsConfigPath, loadTsConfig } from './tsConfig';
import { removeDirSync } from './utils';

export const generateOutput = async ({ context }: { context: IR.Context }) => {
  const outputPath = path.resolve(context.config.output.path);

  if (context.config.output.clean) {
    removeDirSync(outputPath);
  }

  const tsConfig = loadTsConfig(
    findTsConfigPath(context.config.output.tsConfigPath),
  );
  const shouldAppendJs =
    tsConfig?.options.moduleResolution === ts.ModuleResolutionKind.NodeNext;

  const client = getClientPlugin(context.config);
  if ('bundle' in client.config && client.config.bundle) {
    generateClientBundle({
      outputPath,
      plugin: client,
      tsConfig,
    });
  }

  for (const plugin of context.registerPlugins()) {
    await plugin.run();
  }

  if (!context.config.dryRun) {
    const indexFile = context.createFile({
      id: '_index',
      path: 'index',
    });

    for (const file of Object.values(context.files)) {
      const fileName = file.nameWithoutExtension();

      if (fileName === indexFile.nameWithoutExtension()) {
        continue;
      }

      if (
        !file.isEmpty() &&
        file.exportFromIndex &&
        context.config.output.indexFile
      ) {
        let resolvedModule = indexFile.relativePathToFile({
          context,
          id: file.id,
        });
        if (
          shouldAppendJs &&
          (resolvedModule.startsWith('./') || resolvedModule.startsWith('../'))
        ) {
          if (resolvedModule === './client') {
            resolvedModule = './client/index.js';
          } else {
            resolvedModule = `${resolvedModule}.js`;
          }
        }
        // TODO: parser - add export method for more granular control over
        // what's exported so we can support named exports
        indexFile.add(
          compiler.exportAllDeclaration({ module: resolvedModule }),
        );
      }

      file.write('\n\n', tsConfig);
    }

    if (context.config.output.indexFile) {
      indexFile.write('\n', tsConfig);
    }
  }
};
