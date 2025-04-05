import { bundle } from '@apidevtools/swagger-parser';
import { createClient } from '@hey-api/openapi-ts';
import { logger } from '@nx/devkit';
import { execSync } from 'child_process';
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

// example package name: @hey-api/client-fetch@0.9.0
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
export function bundleAndDereferenceSpecFile({
  outputPath,
  specFile,
}: {
  outputPath: string;
  specFile: string;
}) {
  try {
    logger.debug(`Bundling OpenAPI spec file using Redocly CLI...`);
    execSync(
      `npx redocly bundle ${specFile} --output ${outputPath} --ext yaml --dereferenced`,
      { stdio: 'inherit' },
    );
    logger.debug(`spec bundled.`);
  } catch (error) {
    logger.error(`Failed to bundle and dereference spec file: ${error}`);
    throw error;
  }
}

export async function compareSpecs(
  existingSpecPath: string,
  newSpecPath: string,
) {
  logger.debug('Parsing existing spec...');
  const parsedExistingSpec = await bundle(existingSpecPath);
  logger.debug('Existing spec parsed.');
  const parsedNewSpec = await bundle(newSpecPath);
  logger.debug('New spec parsed.');

  const existingSpec = JSON.parse(JSON.stringify(parsedExistingSpec));
  const existingSpecVersion = existingSpec.openapi || existingSpec.swagger;
  const newSpec = JSON.parse(JSON.stringify(parsedNewSpec));
  const newSpecVersion = newSpec.openapi || newSpec.swagger;
  logger.debug('Checking spec versions...');
  logger.debug(`Existing spec version: ${existingSpecVersion}`);
  logger.debug(`New spec version: ${newSpecVersion}`);
  const existingVersionIs3 = existingSpecVersion.startsWith('3');
  const newSpecVersionIs3 = newSpecVersion.startsWith('3');
  const existingVersionIs2 = existingSpecVersion.startsWith('2');
  const newSpecVersionIs2 = newSpecVersion.startsWith('2');

  if (!newSpecVersionIs3 && !newSpecVersionIs2) {
    logger.error('New spec is not a valid OpenAPI spec version of 2 or 3.');
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

  logger.debug('Comparing specs...');
  // Compare specs
  const diff = await OpenApiDiff.diffSpecs({
    destinationSpec: {
      content: JSON.stringify(parsedNewSpec),
      format: newSpecVersionIs3 ? 'openapi3' : 'swagger2',
      location: newSpecPath,
    },
    sourceSpec: {
      content: JSON.stringify(parsedExistingSpec),
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
