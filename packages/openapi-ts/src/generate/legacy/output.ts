import path from 'node:path';

import type { ProjectRenderMeta } from '@hey-api/codegen-core';

import type { OpenApi } from '../../openApi';
import { getClientPlugin } from '../../plugins/@hey-api/client-core/utils';
import type { Client } from '../../types/client';
import type { Files } from '../../types/utils';
import { getConfig, isLegacyClient } from '../../utils/config';
import type { Templates } from '../../utils/handlebars';
import { generateLegacyClientClass } from '../class';
import { generateClientBundle } from '../client';
import { generateLegacyCore } from '../core';
import { GeneratedFile } from '../file';
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
      config.plugins['@hey-api/sdk']?.config.include &&
      config.plugins['@hey-api/sdk'].config.asClass
    ) {
      const regexp = new RegExp(config.plugins['@hey-api/sdk'].config.include);
      client.services = client.services.filter((service) =>
        regexp.test(service.name),
      );
    }

    if (config.plugins['@hey-api/typescript']?.config.include) {
      const regexp = new RegExp(
        config.plugins['@hey-api/typescript'].config.include,
      );
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
    'bundle' in clientPlugin.config &&
    clientPlugin.config.bundle
  ) {
    const meta: ProjectRenderMeta = {
      importFileExtension: config.output.importFileExtension,
    };

    generateClientBundle({
      meta,
      outputPath,
      // @ts-expect-error
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
    const outputParts = ((plugin.output as string) ?? '').split('/');
    const outputDir = path.resolve(
      config.output.path,
      ...outputParts.slice(0, outputParts.length - 1),
    );
    files[plugin.name] = new GeneratedFile({
      dir: outputDir,
      id: `legacy-unused-${plugin.name}`,
      name: `${outputParts[outputParts.length - 1]}.ts`,
    });
    plugin.handlerLegacy?.({
      client,
      files,
      openApi: spec,
      plugin: plugin as never,
    });
  }

  // TODO: exports do not support .js extensions
  generateIndexFile({ files });

  Object.entries(files).forEach(([name, file]) => {
    if (config.dryRun) {
      return;
    }

    if (name === 'index') {
      file.write('\n', config.output.tsConfig);
    } else {
      file.write('\n\n', config.output.tsConfig);
    }
  });
};
