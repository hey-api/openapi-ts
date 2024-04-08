import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { OpenApi } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { getHttpRequestName } from '../getHttpRequestName';
import type { Templates } from '../handlebars';
import { sortByName } from '../sort';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param client Client containing models, schemas, and services
 * @param outputPath Directory to write the generated files to
 * @param config {@link Config} passed to the `createClient()` method
 * @param templates The loaded handlebar templates
 */
export const writeClientClass = async (
    openApi: OpenApi,
    client: Client,
    outputPath: string,
    config: Config,
    templates: Templates
): Promise<void> => {
    const templateResult = templates.client({
        $config: config,
        ...client,
        httpRequest: getHttpRequestName(config.client),
        models: sortByName(client.models),
        services: sortByName(client.services),
    });

    await writeFileSync(path.resolve(outputPath, `${config.name}.ts`), templateResult);
};
