import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Client } from '../../client/interfaces/Client';
import type { Config } from '../../node';
import { Templates } from '../registerHandlebarTemplates';
import { sortByName } from '../sortByName';

/**
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param options Options passed to the `generate()` function
 */
export const writeClientIndex = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    options: Pick<
        Required<Config>,
        | 'enums'
        | 'exportCore'
        | 'exportServices'
        | 'exportModels'
        | 'exportSchemas'
        | 'postfixServices'
        | 'postfixModels'
    > &
        Pick<Config, 'clientName'>
): Promise<void> => {
    const templateResult = templates.index({
        $config: options,
        models: sortByName(client.models),
        server: client.server,
        services: sortByName(client.services),
        version: client.version,
    });

    await writeFileSync(path.resolve(outputPath, 'index.ts'), templateResult);
};
