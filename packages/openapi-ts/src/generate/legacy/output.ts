import path from 'node:path';

import type { OpenApi } from '../../openApi';
import { getClientPlugin } from '../../plugins/@hey-api/client-core/utils';
import type { Client } from '../../types/client';
import type { Files } from '../../types/utils';
import { getConfig, isLegacyClient } from '../../utils/config';
import type { Templates } from '../../utils/handlebars';
import { generateLegacyClientClass } from '../class';
import { generateClientBundle } from '../client';
import { generateLegacyCore } from '../core';
import { TypeScriptFile } from '../files';
import { findTsConfigPath, loadTsConfig } from '../tsConfig';
import { removeDirSync } from '../utils';
import { generateIndexFile } from './indexFile';

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
