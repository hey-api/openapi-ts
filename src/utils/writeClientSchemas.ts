import { resolve } from 'path';

import type { Model } from '../client/interfaces/Model';
import type { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import type { Templates } from './registerHandlebarTemplates';

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 */
export const writeClientSchemas = async (
    models: Model[],
    templates: Templates,
    outputPath: string,
    httpClient: HttpClient
): Promise<void> => {
    for (const model of models) {
        const file = resolve(outputPath, `$${model.name}.ts`);
        const templateResult = templates.exports.schema({
            ...model,
            httpClient,
        });
        await writeFile(file, templateResult);
    }
};
