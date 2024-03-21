import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import type { Templates } from '../handlebars';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param config {@link Config} passed to the `createClient()` method
 */
export const writeClientServices = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    config: Config
): Promise<void> => {
    for (const service of client.services) {
        const file = path.resolve(outputPath, `${service.name}${config.postfixServices}.ts`);
        const templateResult = templates.exports.service({
            $config: config,
            ...service,
        });
        await writeFileSync(file, templateResult);
    }
};
