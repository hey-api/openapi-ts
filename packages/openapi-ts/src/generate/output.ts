import path from 'node:path';

import type { OpenApi } from '../openApi';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig } from '../utils/config';
import type { Templates } from '../utils/handlebars';
import { generateClientClass } from './class';
import { generateClient } from './client';
import { generateCore } from './core';
import { generateIndexFile } from './indexFile';
import { generatePlugins } from './plugins';
import { generateSchemas } from './schemas';
import { generateServices } from './services';
import { generateResponseTransformers } from './transformers';
import { generateTypes } from './types';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param client Client containing models, schemas, and services
 * @param templates Templates wrapper with all loaded Handlebars templates
 */
export const generateOutput = async (
  openApi: OpenApi,
  client: Client,
  templates: Templates,
): Promise<void> => {
  const config = getConfig();

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

  const outputPath = path.resolve(config.output.path);

  const files: Files = {};

  await generateClient(outputPath, config.client.name);

  // types.gen.ts
  await generateTypes({ client, files });

  // schemas.gen.ts
  await generateSchemas({ files, openApi });

  // transformers
  if (
    config.services.export &&
    client.services.length &&
    config.types.dates === 'types+transform'
  ) {
    await generateResponseTransformers({
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
  await generateServices({ client, files });

  // deprecated files
  await generateClientClass(openApi, outputPath, client, templates);
  await generateCore(
    path.resolve(config.output.path, 'core'),
    client,
    templates,
  );

  // index.ts. Any files generated after this won't be included in exports
  // from the index file.
  await generateIndexFile({ files });

  // plugins
  await generatePlugins({ client, files });

  Object.entries(files).forEach(([name, file]) => {
    if (name === 'index') {
      file.write();
    } else {
      file.write('\n\n');
    }
  });
};
