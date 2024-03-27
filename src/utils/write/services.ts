import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import type { Templates } from '../handlebars';
import { sortByName } from '../sort';

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
    // Generate file for each service.
    for (const service of client.services) {
        const file = path.resolve(outputPath, `${service.name}${config.postfixServices}.ts`);
        const templateResult = templates.exports.service({
            $config: config,
            ...service,
        });
        await writeFileSync(file, templateResult);
    }
    // Generate index file exporting all generated service files.
    const file = path.resolve(outputPath, 'index.ts');
    const content = sortByName(client.services).map(
        service =>
            `export { ${service.name}${config.postfixServices} } from './${service.name}${config.postfixServices}'`
    );
    const result = [config.header, content.join('\n')].filter(Boolean).join('\n');

    await writeFileSync(file, result);
};
