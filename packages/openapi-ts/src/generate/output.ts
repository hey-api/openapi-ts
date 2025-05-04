import path from 'node:path';

import ts from 'typescript';

import { compiler } from '../compiler';
import { parseIR } from '../ir/parser';
import type { IR } from '../ir/types';
import type { OpenApi } from '../openApi';
import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isLegacyClient } from '../utils/config';
import type { Templates } from '../utils/handlebars';
import { generateLegacyClientClass } from './class';
import { generateClientBundle } from './client';
import { generateLegacyCore } from './core';
import { TypeScriptFile } from './files';
import { generateIndexFile } from './indexFile';
import { findTsConfigPath, loadTsConfig } from './tsConfig';
import { removeDirSync } from './utils';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param client Client containing models, schemas, and services
 * @param templates Templates wrapper with all loaded Handlebars templates
 */
export const generateLegacyOutput = async ({
  client,
  openApi,
  templates,
}: {
  client: Client;
  openApi: unknown;
  templates: Templates;
}): Promise<void> => {
  const config = getConfig();

  const spec = openApi as OpenApi;

  // TODO: parser - move to config.input
  if (client) {
    if (
      config.plugins['@hey-api/sdk']?.include &&
      config.plugins['@hey-api/sdk'].asClass
    ) {
      const regexp = new RegExp(config.plugins['@hey-api/sdk'].include);
      client.services = client.services.filter((service) =>
        regexp.test(service.name),
      );
    }

    if (config.plugins['@hey-api/typescript']?.include) {
      const regexp = new RegExp(config.plugins['@hey-api/typescript'].include);
      client.models = client.models.filter((model) => regexp.test(model.name));
    }
  }

  const outputPath = path.resolve(config.output.path);

  if (config.output.clean) {
    removeDirSync(outputPath);
  }

  const clientPlugin = getClientPlugin(config);
  if (
    !isLegacyClient(config) &&
    'bundle' in clientPlugin &&
    clientPlugin.bundle
  ) {
    generateClientBundle({
      outputPath,
      plugin: clientPlugin,
    });
  }

  // deprecated files
  await generateLegacyClientClass(spec, outputPath, client, templates);
  await generateLegacyCore(
    path.resolve(config.output.path, 'core'),
    client,
    templates,
  );

  const files: Files = {};

  for (const name of config.pluginOrder) {
    const plugin = config.plugins[name]!;
    const outputParts = (plugin.output ?? '').split('/');
    const outputDir = path.resolve(
      config.output.path,
      ...outputParts.slice(0, outputParts.length - 1),
    );
    files[plugin.name] = new TypeScriptFile({
      dir: outputDir,
      id: `legacy-unused-${plugin.name}`,
      name: `${outputParts[outputParts.length - 1]}.ts`,
    });
    plugin._handlerLegacy({
      client,
      files,
      openApi: spec,
      plugin: plugin as never,
    });
  }

  // TODO: exports do not support .js extensions
  generateIndexFile({ files });

  const tsConfig = loadTsConfig(findTsConfigPath(config.output.tsConfigPath));

  Object.entries(files).forEach(([name, file]) => {
    if (config.dryRun) {
      return;
    }

    if (name === 'index') {
      file.write('\n', tsConfig);
    } else {
      file.write('\n\n', tsConfig);
    }
  });
};

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
    plugin._handler({
      context,
      plugin: plugin as never,
    });
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
