import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { sync } from 'cross-spawn';

import { parse } from './openApi';
import type { Client } from './types/client';
import type { Config, UserConfig } from './types/config';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { registerHandlebarTemplates } from './utils/handlebars';
import { isSubDirectory } from './utils/isSubdirectory';
import { postProcessClient } from './utils/postprocess';
import { writeClient } from './utils/write/client';

type Dependencies = Record<string, unknown>;

// TODO: add support for `openapi-ts.config.ts`
const configFiles = ['openapi-ts.config.js', 'openapi-ts.config.cjs', 'openapi-ts.config.mjs'];

// Mapping of all dependencies used in each client. These should be installed in the generated client package
const clientDependencies: Record<Config['client'], string[]> = {
    angular: ['@angular/common', '@angular/core', 'rxjs'],
    axios: ['axios'],
    fetch: [],
    node: ['node-fetch'],
    xhr: [],
};

const processOutput = (config: Config, dependencies: Dependencies) => {
    if (config.format) {
        if (dependencies.prettier) {
            console.log('✨ Running Prettier');
            sync('prettier', ['--ignore-unknown', config.output, '--write', '--ignore-path', './.prettierignore']);
        }
    }

    if (config.lint) {
        if (dependencies.eslint) {
            console.log('✨ Running ESLint');
            sync('eslint', [config.output, '--fix', '--quiet', '--ignore-path', './.eslintignore']);
        }
    }
};

const inferClient = (dependencies: Dependencies): Config['client'] => {
    if (Object.keys(dependencies).some(d => d.startsWith('@angular'))) {
        return 'angular';
    }
    if (dependencies.axios) {
        return 'axios';
    }
    if (dependencies['node-fetch']) {
        return 'node';
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

const logMissingDependenciesWarning = (client: Config['client'], dependencies: Dependencies) => {
    const missing = clientDependencies[client].filter(d => dependencies[d] === undefined);
    if (missing.length > 0) {
        console.log('⚠️ Dependencies used in generated client are missing: ' + missing.join(' '));
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
        userConfig = { ...userConfigFromFile, ...userConfig };
    }

    const {
        base,
        debug = false,
        enums = false,
        exportCore = true,
        exportModels = true,
        exportSchemas = true,
        exportServices = true,
        format = true,
        input,
        lint = false,
        name,
        operationId = true,
        postfixModels = '',
        postfixServices = 'Service',
        request,
        serviceResponse = 'body',
        useDateType = false,
        useOptions = true,
        write = true,
    } = userConfig;

    if (debug) {
        console.log('userConfig:', userConfig);
    }

    if (!input) {
        throw new Error('🚫 input not provided - provide path to OpenAPI specification');
    }

    if (!userConfig.output) {
        throw new Error('🚫 output not provided - provide path where we should generate your client');
    }

    if (!isSubDirectory(process.cwd(), userConfig.output)) {
        throw new Error('🚫 output must be within the current working directory');
    }

    if (!useOptions) {
        console.warn(
            '⚠️ Deprecation warning: useOptions set to false. This setting will be removed in future versions. Please migrate useOptions to true https://github.com/hey-api/openapi-ts#v0.27.38'
        );
    }

    const client = userConfig.client || inferClient(dependencies);
    const output = path.resolve(process.cwd(), userConfig.output);

    const config: Config = {
        base,
        client,
        debug,
        enums,
        exportCore,
        exportModels,
        exportSchemas,
        exportServices,
        format,
        input,
        lint,
        name,
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

    return config;
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param userConfig {@link UserConfig} passed to the `createClient()` method
 */
export async function createClient(userConfig: UserConfig): Promise<Client> {
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

    const client = postProcessClient(parse(openApi, config));
    const templates = registerHandlebarTemplates(config, client);

    if (config.write) {
        logClientMessage(config.client);
        logMissingDependenciesWarning(config.client, dependencies);
        await writeClient(client, templates, config);
        processOutput(config, dependencies);
    }

    console.log('✨ Done! Your client is located in:', config.output);

    return client;
}

/**
 * Type helper for openapi-ts.config.ts, returns {@link UserConfig} object
 */
export function defineConfig(config: UserConfig): UserConfig {
    return config;
}

export default {
    createClient,
    defineConfig,
};
