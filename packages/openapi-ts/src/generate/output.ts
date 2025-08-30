import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import type { IR } from '../ir/types';
import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import { tsc } from '../tsc';
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
      // @ts-expect-error
      plugin: client,
      tsConfig,
    });
  }

  for (const plugin of context.registerPlugins()) {
    await plugin.run();
  }

  if (!context.config.dryRun) {
    // TODO: delete old approach
    const indexFile = context.createFile({
      id: '_index',
      path: 'index',
    });

    // TODO: delete old approach
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
        indexFile.add(tsc.exportAllDeclaration({ module: resolvedModule }));
      }

      file.write('\n\n', tsConfig);
    }

    // TODO: delete old approach
    if (!indexFile.isEmpty()) {
      indexFile.write('\n', tsConfig);
    }

    for (const file of context.gen.render({
      moduleResolution: tsConfig?.options.moduleResolution,
    })) {
      if (!file.content) continue;
      const filePath = path.resolve(outputPath, file.path);
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, file.content, { encoding: 'utf8' });
    }
  }
};
