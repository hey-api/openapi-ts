import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { OpenApi } from '../openApi';
import type { Client } from '../types/client';
import { getConfig } from '../utils/config';
import { getHttpRequestName } from '../utils/getHttpRequestName';
import type { Templates } from '../utils/handlebars';
import { sortByName } from '../utils/sort';
import { ensureDirSync } from './utils';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 */
export const generateClientClass = async (
  openApi: OpenApi,
  outputPath: string,
  client: Client,
  templates: Templates,
) => {
  const config = getConfig();

  const templateResult = templates.client({
    $config: config,
    ...client,
    httpRequest: getHttpRequestName(config.client),
    models: sortByName(client.models),
    services: sortByName(client.services),
  });

  if (config.name) {
    ensureDirSync(outputPath);
    writeFileSync(
      path.resolve(outputPath, `${config.name}.ts`),
      templateResult,
    );
  }
};
