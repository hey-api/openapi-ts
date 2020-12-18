import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../HttpClient';
import { copyFile, exists, writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param request: Path to custom request file
 */
export async function writeClientCore(client: Client, templates: Templates, outputPath: string, httpClient: HttpClient, request?: string): Promise<void> {
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
    };

    await writeFile(resolve(outputPath, 'OpenAPI.ts'), templates.core.settings(context));
    await writeFile(resolve(outputPath, 'ApiError.ts'), templates.core.apiError({}));
    await writeFile(resolve(outputPath, 'ApiRequestOptions.ts'), templates.core.apiRequestOptions({}));
    await writeFile(resolve(outputPath, 'ApiResult.ts'), templates.core.apiResult({}));
    await writeFile(resolve(outputPath, 'request.ts'), templates.core.request(context));

    if (request) {
        const requestFile = resolve(process.cwd(), request);
        const requestFileExists = await exists(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        await copyFile(requestFile, resolve(outputPath, 'request.ts'));
    }
}
