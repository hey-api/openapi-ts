import { existsSync } from 'node:fs';
import path from 'node:path';

import $RefParser from '@apidevtools/json-schema-ref-parser';
import { loadConfig } from 'c12';
import { sync } from 'cross-spawn';

import { generateLegacyOutput, generateOutput } from './generate/output';
import type { IRContext } from './ir/context';
import { parseExperimental, parseLegacy } from './openApi';
import type { ClientPlugins } from './plugins';
import { defaultPluginConfigs } from './plugins';
import type { DefaultPluginConfigsMap, PluginNames } from './plugins/types';
import type { Client } from './types/client';
import type {
  ClientConfig,
  Config,
  Formatters,
  Linters,
  UserConfig,
} from './types/config';
import { CLIENTS } from './types/config';
import {
  isLegacyClient,
  legacyNameFromConfig,
  setConfig,
} from './utils/config';
import { registerHandlebarTemplates } from './utils/handlebars';
import { Performance, PerformanceReport } from './utils/performance';
import { postProcessClient } from './utils/postprocess';

type OutputProcessor = {
  args: (path: string) => ReadonlyArray<string>;
  command: string;
  name: string;
};

/**
 * Map of supported formatters
 */
const formatters: Record<Formatters, OutputProcessor> = {
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
const linters: Record<Linters, OutputProcessor> = {
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
  oxlint: {
    args: (path) => ['--fix', path],
    command: 'oxlint',
    name: 'oxlint',
  },
};

const processOutput = ({ config }: { config: Config }) => {
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

const logClientMessage = ({ config }: { config: Config }) => {
  switch (config.client.name) {
    case 'legacy/angular':
      return console.log('✨ Creating Angular client');
    case '@hey-api/client-axios':
    case 'legacy/axios':
      return console.log('✨ Creating Axios client');
    case '@hey-api/client-fetch':
    case 'legacy/fetch':
      return console.log('✨ Creating Fetch client');
    case 'legacy/node':
      return console.log('✨ Creating Node.js client');
    case 'legacy/xhr':
      return console.log('✨ Creating XHR client');
  }
};

const getClient = (userConfig: ClientConfig): Config['client'] => {
  let client: Config['client'] = {
    bundle: false,
    name: '' as Config['client']['name'],
  };
  if (typeof userConfig.client === 'string') {
    client.name = userConfig.client;
  } else if (userConfig.client) {
    client = {
      ...client,
      ...userConfig.client,
    };
  }
  return client;
};

const getInput = (userConfig: ClientConfig): Config['input'] => {
  let input: Config['input'] = {
    path: '',
  };
  if (typeof userConfig.input === 'string') {
    input.path = userConfig.input;
  } else if (userConfig.input && userConfig.input.path) {
    input = {
      ...input,
      ...userConfig.input,
    };
  } else {
    input = {
      ...input,
      path: userConfig.input,
    };
  }
  return input;
};

const getOutput = (userConfig: ClientConfig): Config['output'] => {
  let output: Config['output'] = {
    clean: true,
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

const getPluginOrder = ({
  pluginConfigs,
  userPlugins,
}: {
  pluginConfigs: DefaultPluginConfigsMap<ClientPlugins>;
  userPlugins: ReadonlyArray<PluginNames>;
}): Config['pluginOrder'] => {
  const circularReferenceTracker = new Set<PluginNames>();
  const visitedNodes = new Set<PluginNames>();

  const dfs = (name: PluginNames) => {
    if (circularReferenceTracker.has(name)) {
      throw new Error(`Circular reference detected at '${name}'`);
    }

    if (!visitedNodes.has(name)) {
      circularReferenceTracker.add(name);

      const pluginConfig = pluginConfigs[name];

      if (!pluginConfig) {
        throw new Error(
          `🚫 unknown plugin dependency "${name}" - do you need to register a custom plugin with this name?`,
        );
      }

      for (const dependency of pluginConfig._dependencies || []) {
        dfs(dependency);
      }

      for (const dependency of pluginConfig._optionalDependencies || []) {
        if (userPlugins.includes(dependency)) {
          dfs(dependency);
        }
      }

      circularReferenceTracker.delete(name);
      visitedNodes.add(name);
    }
  };

  for (const name of userPlugins) {
    dfs(name);
  }

  return Array.from(visitedNodes);
};

const getPlugins = (
  userConfig: ClientConfig,
): Pick<Config, 'plugins' | 'pluginOrder'> => {
  const userPluginsConfig: Config['plugins'] = {};

  const userPlugins = (
    userConfig.plugins ?? [
      '@hey-api/typescript',
      '@hey-api/schemas',
      '@hey-api/sdk',
    ]
  )
    .map((plugin) => {
      if (typeof plugin === 'string') {
        return plugin;
      }

      if (plugin.name) {
        // @ts-expect-error
        userPluginsConfig[plugin.name] = plugin;
      }

      return plugin.name;
    })
    .filter(Boolean);

  const pluginOrder = getPluginOrder({
    pluginConfigs: {
      ...userPluginsConfig,
      ...defaultPluginConfigs,
    },
    userPlugins,
  });

  const plugins = pluginOrder.reduce(
    (result, name) => {
      const defaultOptions = defaultPluginConfigs[name];
      const userOptions = userPluginsConfig[name];
      if (userOptions && defaultOptions) {
        const nativePluginOption = Object.keys(userOptions).find((key) =>
          key.startsWith('_'),
        );
        if (nativePluginOption) {
          throw new Error(
            `🚫 cannot register plugin "${userOptions.name}" - attempting to override a native plugin option "${nativePluginOption}"`,
          );
        }
      }
      // @ts-expect-error
      result[name] = {
        ...defaultOptions,
        ...userOptions,
      };
      return result;
    },
    {} as Config['plugins'],
  );

  return {
    pluginOrder,
    plugins,
  };
};

const getSpec = async ({ config }: { config: Config }) => {
  let spec: unknown = config.input.path;

  if (typeof config.input.path === 'string') {
    const absolutePathOrUrl = existsSync(config.input.path)
      ? path.resolve(config.input.path)
      : config.input.path;
    spec = await $RefParser.bundle(absolutePathOrUrl);
  }

  return spec;
};

const initConfigs = async (userConfig: UserConfig): Promise<Config[]> => {
  let configurationFile: string | undefined = undefined;
  if (userConfig.configFile) {
    const parts = userConfig.configFile.split('.');
    configurationFile = parts.slice(0, parts.length - 1).join('.');
  }

  const { config: configFromFile } = await loadConfig<UserConfig>({
    configFile: configurationFile,
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
      configFile = '',
      debug = false,
      dryRun = false,
      experimentalParser = false,
      exportCore = true,
      name,
      request,
      useOptions = true,
    } = userConfig;

    if (debug) {
      console.warn('userConfig:', userConfig);
    }

    const input = getInput(userConfig);
    const output = getOutput(userConfig);

    if (!input.path) {
      throw new Error(
        '🚫 missing input - which OpenAPI specification should we use to generate your client?',
      );
    }

    if (!output.path) {
      throw new Error(
        '🚫 missing output - where should we generate your client?',
      );
    }

    const client = getClient(userConfig);

    if (client.name && !CLIENTS.includes(client.name)) {
      throw new Error('🚫 invalid client - select a valid client value');
    }

    if (!useOptions) {
      console.warn(
        '❗️ Deprecation warning: useOptions set to false. This setting will be removed in future versions. Please migrate useOptions to true https://heyapi.dev/openapi-ts/migrating.html#v0-27-38',
      );
    }

    output.path = path.resolve(process.cwd(), output.path);

    const config = setConfig({
      ...getPlugins(userConfig),
      base,
      client,
      configFile,
      debug,
      dryRun,
      experimentalParser,
      exportCore: isLegacyClient(client) ? exportCore : false,
      input,
      name,
      output,
      request,
      useOptions,
    });

    if (debug) {
      console.warn('config:', config);
    }

    return config;
  });
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param userConfig {@link UserConfig} passed to the `createClient()` method
 */
export async function createClient(
  userConfig: UserConfig,
): Promise<ReadonlyArray<Client>> {
  Performance.start('createClient');

  Performance.start('config');
  const configs = await initConfigs(userConfig);
  Performance.end('config');

  Performance.start('handlebars');
  const templates = registerHandlebarTemplates();
  Performance.end('handlebars');

  const pCreateClient = (config: Config) => async () => {
    Performance.start('spec');
    const spec = await getSpec({ config });
    Performance.end('spec');

    let client: Client | undefined;
    let context: IRContext | undefined;

    Performance.start('parser');
    if (
      config.experimentalParser &&
      !isLegacyClient(config) &&
      !legacyNameFromConfig(config)
    ) {
      context = parseExperimental({ config, spec });
    }

    // fallback to legacy parser
    if (!context) {
      const parsed = parseLegacy({ openApi: spec });
      client = postProcessClient(parsed);
    }
    Performance.end('parser');

    logClientMessage({ config });

    Performance.start('generator');
    if (context) {
      await generateOutput({ context });
    } else if (client) {
      await generateLegacyOutput({ client, openApi: spec, templates });
    }
    Performance.end('generator');

    Performance.start('postprocess');
    if (!config.dryRun) {
      processOutput({ config });

      console.log('✨ Done! Your client is located in:', config.output.path);
    }
    Performance.end('postprocess');

    return context || client;
  };

  const clients: Array<Client> = [];

  const pClients = configs.map((config) => pCreateClient(config));
  for (const pClient of pClients) {
    const client = await pClient();
    if (client && 'version' in client) {
      clients.push(client);
    }
  }

  Performance.end('createClient');

  if (userConfig.debug) {
    const perfReport = new PerformanceReport({
      totalMark: 'createClient',
    });
    perfReport.report({
      marks: [
        'config',
        'openapi',
        'handlebars',
        'parser',
        'generator',
        'postprocess',
      ],
    });
  }

  return clients;
}

/**
 * Type helper for openapi-ts.config.ts, returns {@link UserConfig} object
 */
export const defineConfig = (config: UserConfig): UserConfig => config;

export default {
  createClient,
  defineConfig,
};

export type { OpenApiV3_0_X } from './openApi/3.0.x';
export type { OpenApiV3_1_X } from './openApi/3.1.x';
export type * as Plugins from './plugins/types';
export type { UserConfig } from './types/config';
