import path from 'node:path';

import ts from 'typescript';

import { compiler } from '../compiler';
import type { Events } from '../ir/context';
import { parseIR } from '../ir/parser';
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

  const client = getClientPlugin(context.config);
  if ('bundle' in client && client.bundle) {
    generateClientBundle({
      outputPath,
      plugin: client,
    });
  }

  for (const name of context.config.pluginOrder) {
    const plugin = context.config.plugins[name]!;
    const _subscribe = context.subscribe.bind(context);
    context.subscribe = <T extends keyof Events>(
      event: T,
      callbackFn: Events[T],
    ): void => {
      _subscribe(event, callbackFn, name);
    };
    plugin._handler({
      context,
      plugin: plugin as never,
    });
    context.subscribe = _subscribe;
  }

  await parseIR({ context });

  if (!context.config.dryRun) {
    const indexFile = context.createFile({
      id: '_index',
      path: 'index',
    });

    const tsConfig = loadTsConfig(
      findTsConfigPath(context.config.output.tsConfigPath),
    );
    const shouldAppendJs =
      tsConfig?.options.moduleResolution === ts.ModuleResolutionKind.NodeNext;

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
          resolvedModule = `${resolvedModule}.js`;
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
