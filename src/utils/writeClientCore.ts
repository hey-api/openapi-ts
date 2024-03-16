import Path from 'path';

import type { Client } from '../client/interfaces/Client';
import type { Options } from '../client/interfaces/Options';
import { copyFile, exists, writeFile } from './fileSystem';
import { getHttpRequestName } from './getHttpRequestName';
import type { Templates } from './registerHandlebarTemplates';

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param options Options passed to the `generate()` function
 */
export const writeClientCore = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    options: Pick<Required<Options>, 'httpClient' | 'serviceResponse'> & Omit<Options, 'httpClient' | 'serviceResponse'>
): Promise<void> => {
    const { clientName, httpClient, request, serviceResponse } = options;
    const httpRequest = getHttpRequestName(httpClient);
    const context = {
        clientName,
        httpClient,
        httpRequest,
        server: options.base !== undefined ? options.base : client.server,
        serviceResponse,
        version: client.version,
    };

    await writeFile(Path.resolve(outputPath, 'OpenAPI.ts'), templates.core.settings(context));
    await writeFile(Path.resolve(outputPath, 'ApiError.ts'), templates.core.apiError(context));
    await writeFile(Path.resolve(outputPath, 'ApiRequestOptions.ts'), templates.core.apiRequestOptions(context));
    await writeFile(Path.resolve(outputPath, 'ApiResult.ts'), templates.core.apiResult(context));
    await writeFile(Path.resolve(outputPath, 'CancelablePromise.ts'), templates.core.cancelablePromise(context));
    await writeFile(Path.resolve(outputPath, 'request.ts'), templates.core.request(context));
    await writeFile(Path.resolve(outputPath, 'types.ts'), templates.core.types(context));

    if (clientName) {
        await writeFile(Path.resolve(outputPath, 'BaseHttpRequest.ts'), templates.core.baseHttpRequest(context));
        await writeFile(Path.resolve(outputPath, `${httpRequest}.ts`), templates.core.httpRequest(context));
    }

    if (request) {
        const requestFile = Path.resolve(process.cwd(), request);
        const requestFileExists = await exists(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        await copyFile(requestFile, Path.resolve(outputPath, 'request.ts'));
    }
};
