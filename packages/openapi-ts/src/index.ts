import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { loadConfig } from 'c12';
import { sync } from 'cross-spawn';

import { parse } from './openApi';
import type { Client } from './types/client';
import type { Config, UserConfig } from './types/config';
import { getConfig, setConfig } from './utils/config';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { registerHandlebarTemplates } from './utils/handlebars';
import { postProcessClient } from './utils/postprocess';
import { writeClient } from './utils/write/client';

type Dependencies = Record<string, unknown>;
type PackageDependencies = {
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
};

// Dependencies used in each client. User must have installed these to use the generated client
const clientDependencies: Record<Config['client'], string[]> = {
  '@hey-api/client-axios': ['axios'],
  '@hey-api/client-fetch': [],
  angular: ['@angular/common', '@angular/core', 'rxjs'],
  axios: ['axios'],
  fetch: [],
  node: ['node-fetch'],
  xhr: [],
};

type OutputProcesser = {
  args: (output: string) => string[];
  command: string;
  condition: (dependencies: Dependencies) => boolean;
  name: string;
};

// Map of supported formatters
const formatters: Record<Extract<Config['format'], string>, OutputProcesser> = {
  biome: {
    args: (output) => ['format', '--write', output],
    command: 'biome',
    condition: (dependencies) => Boolean(dependencies['@biomejs/biome']),
    name: 'Biome (Format)',
  },
  prettier: {
    args: (output) => [
      '--ignore-unknown',
      output,
      '--write',
      '--ignore-path',
      './.prettierignore',
    ],
    command: 'prettier',
    condition: (dependencies) => Boolean(dependencies.prettier),
    name: 'Prettier',
  },
};

// Map of supported linters
const linters: Record<Extract<Config['lint'], string>, OutputProcesser> = {
  biome: {
    args: (output) => ['lint', '--apply', output],
    command: 'biome',
    condition: (dependencies) => Boolean(dependencies['@biomejs/biome']),
    name: 'Biome (Lint)',
  },
  eslint: {
    args: (output) => [output, '--fix'],
    command: 'eslint',
    condition: (dependencies) => Boolean(dependencies.eslint),
    name: 'ESLint',
  },
};

const processOutput = (dependencies: Dependencies) => {
  const config = getConfig();
  if (config.format) {
    const formatter = formatters[config.format];
    if (formatter.condition(dependencies)) {
      console.log(`✨ Running ${formatter.name}`);
      sync(formatter.command, formatter.args(config.output));
    }
  }
  if (config.lint) {
    const linter = linters[config.lint];
    if (linter.condition(dependencies)) {
      console.log(`✨ Running ${linter.name}`);
      sync(linter.command, linter.args(config.output));
    }
  }
};

const inferClient = (dependencies: Dependencies): Config['client'] => {
  if (dependencies['@hey-api/client-axios']) {
    return '@hey-api/client-axios';
  }
  if (dependencies['@hey-api/client-fetch']) {
    return '@hey-api/client-fetch';
  }
  if (dependencies.axios) {
    return 'axios';
  }
  if (dependencies['node-fetch']) {
    return 'node';
  }
  if (Object.keys(dependencies).some((d) => d.startsWith('@angular'))) {
    return 'angular';
  }
  return 'fetch';
};

const logClientMessage = () => {
  const { client } = getConfig();
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

const logMissingDependenciesWarning = (dependencies: Dependencies) => {
  const { client } = getConfig();
  const missing = clientDependencies[client].filter(
    (d) => dependencies[d] === undefined,
  );
  if (missing.length > 0) {
    console.log(
      '⚠️ Dependencies used in generated client are missing: ' +
        missing.join(' '),
    );
  }
};

const getSchemas = (userConfig: UserConfig): Config['schemas'] => {
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

const getServices = (userConfig: UserConfig): Config['services'] => {
  let services: Config['services'] = {
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

const getTypes = (userConfig: UserConfig): Config['types'] => {
  let types: Config['types'] = {
    dates: false,
    enums: false,
    export: true,
    name: 'preserve',
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

const getInstalledDependencies = (): Dependencies => {
  const toReducedDependencies = (p: PackageDependencies): Dependencies =>
    [p.dependencies ?? {}, p.devDependencies ?? {}].reduce(
      (deps, devDeps) => ({
        ...deps,
        ...devDeps,
      }),
      {},
    );

  let dependencies: Dependencies = {};

  // Attempt to get all globally installed pacakges.
  const result = sync('npm', ['list', '-g', '--json', '--depth=0']);
  if (!result.error) {
    const globally: PackageDependencies = JSON.parse(result.stdout.toString());
    dependencies = {
      ...dependencies,
      ...toReducedDependencies(globally),
    };
  }

  // Attempt to read any dependencies installed in a local projects package.json.
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  if (existsSync(pkgPath)) {
    const locally: PackageDependencies = JSON.parse(
      readFileSync(pkgPath).toString(),
    );
    dependencies = {
      ...dependencies,
      ...toReducedDependencies(locally),
    };
  }

  return dependencies;
};

const initConfig = async (
  userConfig: UserConfig,
  dependencies: Dependencies,
) => {
  const { config: userConfigFromFile } = await loadConfig<UserConfig>({
    jitiOptions: {
      esmResolve: true,
    },
    name: 'openapi-ts',
    overrides: userConfig,
  });

  if (userConfigFromFile) {
    userConfig = { ...userConfigFromFile, ...userConfig };
  }

  const {
    base,
    debug = false,
    dryRun = false,
    exportCore = true,
    format = false,
    input,
    lint = false,
    name,
    request,
    useOptions = true,
  } = userConfig;

  if (debug) {
    console.warn('userConfig:', userConfig);
  }

  if (!input) {
    throw new Error(
      '🚫 input not provided - provide path to OpenAPI specification',
    );
  }

  if (!userConfig.output) {
    throw new Error(
      '🚫 output not provided - provide path where we should generate your client',
    );
  }

  if (!useOptions) {
    console.warn(
      '⚠️ Deprecation warning: useOptions set to false. This setting will be removed in future versions. Please migrate useOptions to true https://heyapi.vercel.app/openapi-ts/migrating.html#v0-27-38',
    );
  }

  const client = userConfig.client || inferClient(dependencies);
  const output = path.resolve(process.cwd(), userConfig.output);
  const schemas = getSchemas(userConfig);
  const services = getServices(userConfig);
  const types = getTypes(userConfig);

  return setConfig({
    base,
    client,
    debug,
    dryRun,
    exportCore: client.startsWith('@hey-api') ? false : exportCore,
    format,
    input,
    lint,
    name,
    output,
    request,
    schemas,
    services,
    types,
    useOptions,
  });
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param userConfig {@link UserConfig} passed to the `createClient()` method
 */
export async function createClient(userConfig: UserConfig): Promise<Client> {
  const dependencies = getInstalledDependencies();

  if (!dependencies.typescript) {
    throw new Error('🚫 dependency missing - TypeScript must be installed');
  }

  const config = await initConfig(userConfig, dependencies);

  const openApi =
    typeof config.input === 'string'
      ? await getOpenApiSpec(config.input)
      : (config.input as unknown as Awaited<ReturnType<typeof getOpenApiSpec>>);

  const client = postProcessClient(parse(openApi));
  const templates = registerHandlebarTemplates();

  if (!config.dryRun) {
    logClientMessage();
    logMissingDependenciesWarning(dependencies);
    await writeClient(openApi, client, templates);
    processOutput(dependencies);
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
