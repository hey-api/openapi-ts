import { sync } from 'cross-spawn';
import { createRequire } from 'module';
import Path from 'path';

import type { Options } from './client/interfaces/Options';
import { parse as parseV2 } from './openApi/v2';
import { parse as parseV3 } from './openApi/v3';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/write/client';

type DefaultOptions = Omit<Required<Options>, 'base' | 'clientName' | 'request'> &
    Pick<Options, 'base' | 'clientName' | 'request'>;

export const parseOpenApiSpecification = (openApi: Exclude<Options['input'], string>, options: DefaultOptions) => {
    if ('swagger' in openApi) {
        return parseV2(openApi, options);
    }
    if ('openapi' in openApi) {
        return parseV3(openApi, options);
    }
    throw new Error(`Unsupported Open API specification: ${JSON.stringify(openApi, null, 2)}`);
};

const formatClient = (options: DefaultOptions, dependencies: Record<string, unknown>) => {
    if (!options.autoformat) {
        return;
    }

    if (dependencies.prettier) {
        console.log('✨ Running Prettier');
        sync('prettier', ['--ignore-unknown', options.output, '--write', '--ignore-path', './.prettierignore']);
    }
};

const getClientType = (options: Options, dependencies: Record<string, unknown>): DefaultOptions['client'] => {
    let { client } = options;
    if (!client) {
        if (dependencies.axios) {
            client = 'axios';
        }
    }
    switch (client) {
        case 'angular':
            console.log('✨ Creating Angular client');
            return client;
        case 'axios':
            console.log('✨ Creating Axios client');
            return client;
        case 'node':
            console.log('✨ Creating Node.js client');
            return client;
        case 'xhr':
            console.log('✨ Creating XHR client');
            return client;
        case 'fetch':
        default:
            console.log('✨ Creating Fetch client');
            return 'fetch';
    }
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param options Options passed to the generate method
 */
export const generate = async (options: Options): Promise<void> => {
    const pathPackageJson = Path.resolve(process.cwd(), 'package.json');
    const require = createRequire('/');
    const json = require(pathPackageJson);

    const dependencies = [json.dependencies, json.devDependencies].reduce(
        (res, deps) => ({
            ...res,
            ...deps,
        }),
        {}
    );

    const {
        autoformat = true,
        base,
        clientName,
        enums = false,
        exportCore = true,
        exportModels = true,
        exportSchemas = false,
        exportServices = true,
        input,
        operationId = true,
        output,
        postfixModels = '',
        postfixServices = 'Service',
        request,
        serviceResponse = 'body',
        useDateType = false,
        useOptions = false,
        write = true,
    } = options;

    const client = getClientType(options, dependencies);

    const defaultOptions: DefaultOptions = {
        autoformat,
        base,
        client,
        clientName,
        enums,
        exportCore,
        exportModels,
        exportSchemas,
        exportServices,
        input,
        operationId,
        output,
        postfixModels,
        postfixServices,
        request,
        serviceResponse,
        useDateType,
        useOptions,
        write,
    };

    const openApi =
        typeof defaultOptions.input === 'string' ? await getOpenApiSpec(defaultOptions.input) : defaultOptions.input;
    const templates = registerHandlebarTemplates(openApi, defaultOptions);

    const parsedClient = parseOpenApiSpecification(openApi, defaultOptions);
    const finalClient = postProcessClient(parsedClient);

    if (write) {
        await writeClient(finalClient, templates, defaultOptions);
        formatClient(defaultOptions, dependencies);
    }

    console.log('✨ Done! Your client is located in:', output);
};

export default {
    generate,
};
