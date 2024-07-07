import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import { TypeScriptFile } from '../compiler';
import type { OpenApi } from '../openApi';
import type { Client } from '../types/client';
import { getConfig } from '../utils/config';
import type { Templates } from '../utils/handlebars';
import { generateClientClass } from './class';
import { generateCore } from './core';
import { generateIndexFile } from './indexFile';
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

  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }

  const files: Record<string, TypeScriptFile> = {
    index: new TypeScriptFile({
      dir: config.output.path,
      name: 'index.ts',
    }),
  };
  if (config.schemas.export) {
    files.schemas = new TypeScriptFile({
      dir: config.output.path,
      name: 'schemas.ts',
    });
  }
  if (config.services.export) {
    files.services = new TypeScriptFile({
      dir: config.output.path,
      name: 'services.ts',
    });
  }
  if (config.types.export) {
    files.types = new TypeScriptFile({
      dir: config.output.path,
      name: 'types.ts',
    });
  }

  // types.gen.ts
  await generateTypes({ client, files });

  // schemas.gen.ts
  await generateSchemas({ file: files.schemas, openApi });

  // transformers
  if (
    files.services &&
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

  // index.ts
  await generateIndexFile({ files });

  files.schemas?.write('\n\n');
  files.services?.write('\n\n');
  files.types?.write('\n\n');
  files.index.write();
};
