import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { sync } from 'cross-spawn';

import type { Config } from './node';
import { parse as parseV2 } from './openApi/v2';
import { parse as parseV3 } from './openApi/v3';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/write/client';

type DefaultOptions = Omit<Required<Config>, 'base' | 'clientName' | 'request'> &
    Pick<Config, 'base' | 'clientName' | 'request'>;

type Dependencies = Record<string, unknown>;

// const configFiles = ['openapi-ts.config.js', 'openapi-ts.config.ts'];
// add support for `openapi-ts.config.ts`
const configFiles = ['openapi-ts.config.js'];

export const parseOpenApiSpecification = (
    openApi: Awaited<ReturnType<typeof getOpenApiSpec>>,
    options: DefaultOptions
) => {
    if ('swagger' in openApi) {
        return parseV2(openApi, options);
    }
    if ('openapi' in openApi) {
        return parseV3(openApi, options);
    }
    throw new Error(`Unsupported Open API specification: ${JSON.stringify(openApi, null, 2)}`);
};

const formatClient = (options: DefaultOptions, dependencies: Dependencies) => {
    if (!options.autoformat) {
        return;
    }

    if (dependencies.prettier) {
        console.log('✨ Running Prettier');
        sync('prettier', ['--ignore-unknown', options.output, '--write', '--ignore-path', './.prettierignore']);
    }
};

const inferClient = (dependencies: Dependencies): DefaultOptions['client'] => {
    if (dependencies['@angular/cli']) {
        return 'angular';
    }
    if (dependencies.axios) {
        return 'axios';
    }
    return 'fetch';
};

const logClientMessage = (client: DefaultOptions['client']) => {
    switch (client) {
        case 'angular':
            return console.log('✨ Creating Angular client');
        case 'axios':
            return console.log('✨ Creating Axios client');
        case 'fetch':
            return console.log('✨ Creating Fetch client');
        case 'node':
            return console.log('✨ Creating Node.js client');
        case 'xhr':
            return console.log('✨ Creating XHR client');
    }
};

const getOptionsFromConfig = async (): Promise<Config | undefined> => {
    const configPath = configFiles
        .map(file => path.resolve(process.cwd(), file))
        .find(filePath => existsSync(filePath));
    if (!configPath) {
        return;
    }
    const exported = await import(configPath);
    return exported.default as Config;
};

const getOptions = async (options: Config, dependencies: Dependencies) => {
    const configOptions = await getOptionsFromConfig();
    if (configOptions) {
        options = { ...options, ...configOptions };
    }

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

    const client = options.client || inferClient(dependencies);

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

    if (!input) {
        throw new Error('🚫 input not provided - provide path to OpenAPI specification');
    }

    if (!output) {
        throw new Error('🚫 output not provided - provide path where we should generate your client');
    }

    return defaultOptions;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param options Options passed to the generate method
 */
export const generate = async (options: Config): Promise<void> => {
    const pkg = JSON.parse(readFileSync(path.resolve(process.cwd(), 'package.json')).toString());

    const dependencies = [pkg.dependencies, pkg.devDependencies].reduce(
        (res, deps) => ({
            ...res,
            ...deps,
        }),
        {}
    );

    const config = await getOptions(options, dependencies);

    const openApi =
        typeof config.input === 'string'
            ? await getOpenApiSpec(config.input)
            : (config.input as unknown as Awaited<ReturnType<typeof getOpenApiSpec>>);
    const templates = registerHandlebarTemplates(openApi, config);

    const parsedClient = parseOpenApiSpecification(openApi, config);
    const finalClient = postProcessClient(parsedClient);

    if (config.write) {
        logClientMessage(config.client);
        await writeClient(finalClient, templates, config);
        formatClient(config, dependencies);
    }

    console.log('✨ Done! Your client is located in:', config.output);
};

export default {
    generate,
};
