import path from 'node:path';

import { loadConfig } from 'c12';
import { sync } from 'cross-spawn';

import { generateOutput } from './generate/output';
import { parse } from './openApi';
import type { Client } from './types/client';
import type { ClientConfig, Config, UserConfig } from './types/config';
import { getConfig, isStandaloneClient, setConfig } from './utils/config';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { registerHandlebarTemplates } from './utils/handlebars';
import { postProcessClient } from './utils/postprocess';

type OutputProcesser = {
  args: (path: string) => ReadonlyArray<string>;
  command: string;
  name: string;
};

/**
 * Map of supported formatters
 */
const formatters: Record<
  Extract<Config['output']['format'], string>,
  OutputProcesser
> = {
  biome: {
    args: (path) => ['format', '--write', path],
    command: 'biome',
    name: 'Biome (Format)',
  },
  prettier: {
    args: (path) => [
      '--ignore-unknown',
      path,
      '--write',
      '--ignore-path',
      './.prettierignore',
    ],
    command: 'prettier',
    name: 'Prettier',
  },
};

/**
 * Map of supported linters
 */
const linters: Record<
  Extract<Config['output']['lint'], string>,
  OutputProcesser
> = {
  biome: {
    args: (path) => ['lint', '--apply', path],
    command: 'biome',
    name: 'Biome (Lint)',
  },
  eslint: {
    args: (path) => [path, '--fix'],
    command: 'eslint',
    name: 'ESLint',
  },
};

const processOutput = () => {
  const config = getConfig();

  if (config.output.format) {
    const module = formatters[config.output.format];
    console.log(`✨ Running ${module.name}`);
    sync(module.command, module.args(config.output.path));
  }

  if (config.output.lint) {
    const module = linters[config.output.lint];
    console.log(`✨ Running ${module.name}`);
    sync(module.command, module.args(config.output.path));
  }
};

const logClientMessage = () => {
  const { client } = getConfig();
  switch (client) {
    case 'angular':
      return console.log('✨ Creating Angular client');
    case '@hey-api/client-axios':
    case 'axios':
      return console.log('✨ Creating Axios client');
    case '@hey-api/client-fetch':
    case 'fetch':
      return console.log('✨ Creating Fetch client');
    case 'node':
      return console.log('✨ Creating Node.js client');
    case 'xhr':
      return console.log('✨ Creating XHR client');
  }
};

const getOutput = (userConfig: ClientConfig): Config['output'] => {
  let output: Config['output'] = {
    format: false,
    lint: false,
    path: '',
  };
  if (typeof userConfig.output === 'string') {
    output.path = userConfig.output;
  } else {
    output = {
      ...output,
      ...userConfig.output,
    };
  }
  return output;
};

const getPlugins = (userConfig: ClientConfig): Config['plugins'] => {
  const plugins: Config['plugins'] = (userConfig.plugins ?? []).map(
    (plugin) => {
      if (typeof plugin === 'string') {
        return {
          name: plugin,
        };
      }
      return plugin;
    },
  );
  return plugins;
};

const getSchemas = (userConfig: ClientConfig): Config['schemas'] => {
  let schemas: Config['schemas'] = {
    export: true,
    type: 'json',
  };
  if (typeof userConfig.schemas === 'boolean') {
    schemas.export = userConfig.schemas;
  } else {
    schemas = {
      ...schemas,
      ...userConfig.schemas,
    };
  }
  return schemas;
};

const getServices = (userConfig: ClientConfig): Config['services'] => {
  let services: Config['services'] = {
    asClass: false,
    export: true,
    name: '{{name}}Service',
    operationId: true,
    response: 'body',
  };
  if (typeof userConfig.services === 'boolean') {
    services.export = userConfig.services;
  } else if (typeof userConfig.services === 'string') {
    services.include = userConfig.services;
  } else {
    services = {
      ...services,
      ...userConfig.services,
    };
  }
  return services;
};

const getTypes = (userConfig: ClientConfig): Config['types'] => {
  let types: Config['types'] = {
    dates: false,
    enums: false,
    export: true,
    name: 'preserve',
    tree: true,
  };
  if (typeof userConfig.types === 'boolean') {
    types.export = userConfig.types;
  } else if (typeof userConfig.types === 'string') {
    types.include = userConfig.types;
  } else {
    types = {
      ...types,
      ...userConfig.types,
    };
  }
  return types;
};

const initConfigs = async (userConfig: UserConfig): Promise<Config[]> => {
  let configurationFile: string | undefined = undefined;
  if (userConfig.configFile) {
    const parts = userConfig.configFile.split('.');
    configurationFile = parts.slice(0, parts.length - 1).join('.');
  }

  const { config: configFromFile } = await loadConfig<UserConfig>({
    configFile: configurationFile,
    jitiOptions: {
      esmResolve: true,
    },
    name: 'openapi-ts',
  });

  const userConfigs: ClientConfig[] = Array.isArray(userConfig)
    ? userConfig
    : Array.isArray(configFromFile)
      ? configFromFile.map((config) => ({
          ...config,
          ...userConfig,
        }))
      : [{ ...(configFromFile ?? {}), ...userConfig }];

  return userConfigs.map((userConfig) => {
    const {
      base,
      client = 'fetch',
      configFile = '',
      debug = false,
      dryRun = false,
      exportCore = true,
      input,
      name,
      request,
      useOptions = true,
    } = userConfig;

    if (debug) {
      console.warn('userConfig:', userConfig);
    }

    const output = getOutput(userConfig);

    if (!input) {
      throw new Error(
        '🚫 input not provided - provide path to OpenAPI specification',
      );
    }

    if (!output.path) {
      throw new Error(
        '🚫 output not provided - provide path where we should generate your client',
      );
    }

    if (!useOptions) {
      console.warn(
        '⚠️ Deprecation warning: useOptions set to false. This setting will be removed in future versions. Please migrate useOptions to true https://heyapi.vercel.app/openapi-ts/migrating.html#v0-27-38',
      );
    }

    const plugins = getPlugins(userConfig);
    const schemas = getSchemas(userConfig);
    const services = getServices(userConfig);
    const types = getTypes(userConfig);

    output.path = path.resolve(process.cwd(), output.path);

    return setConfig({
      base,
      client,
      configFile,
      debug,
      dryRun,
      exportCore: isStandaloneClient(client) ? false : exportCore,
      input,
      name,
      output,
      plugins,
      request,
      schemas,
      services,
      types,
      useOptions,
    });
  });
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param userConfig {@link UserConfig} passed to the `createClient()` method
 */
export async function createClient(userConfig: UserConfig): Promise<Client[]> {
  const configs = await initConfigs(userConfig);

  const createClientPromise = (config: Config) => async () => {
    const openApi =
      typeof config.input === 'string'
        ? await getOpenApiSpec(config.input)
        : (config.input as unknown as Awaited<
            ReturnType<typeof getOpenApiSpec>
          >);

    const client = postProcessClient(parse(openApi));
    const templates = registerHandlebarTemplates();

    if (!config.dryRun) {
      logClientMessage();
      await generateOutput(openApi, client, templates);
      processOutput();
    }

    console.log('✨ Done! Your client is located in:', config.output.path);

    return client;
  };

  let clients: Client[] = [];
  const clientPromises = configs.map((config) => createClientPromise(config));
  for (const clientPromise of clientPromises) {
    const client = await clientPromise();
    clients = [...clients, client];
  }
  return clients;
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
