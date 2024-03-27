import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import type { Templates } from '../handlebars';
import { sortByName } from '../sort';

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param config {@link Config} passed to the `createClient()` method
 */
export const writeClientSchemas = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    config: Config
): Promise<void> => {
    // Generate file for each models schema.
    for (const model of client.models) {
        const file = path.resolve(outputPath, `$${model.name}.ts`);
        const templateResult = templates.exports.schema({
            $config: config,
            ...model,
        });
        await writeFileSync(file, templateResult);
    }
    // Generate index file exporting all generated schema files.
    const file = path.resolve(outputPath, 'index.ts');
    const content = sortByName(client.models).map(model => `export { $${model.name} } from './$${model.name}';`);
    const result = [config.header, content.join('\n')].filter(Boolean).join('\n');

    await writeFileSync(file, result);
};
