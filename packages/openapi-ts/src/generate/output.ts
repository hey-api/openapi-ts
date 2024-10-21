import path from 'node:path';

import type { IRContext } from '../ir/context';
import type { OpenApi } from '../openApi';
import { generateSchemas } from '../plugins/@hey-api/schemas/plugin';
import { generateServices } from '../plugins/@hey-api/services/plugin';
import { generateTypes } from '../plugins/@hey-api/types/plugin';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isLegacyClient } from '../utils/config';
import type { Templates } from '../utils/handlebars';
import { generateLegacyClientClass } from './class';
import { generateClientBundle } from './client';
import { generateLegacyCore } from './core';
import { generateIndexFile } from './indexFile';
import { generateLegacyPlugins } from './plugins';
import { generateLegacySchemas } from './schemas';
import { generateLegacyServices } from './services';
import { generateLegacyTransformers } from './transformers';
import { generateLegacyTypes } from './types';

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
  openApi: OpenApi;
  templates: Templates;
}): Promise<void> => {
  const config = getConfig();

  // TODO: parser - move to config.input
  if (client) {
    if (config.services.include && config.services.asClass) {
      const regexp = new RegExp(config.services.include);
      client.services = client.services.filter((service) =>
        regexp.test(service.name),
      );
    }

    if (config.types.include) {
      const regexp = new RegExp(config.types.include);
      client.models = client.models.filter((model) => regexp.test(model.name));
    }
  }

  const outputPath = path.resolve(config.output.path);

  const files: Files = {};

  if (!isLegacyClient(config) && config.client.bundle) {
    await generateClientBundle({ name: config.client.name, outputPath });
  }

  // types.gen.ts
  await generateLegacyTypes({ client, files });

  // schemas.gen.ts
  await generateLegacySchemas({ files, openApi });

  // transformers
  if (
    config.services.export &&
    client.services.length &&
    config.types.dates === 'types+transform'
  ) {
    await generateLegacyTransformers({
      client,
      onNode: (node) => {
        files.types?.add(node);
      },
      onRemoveNode: () => {
        files.types?.removeNode();
      },
    });
  }

  // services.gen.ts
  await generateLegacyServices({ client, files });

  // deprecated files
  await generateLegacyClientClass(openApi, outputPath, client, templates);
  await generateLegacyCore(
    path.resolve(config.output.path, 'core'),
    client,
    templates,
  );

  // TODO: parser - remove after moving types, services, transformers, and schemas into plugin
  // index.ts. Any files generated after this won't be included in exports
  // from the index file.
  generateIndexFile({ files });

  // plugins
  await generateLegacyPlugins({ client, files });

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

  // types.gen.ts
  generateTypes({ context });

  // schemas.gen.ts
  generateSchemas({ context });

  // transformers
  if (
    context.config.services.export &&
    // client.services.length &&
    context.config.types.dates === 'types+transform'
  ) {
    // await generateLegacyTransformers({
    //   client,
    //   onNode: (node) => {
    //     files.types?.add(node);
    //   },
    //   onRemoveNode: () => {
    //     files.types?.removeNode();
    //   },
    // });
  }

  // services.gen.ts
  generateServices({ context });

  // TODO: parser - remove after moving types, services, transformers, and schemas into plugin
  // index.ts. Any files generated after this won't be included in exports
  // from the index file.
  generateIndexFile({ files: context.files });

  // plugins
  for (const plugin of context.config.plugins) {
    plugin.handler({
      context,
      plugin: plugin as never,
    });
  }

  Object.entries(context.files).forEach(([name, file]) => {
    if (context.config.dryRun) {
      return;
    }

    if (name === 'index') {
      file.write();
    } else {
      file.write('\n\n');
    }
  });
};
