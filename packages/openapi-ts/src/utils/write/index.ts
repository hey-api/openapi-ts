import path from 'node:path';

import { compiler, TypeScriptFile } from '../../compiler';
import type { Client } from '../../types/client';
import { getConfig } from '../config';

/**
 * Generate the OpenAPI client index file and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone.
 * @param client Client containing models, schemas, and services
 * @param outputPath Directory to write the generated files to
 */
export const writeClientIndex = async (client: Client, outputPath: string): Promise<void> => {
    const config = getConfig();

    const fileIndex = new TypeScriptFile(path.resolve(outputPath, 'index.ts'));

    if (config.name) {
        fileIndex.add(compiler.export.named([config.name], `./${config.name}`));
    }

    if (config.exportCore) {
        fileIndex.add(compiler.export.named('ApiError', './core/ApiError'));
        if (config.serviceResponse === 'response') {
            fileIndex.add(compiler.export.named({ isTypeOnly: true, name: 'ApiResult' }, './core/ApiResult'));
        }
        if (config.name) {
            fileIndex.add(compiler.export.named('BaseHttpRequest', './core/BaseHttpRequest'));
        }
        if (config.client !== 'angular') {
            fileIndex.add(compiler.export.named(['CancelablePromise', 'CancelError'], './core/CancelablePromise'));
        }
        fileIndex.add(
            compiler.export.named(['OpenAPI', { isTypeOnly: true, name: 'OpenAPIConfig' }], './core/OpenAPI')
        );
    }

    if (client.models.length) {
        if (config.exportModels) {
            fileIndex.add(compiler.export.all('./models'));
        }
        if (config.schemas) {
            fileIndex.add(compiler.export.all('./schemas'));
        }
    }

    if (client.services.length && config.exportServices) {
        fileIndex.add(compiler.export.all('./services'));
    }

    fileIndex.write();
};
