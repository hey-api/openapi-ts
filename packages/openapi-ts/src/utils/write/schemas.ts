import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import type { Templates } from '../handlebars';

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
    // Dont create empty file
    if (client.models.length === 0) {
        return;
    }
    // Generate file with all schemas
    const results: string[] = [];
    for (const model of client.models) {
        const result = templates.exports.schema({
            $config: config,
            ...model,
        });
        results.push(result);
    }
    const file = path.resolve(outputPath, 'schemas.ts');
    await writeFileSync(file, results.join('\n\n'));
};
