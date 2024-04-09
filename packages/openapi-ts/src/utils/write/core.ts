import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { OpenApi } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { getHttpRequestName } from '../getHttpRequestName';
import type { Templates } from '../handlebars';

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 * @param config {@link Config} passed to the `createClient()` method
 * @param templates The loaded handlebar templates
 */
export const writeClientCore = async (
    openApi: OpenApi,
    outputPath: string,
    client: Client,
    config: Config,
    templates: Templates
): Promise<void> => {
    const context = {
        httpRequest: getHttpRequestName(config.client),
        server: config.base !== undefined ? config.base : client.server,
        version: client.version,
    };

    await writeFileSync(
        path.resolve(outputPath, 'OpenAPI.ts'),
        templates.core.settings({
            $config: config,
            ...context,
        })
    );
    await writeFileSync(
        path.resolve(outputPath, 'ApiError.ts'),
        templates.core.apiError({
            $config: config,
            ...context,
        })
    );
    await writeFileSync(
        path.resolve(outputPath, 'ApiRequestOptions.ts'),
        templates.core.apiRequestOptions({
            $config: config,
            ...context,
        })
    );
    await writeFileSync(
        path.resolve(outputPath, 'ApiResult.ts'),
        templates.core.apiResult({
            $config: config,
            ...context,
        })
    );
    if (config.client !== 'angular') {
        await writeFileSync(
            path.resolve(outputPath, 'CancelablePromise.ts'),
            templates.core.cancelablePromise({
                $config: config,
                ...context,
            })
        );
    }
    await writeFileSync(
        path.resolve(outputPath, 'request.ts'),
        templates.core.request({
            $config: config,
            ...context,
        })
    );

    if (config.name) {
        await writeFileSync(
            path.resolve(outputPath, 'BaseHttpRequest.ts'),
            templates.core.baseHttpRequest({
                $config: config,
                ...context,
            })
        );
        await writeFileSync(
            path.resolve(outputPath, `${context.httpRequest}.ts`),
            templates.core.httpRequest({
                $config: config,
                ...context,
            })
        );
    }

    if (config.request) {
        const requestFile = path.resolve(process.cwd(), config.request);
        const requestFileExists = await existsSync(requestFile);
        if (!requestFileExists) {
            throw new Error(`Custom request file "${requestFile}" does not exists`);
        }
        await copyFileSync(requestFile, path.resolve(outputPath, 'request.ts'));
    }
};
