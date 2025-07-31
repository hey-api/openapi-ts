import { existsSync, lstatSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import {
  basename,
  dirname,
  join,
  normalize,
  relative,
  resolve,
} from 'node:path';

import type { JSONSchema } from '@hey-api/json-schema-ref-parser';
import { createClient } from '@hey-api/openapi-ts';
import {
  getSpec,
  initConfigs,
  parseOpenApiSpec,
} from '@hey-api/openapi-ts/internal';
import { logger, workspaceRoot } from '@nx/devkit';
import { compareOpenApi } from 'api-smart-diff';
import { format, resolveConfig } from 'prettier';
import { convert } from 'swagger2openapi';

import { CONSTANTS } from './vars';

export type Plugin =
  | string
  | { asClass: boolean; name: '@hey-api/sdk' }
  | { name: '@hey-api/schemas'; type: 'json' | 'form' };

export function generateClientCommand({
  clientType,
  outputPath,
  plugins,
  specFile,
}: {
  clientType: string;
  outputPath: string;
  plugins: Plugin[];
  specFile: string;
}) {
  return `npx @hey-api/openapi-ts -i ${specFile} -o ${outputPath} -c ${clientType}${plugins.length > 0 ? ` ${plugins.map((plugin) => `-p ${getPluginName(plugin)}`).join(' ')}` : ''}`;
}

/**
 * example package name: @hey-api/client-fetch@0.9.0
 */
export function getVersionOfPackage(packageName: string) {
  // we compare the index of the @ symbol and we check greater than 0 over -1 because if the @ symbol is at the 0 position then that is not a version
  const atIndex = packageName.lastIndexOf('@');
  return atIndex > 0 ? packageName.slice(atIndex + 1) : undefined;
}

export function getPackageName(packageName: string) {
  const atIndex = packageName.lastIndexOf('@');
  return atIndex > 0
    ? packageName.slice(0, atIndex) || packageName
    : packageName;
}

type ConfigOptions = NonNullable<Parameters<typeof createClient>[0]>;
type ClientConfig = Extract<
  ConfigOptions,
  {
    plugins?: any;
  }
>;

/**
 * Generates the client code using the spec file
 */
export async function generateClientCode({
  clientType,
  outputPath,
  plugins,
  specFile,
  watch,
}: {
  clientType: string;
  outputPath: string;
  plugins: Plugin[];
  specFile: string;
  watch?: boolean;
}) {
  try {
    const pluginNames = plugins.map(getPluginName);
    logger.info(`Generating client code using spec file...`);

    await createClient({
      input: specFile,
      output: outputPath,
      plugins: [clientType, ...pluginNames] as ClientConfig['plugins'],
      watch,
    });
    logger.info(`Generated client code successfully.`);
  } catch (error) {
    logger.error(`Failed to generate client code: ${error}`);
    throw error;
  }
}

export function getPluginName(plugin: Plugin) {
  if (typeof plugin === 'string') {
    return plugin;
  }
  return plugin.name;
}

/**
 * Bundle and dereference the new spec file
 */
export async function bundleAndDereferenceSpecFile({
  client,
  outputPath,
  plugins,
  specPath,
}: {
  client: string;
  outputPath: string;
  plugins: Plugin[];
  specPath: string;
}) {
  try {
    logger.debug(`Bundling OpenAPI spec file ${specPath}...`);

    logger.debug(`Getting spec file...`);
    const { data, error } = await getSpec({
      inputPath: specPath,
      timeout: 10000,
      watch: { headers: new Headers() },
    });
    if (error) {
      logger.error(`Failed to get spec file: ${error}`);
      throw new Error(`Failed to get spec file: ${error}`);
    }
    logger.debug(`Spec file loaded.`);
    const spec = data;
    // loading default config
    logger.debug(`Loading default config...`);
    const configs = await initConfigs({
      input: specPath,
      output: outputPath,
      plugins: [client, ...plugins] as ClientConfig['plugins'],
    });
    // getting the first config
    const dependencies = configs.dependencies;
    const firstResult = configs.results[0];
    if (!firstResult) {
      logger.error('Failed to load config.');
      throw new Error('Failed to load config.');
    }
    // check if the config is valid
    const { config, errors } = firstResult;
    const firstError = errors[0];
    if (firstError && !config) {
      logger.error(`Failed to load config: ${firstError.message}`);
      throw new Error(`Failed to load config: ${firstError.message}`, {
        cause: firstError,
      });
    }
    if (!config) {
      logger.error('Failed to load config.');
      throw new Error('Failed to load config.');
    }
    logger.debug(`Parsing spec...`);
    const context = parseOpenApiSpec({
      config,
      dependencies,
      spec,
    });
    if (!context) {
      logger.error('Failed to parse spec.');
      throw new Error('Failed to parse spec.');
    }
    const dereferencedSpec = context?.spec;
    if (!dereferencedSpec) {
      logger.error('Failed to dereference spec.');
      throw new Error('Failed to dereference spec.');
    }
    logger.debug(`Spec bundled and dereferenced.`);
    return dereferencedSpec as JSONSchema;
  } catch (error) {
    logger.error(`Failed to bundle and dereference spec file: ${error}.`);
    throw error;
  }
}

/**
 * Fetches an unparsed spec file
 */
async function getSpecFile(path: string) {
  const spec = await getSpec({
    inputPath: path,
    timeout: 10000,
    watch: { headers: new Headers() },
  });
  if (spec.error) {
    throw new Error('Failed to read spec file');
  }

  return spec.data;
}

/**
 * Fetches two spec files and returns them
 */
export async function getSpecFiles(
  existingSpecPath: string,
  newSpecPath: string,
): Promise<{
  existingSpec: JSONSchema;
  newSpec: JSONSchema;
}> {
  logger.debug('Loading spec files...');
  const parsedExistingSpecTask = getSpecFile(existingSpecPath);
  const parsedNewSpecTask = getSpecFile(newSpecPath);
  const tasks = await Promise.allSettled([
    parsedExistingSpecTask,
    parsedNewSpecTask,
  ]);

  if (tasks[0].status === 'rejected' && tasks[1].status === 'rejected') {
    throw new Error('Failed to read both spec files');
  }

  if (tasks[0].status === 'rejected') {
    throw new Error('Failed to read existing spec file');
  }

  if (tasks[1].status === 'rejected') {
    throw new Error('Failed to read updated spec file.');
  }

  const existingSpec = await parsedExistingSpecTask;
  const newSpec = await parsedNewSpecTask;

  return {
    existingSpec,
    newSpec,
  };
}

export function getSpecFileVersion(spec: JSONSchema) {
  if ('openapi' in spec) {
    if (typeof spec.openapi === 'string') {
      return spec.openapi;
    }
    throw new Error('Spec file openapi version is not a string');
  }
  if ('swagger' in spec) {
    if (typeof spec.swagger === 'string') {
      return spec.swagger;
    }
    throw new Error('Spec file swagger version is not a string');
  }
  throw new Error('Spec file does not contain an openapi or swagger version');
}

export async function convertSwaggerToOpenApi(spec: JSONSchema) {
  const openapi = await convert(spec as any, {
    resolve: false,
  });
  return openapi.openapi as JSONSchema;
}

/**
 * Upgrades the spec file to at least OpenAPI 3.0
 */
export async function standardizeSpec(spec: JSONSchema) {
  const version = getSpecFileVersion(spec);
  if (version.startsWith('2.')) {
    return await convertSwaggerToOpenApi(spec);
  }
  return spec;
}

/**
 * Removes examples from the spec file
 *
 * This is done to avoid false positives when comparing specs
 * We do not want to compare examples as they are not part of the spec, and do not affect code generation
 */
export function removeExamples(spec: JSONSchema) {
  for (const key in spec) {
    const typedKey = key as keyof JSONSchema;
    if (typedKey === 'examples' || key === 'example') {
      delete spec[typedKey];
    } else if (typeof spec[typedKey] === 'object' && spec[typedKey] !== null) {
      removeExamples(spec[typedKey]);
    }
  }
  return spec;
}

/**
 * Fetches two spec files and compares them for differences
 */
export async function compareSpecs(
  existingSpecPath: string,
  newSpecPath: string,
) {
  const { existingSpec, newSpec } = await getSpecFiles(
    existingSpecPath,
    newSpecPath,
  );

  const existingSpecWithoutExamples = removeExamples(existingSpec);
  const newSpecWithoutExamples = removeExamples(newSpec);

  const [standardizedExistingSpec, standardizedNewSpec] = await Promise.all([
    standardizeSpec(existingSpecWithoutExamples),
    standardizeSpec(newSpecWithoutExamples),
  ]);

  logger.debug('Comparing specs...');

  // Compare specs
  const { diffs } = compareOpenApi(
    standardizedExistingSpec,
    standardizedNewSpec,
  );
  const filteredDiffs = diffs.filter((diff) => {
    if (diff.path.includes('examples') || diff.path.includes('example')) {
      return false;
    }
    return true;
  });
  const areSpecsEqual = filteredDiffs.length === 0;

  logger.debug(`Are specs equal: ${areSpecsEqual}`);
  return areSpecsEqual;
}

export function isUrl(url: string) {
  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if the spec is a file on the local file system
 */
export function isAFile(isFileSystemFile: string) {
  if (isUrl(isFileSystemFile)) {
    return false;
  }
  return existsSync(isFileSystemFile) && lstatSync(isFileSystemFile).isFile();
}

/**
 * Creates a directory if it does not exist
 */
export async function makeDir(path: string) {
  await mkdir(path, { recursive: true });
}

/**
 * Formats all files in a directory
 */
export async function formatFiles(dir: string) {
  const files = await readdir(dir, { withFileTypes: true });
  const tasks = files.map(async (file) => {
    const filePath = join(dir, file.name);
    if (file.isDirectory()) {
      await formatFiles(filePath);
    } else if (file.isFile()) {
      await formatFile(filePath);
    }
  });
  await Promise.all(tasks);
}

export async function getBaseTsConfigPath({
  baseTsConfigName,
  baseTsConfigPath,
  projectRoot,
}: {
  /**
   * The name of the base tsconfig file that contains the compiler paths used to resolve the imports, use this if the base tsconfig file is in the workspace root,
   * if provided with a baseTsConfigPath then the baseTsConfigName will be added to the path.
   * DO not use this if the baseTsConfigPath is a file.
   */
  baseTsConfigName?: string;
  /**
   * The path to the base tsconfig file that contains the compiler paths used to resolve the imports, use this if the base tsconfig file is not in the workspace root.
   * This can be a file or a directory. If it is a directory and the baseTsConfigName is provided then the baseTsConfigName will be added to the path.
   * If it is a file and the baseTsConfigName is provided then there will be an error.
   */
  baseTsConfigPath?: string;
  /**
   * The root of the project, this is used to resolve the base tsconfig file.
   */
  projectRoot: string;
}) {
  const isTsConfigPathAFile =
    baseTsConfigPath && baseTsConfigPath.endsWith('.json');

  // return the path if it is a file
  if (isTsConfigPathAFile) {
    if (baseTsConfigName) {
      throw new Error(
        `Base tsconfig name ${baseTsConfigName} is not allowed when baseTsConfigPath is a file, either provide a baseTsConfigPath as a directory with a tsconfig.json file or provide a baseTsConfigName.`,
      );
    }

    // check if the file exists
    if (!existsSync(baseTsConfigPath)) {
      throw new Error(`Base tsconfig file ${baseTsConfigPath} does not exist.`);
    }
    const resolvedTsConfig = relative(projectRoot, baseTsConfigPath);
    const tsConfigName = basename(resolvedTsConfig);
    const tsConfigDir = dirname(resolvedTsConfig);
    return {
      tsConfigDirectory: tsConfigDir,
      tsConfigName,
    };
  }

  const isTsConfigPathADirectory =
    baseTsConfigPath && lstatSync(baseTsConfigPath).isDirectory();

  if (!isTsConfigPathADirectory && baseTsConfigPath) {
    throw new Error(
      `Base tsconfig path ${baseTsConfigPath} is not a directory or a file.`,
    );
  }

  const pathToUse = isTsConfigPathADirectory ? baseTsConfigPath : workspaceRoot;

  const possiblePaths = baseTsConfigName
    ? [join(pathToUse, baseTsConfigName)]
    : [
        join(pathToUse, CONSTANTS.TS_BASE_CONFIG_NAME),
        join(pathToUse, 'tsconfig.json'),
      ];
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      const resolvedTsConfig = relative(projectRoot, path);
      const tsConfigName = basename(resolvedTsConfig);
      const tsConfigDir = dirname(resolvedTsConfig);
      return {
        tsConfigDirectory: tsConfigDir,
        tsConfigName,
      };
    }
  }
  const message = `Failed to find base tsconfig file. If your project has a non standard tsconfig name then, pass in the path to the tsconfig file using the baseTsConfigPath option or the baseTsConfigName option.`;
  logger.error(message);
  throw new Error(message);
}

export async function formatFile(filePath: string) {
  const content = await readFile(filePath, 'utf-8');
  const formatted = await formatStringFromFilePath(content, filePath);
  await writeFile(filePath, formatted);
}

export async function formatStringFromFilePath(
  content: string,
  filePath: string,
) {
  const prettierOptions = await resolveConfig(filePath);
  const formatted = await format(content, {
    ...prettierOptions,
    filepath: filePath,
  });
  return formatted;
}

/**
 * Returns the relative path from `fromDir` to `toDir`
 * with trailing slash
 */
export function getRelativePath(fromDir: string, toDir: string): string {
  // normalize the paths
  const normalizedFromDir = normalize(fromDir);
  const normalizedToDir = normalize(toDir);

  // if the paths are the same, return the current directory
  if (normalizedFromDir === normalizedToDir) {
    return './';
  }

  const absoluteFromDir = resolve(normalizedFromDir);
  const absoluteToDir = resolve(normalizedToDir);

  const relativePath = relative(absoluteFromDir, absoluteToDir);
  return relativePath.endsWith('/') ? relativePath : relativePath + '/';
}
