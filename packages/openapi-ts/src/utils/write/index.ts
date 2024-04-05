import { writeFileSync } from 'node:fs';
import path from 'node:path';

import compiler from '../../compiler';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';

/**
 * Generate the OpenAPI client index file and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone.
 * @param client Client containing models, schemas, and services
 * @param outputPath Directory to write the generated files to
 * @param config {@link Config} passed to the `createClient()` method
 */
export const writeClientIndex = async (client: Client, outputPath: string, config: Config): Promise<void> => {
    const lines: string[] = [];
    if (config.name) {
        lines.push(compiler.export.named([config.name], `./${config.name}`));
    }
    if (config.exportCore) {
        lines.push(compiler.export.named('ApiError', './core/ApiError'));
        if (config.name) {
            lines.push(compiler.export.named('BaseHttpRequest', './core/BaseHttpRequest'));
        }
        if (config.client !== 'angular') {
            lines.push(compiler.export.named(['CancelablePromise', 'CancelError'], './core/CancelablePromise'));
        }
        lines.push(compiler.export.named(['OpenAPI', { isTypeOnly: true, name: 'OpenAPIConfig' }], './core/OpenAPI'));
    }
    if (client.models.length) {
        if (config.exportModels) {
            lines.push(compiler.export.all('./models'));
        }
        if (config.exportSchemas) {
            lines.push(compiler.export.all('./schemas'));
        }
    }
    if (client.services.length && config.exportServices) {
        lines.push(compiler.export.all('./services'));
    }
    await writeFileSync(path.resolve(outputPath, 'index.ts'), lines.join('\n'));
};
