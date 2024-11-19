import path from 'node:path';

import { compiler } from '../compiler';
import type { IRContext } from '../ir/context';
import { parseIR } from '../ir/parser';
import type { OpenApi } from '../openApi';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isLegacyClient } from '../utils/config';
import type { Templates } from '../utils/handlebars';
import { generateLegacyClientClass } from './class';
import { generateClientBundle } from './client';
import { generateLegacyCore } from './core';
import { TypeScriptFile } from './files';
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
      config.plugins['@hey-api/services']?.include &&
      config.plugins['@hey-api/services'].asClass
    ) {
      const regexp = new RegExp(config.plugins['@hey-api/services'].include);
      client.services = client.services.filter((service) =>
        regexp.test(service.name),
      );
    }

    if (config.plugins['@hey-api/types']?.include) {
      const regexp = new RegExp(config.plugins['@hey-api/types'].include);
      client.models = client.models.filter((model) => regexp.test(model.name));
    }
  }

  const outputPath = path.resolve(config.output.path);

  if (!isLegacyClient(config) && config.client.bundle) {
    await generateClientBundle({ name: config.client.name, outputPath });
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
      name: `${outputParts[outputParts.length - 1]}.ts`,
    });
    plugin._handlerLegacy({
      client,
      files,
      openApi: spec,
      plugin: plugin as never,
    });
  }

  generateIndexFile({ files });

  Object.entries(files).forEach(([name, file]) => {
    if (config.dryRun) {
      return;
    }

    if (name === 'index') {
      file.write();
    } else {
      file.write('\n\n');
    }
  });
};

export const generateOutput = async ({ context }: { context: IRContext }) => {
  const outputPath = path.resolve(context.config.output.path);

  if (context.config.client.bundle) {
    generateClientBundle({
      name: context.config.client.name,
      outputPath,
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

  const indexFile = context.createFile({
    id: '_index',
    path: 'index',
  });

  Object.entries(context.files).forEach(([name, file]) => {
    if (context.config.dryRun || name === '_index') {
      return;
    }

    if (
      !file.isEmpty() &&
      ['schemas', 'services', 'transformers', 'types'].includes(name)
    ) {
      indexFile.add(
        compiler.exportAllDeclaration({
          module: `./${file.nameWithoutExtension()}`,
        }),
      );
    }

    file.write('\n\n');
  });

  if (!context.config.dryRun) {
    indexFile.write();
  }
};
