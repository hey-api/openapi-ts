import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { sync } from 'cross-spawn';

import { parse as parseV2 } from './openApi/v2';
import { parse as parseV3 } from './openApi/v3';
import type { Config, UserConfig } from './types/config';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { registerHandlebarTemplates } from './utils/handlebars';
import { postProcessClient } from './utils/postProcessClient';
import { writeClient } from './utils/write/client';

type Dependencies = Record<string, unknown>;

// const configFiles = ['openapi-ts.config.js', 'openapi-ts.config.ts'];
// add support for `openapi-ts.config.ts`
const configFiles = ['openapi-ts.config.js'];

export const parseOpenApiSpecification = (openApi: Awaited<ReturnType<typeof getOpenApiSpec>>, options: Config) => {
    if ('swagger' in openApi) {
        return parseV2(openApi, options);
    }
    if ('openapi' in openApi) {
        return parseV3(openApi, options);
    }
    throw new Error(`Unsupported Open API specification: ${JSON.stringify(openApi, null, 2)}`);
};

const formatClient = (options: Config, dependencies: Dependencies) => {
    if (!options.autoformat) {
        return;
    }

    if (dependencies.prettier) {
        console.log('✨ Running Prettier');
        sync('prettier', ['--ignore-unknown', options.output, '--write', '--ignore-path', './.prettierignore']);
    }
};

const inferClient = (dependencies: Dependencies): Config['client'] => {
    if (dependencies['@angular/cli']) {
        return 'angular';
    }
    if (dependencies.axios) {
        return 'axios';
    }
    return 'fetch';
};

const logClientMessage = (client: Config['client']) => {
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

const getConfigFromFile = async (): Promise<UserConfig | undefined> => {
    const configPath = configFiles
        .map(file => pathToFileURL(path.resolve(process.cwd(), file)))
        .find(filePath => existsSync(filePath));
    if (!configPath) {
        return;
    }
    // @ts-ignore
    const exported = await import(configPath);
    return exported.default as UserConfig;
};

const getConfig = async (userConfig: UserConfig, dependencies: Dependencies) => {
    const userConfigFromFile = await getConfigFromFile();
    if (userConfigFromFile) {
        userConfig = { ...userConfig, ...userConfigFromFile };
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
    } = userConfig;

    const client = userConfig.client || inferClient(dependencies);

    const config: Config = {
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

    return config;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param userConfig {@link UserConfig} passed to the generate method
 */
export const generate = async (userConfig: UserConfig): Promise<void> => {
    const pkg = JSON.parse(readFileSync(path.resolve(process.cwd(), 'package.json')).toString());

    const dependencies = [pkg.dependencies, pkg.devDependencies].reduce(
        (res, deps) => ({
            ...res,
            ...deps,
        }),
        {}
    );

    const config = await getConfig(userConfig, dependencies);

    const openApi =
        typeof config.input === 'string'
            ? await getOpenApiSpec(config.input)
            : (config.input as unknown as Awaited<ReturnType<typeof getOpenApiSpec>>);

    const client = postProcessClient(parseOpenApiSpecification(openApi, config));
    const templates = registerHandlebarTemplates(config, client);

    if (config.write) {
        logClientMessage(config.client);
        await writeClient(client, templates, config);
        formatClient(config, dependencies);
    }

    console.log('✨ Done! Your client is located in:', config.output);
};

export default {
    generate,
};
