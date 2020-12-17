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
 */
export async function writeClientCore(client: Client, templates: Templates, outputPath: string, httpClient: string | HttpClient): Promise<void> {
    const context = {
        httpClient,
        server: client.server,
        version: client.version,
    };

    await writeFile(resolve(outputPath, 'OpenAPI.ts'), templates.core.settings(context));
    await writeFile(resolve(outputPath, 'ApiError.ts'), templates.core.apiError({}));
    await writeFile(resolve(outputPath, 'ApiRequestOptions.ts'), templates.core.apiRequestOptions({}));
    await writeFile(resolve(outputPath, 'ApiResult.ts'), templates.core.apiResult({}));

    switch (httpClient) {
        case HttpClient.FETCH:
        case HttpClient.XHR:
        case HttpClient.NODE:
            await writeFile(resolve(outputPath, 'request.ts'), templates.core.request(context));
            break;
        default:
            const customRequestFile = resolve(process.cwd(), httpClient);
            const customRequestFileExists = await exists(customRequestFile);
            if (!customRequestFileExists) {
                throw new Error(`Custom request file "${customRequestFile}" does not exists`);
            }
            await copyFile(customRequestFile, resolve(outputPath, 'request.ts'));
            break;
    }
}
