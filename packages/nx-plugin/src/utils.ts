import { existsSync, lstatSync } from 'node:fs';

import type { JSONSchema } from '@hey-api/json-schema-ref-parser';
import { createClient } from '@hey-api/openapi-ts';
import {
  getSpec,
  initConfigs,
  parseOpenApiSpec,
} from '@hey-api/openapi-ts/internal';
import { logger } from '@nx/devkit';
import OpenApiDiff from 'openapi-diff';

export function generateClientCommand({
  clientType,
  outputPath,
  plugins,
  specFile,
}: {
  clientType: string;
  outputPath: string;
  plugins: string[];
  specFile: string;
}) {
  return `npx @hey-api/openapi-ts -i ${specFile} -o ${outputPath} -c ${clientType}${plugins.length > 0 ? ` -p ${plugins.join(',')}` : ''}`;
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
}: {
  clientType: string;
  outputPath: string;
  plugins: string[];
  specFile: string;
}) {
  try {
    logger.info(`Generating client code using spec file...`);
    await createClient({
      input: specFile,
      output: outputPath,
      plugins: [clientType, ...plugins] as ClientConfig['plugins'],
    });
    logger.info(`Generated client code successfully.`);
  } catch (error) {
    logger.error(`Failed to generate client code: ${error}`);
    throw error;
  }
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
  plugins: string[];
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
    const config = configs[0];
    if (!config) {
      logger.error('Failed to load config.');
      throw new Error('Failed to load config.');
    }
    logger.debug(`Parsing spec...`);
    const context = parseOpenApiSpec({
      config,
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

function getSpecVersion(spec: JSONSchema) {
  if ('openapi' in spec && typeof spec.openapi === 'string') {
    return spec.openapi;
  }

  if ('swagger' in spec && typeof spec.swagger === 'string') {
    return spec.swagger;
  }
  return 'unknown';
}

function validateSpecVersions(
  newSpecVersion: string,
  existingSpecVersion: string,
) {
  if (!newSpecVersion.startsWith('3') && !newSpecVersion.startsWith('2')) {
    throw new Error('New spec is not a valid OpenAPI spec version of 2 or 3.');
  }

  logger.debug('Checking spec versions...');
  logger.debug(`Existing spec version: ${existingSpecVersion}`);
  logger.debug(`New spec version: ${newSpecVersion}`);
  const existingVersionIs3 = existingSpecVersion.startsWith('3');
  const newSpecVersionIs3 = newSpecVersion.startsWith('3');
  const existingVersionIs2 = existingSpecVersion.startsWith('2');
  const newSpecVersionIs2 = newSpecVersion.startsWith('2');

  if (!newSpecVersionIs3 && !newSpecVersionIs2) {
    throw new Error('New spec is not a valid OpenAPI spec version of 2 or 3.');
  }

  if (!existingVersionIs3 && !existingVersionIs2) {
    logger.error(
      'Existing spec is not a valid OpenAPI spec version of 2 or 3.',
    );
    throw new Error(
      'Existing spec is not a valid OpenAPI spec version of 2 or 3.',
    );
  }

  return {
    existingVersionIs2,
    existingVersionIs3,
    newSpecVersionIs2,
    newSpecVersionIs3,
  };
}

/**
 * Fetches two spec files and returns them
 */
export async function getSpecFiles(
  existingSpecPath: string,
  newSpecPath: string,
) {
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

  const existingSpecVersion = getSpecVersion(existingSpec);
  const newSpecVersion = getSpecVersion(newSpec);

  const { existingVersionIs3, newSpecVersionIs3 } = validateSpecVersions(
    newSpecVersion,
    existingSpecVersion,
  );

  logger.debug('Comparing specs...');
  // Compare specs
  const diff = await OpenApiDiff.diffSpecs({
    destinationSpec: {
      content: JSON.stringify(newSpec),
      format: newSpecVersionIs3 ? 'openapi3' : 'swagger2',
      location: newSpecPath,
    },
    sourceSpec: {
      content: JSON.stringify(existingSpec),
      format: existingVersionIs3 ? 'openapi3' : 'swagger2',
      location: existingSpecPath,
    },
  });
  const areSpecsEqual =
    diff.breakingDifferencesFound === false &&
    diff.nonBreakingDifferences.length === 0 &&
    // TODO: figure out if we should check unclassifiedDifferences
    diff.unclassifiedDifferences.length === 0;

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
