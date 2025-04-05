import { bundle } from '@apidevtools/swagger-parser';
import type { PromiseExecutor } from '@nx/devkit';
import { logger } from '@nx/devkit';
import { existsSync } from 'fs';
import { cp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import OpenApiDiff from 'openapi-diff';
import { join } from 'path';

import { bundleAndDereferenceSpecFile, generateClientCode } from '../../utils';
import { CONSTANTS } from '../../vars';
import type { UpdateApiExecutorSchema } from './schema';

async function compareSpecs(existingSpecPath: string, newSpecPath: string) {
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

const runExecutor: PromiseExecutor<UpdateApiExecutorSchema> = async (
  options,
  // this is added to stop the CI from complaining about not using the context and to stop the linter from complaining
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context,
) => {
  const tempFolder = options.tempFolder ?? CONSTANTS.TMP_DIR_NAME;
  const absoluteTempFolder = join(process.cwd(), tempFolder);
  try {
    const tempApiFolder = join(tempFolder, CONSTANTS.SPEC_DIR_NAME);

    // Create temp folders if they don't exist
    const absoluteTempApiFolder = join(
      absoluteTempFolder,
      CONSTANTS.SPEC_DIR_NAME,
    );
    if (!existsSync(absoluteTempApiFolder)) {
      logger.debug(
        `Creating executor temp api folder: ${absoluteTempApiFolder}`,
      );
      await mkdir(absoluteTempApiFolder, { recursive: true });
    }
    logger.debug('Temp folders created.');

    // Determine file paths
    const projectRoot = join(options.directory, options.name);
    const apiDirectory = join(projectRoot, CONSTANTS.SPEC_DIR_NAME);
    const existingSpecPath = join(apiDirectory, CONSTANTS.SPEC_FILE_NAME);
    const tempSpecPath = join(tempApiFolder, CONSTANTS.SPEC_FILE_NAME);
    const generatedTempDir = join(tempFolder, CONSTANTS.GENERATED_DIR_NAME);

    // Check if existing spec exists
    const absoluteExistingSpecPath = join(process.cwd(), existingSpecPath);
    if (!existsSync(absoluteExistingSpecPath)) {
      throw new Error(`No existing spec file found at ${existingSpecPath}.`);
    }

    bundleAndDereferenceSpecFile({
      outputPath: tempSpecPath,
      specFile: options.spec,
    });

    // Read both files they can be yaml or json OpenAPI spec files
    logger.info('Reading existing and new spec files...');
    const absoluteTempSpecPath = join(process.cwd(), tempSpecPath);
    const newSpecString = await readFile(absoluteTempSpecPath, 'utf-8');
    if (!newSpecString) {
      logger.error('New spec file is empty.');
      throw new Error('New spec file is empty.');
    }

    logger.debug(
      `Comparing specs: ${absoluteExistingSpecPath} and ${absoluteTempSpecPath}`,
    );
    const areSpecsEqual = await compareSpecs(
      absoluteExistingSpecPath,
      absoluteTempSpecPath,
    );
    // If specs are equal, we don't need to generate new client code and we can return
    if (areSpecsEqual) {
      logger.info('No changes detected in the API spec.');
      await cleanup(absoluteTempFolder);
      return { success: true };
    }
    // If specs are not equal, we need to generate new client code

    // Generate new client code in temp directory
    logger.info('Changes detected in API spec. Generating new client code...');

    // Create temp generated directory
    const absoluteGeneratedTempDir = join(process.cwd(), generatedTempDir);
    if (!existsSync(absoluteGeneratedTempDir)) {
      await mkdir(absoluteGeneratedTempDir);
    }

    // Generate new client code
    try {
      await generateClientCode({
        clientType: options.client,
        outputPath: generatedTempDir,
        plugins: options.plugins,
        specFile: tempSpecPath,
      });
    } catch (error) {
      await cleanup(absoluteTempFolder);
      throw error;
    }

    // After successful generation, update the files
    logger.info('Updating existing spec and client files...');

    const absoluteApiDirectory = join(process.cwd(), apiDirectory);
    const apiDirectoryExists = existsSync(absoluteApiDirectory);
    const existingSpecFileExists = existsSync(absoluteExistingSpecPath);
    // Copy new spec to project
    if (apiDirectoryExists) {
      if (existingSpecFileExists) {
        logger.debug('Existing spec file found. Updating...');
      } else {
        logger.debug('No existing spec file found. Creating...');
      }
      await writeFile(absoluteExistingSpecPath, newSpecString);
    } else {
      logger.error(
        `No API directory found at ${apiDirectory} after checking once, exiting.`,
      );
      await cleanup(absoluteTempFolder);
      return { success: false };
    }

    const projectGeneratedDir = join(
      projectRoot,
      'src',
      CONSTANTS.GENERATED_DIR_NAME,
    );

    const absoluteProjectGeneratedDir = join(
      process.cwd(),
      projectGeneratedDir,
    );
    // Remove old generated directory if it exists
    if (existsSync(absoluteProjectGeneratedDir)) {
      await rm(absoluteProjectGeneratedDir, {
        force: true,
        recursive: true,
      });
    }

    // Copy new generated directory
    await cp(absoluteGeneratedTempDir, absoluteProjectGeneratedDir, {
      recursive: true,
    });

    logger.info('Successfully updated API client and spec files.');
    await cleanup(absoluteTempFolder);
    return { success: true };
  } catch (error) {
    logger.error(
      `Failed to update API: ${error instanceof Error ? error.message : String(error)}.`,
    );
    await cleanup(absoluteTempFolder);
    return { success: false };
  }
};

async function cleanup(tempFolder: string) {
  const absoluteTempFolder = join(process.cwd(), tempFolder);
  if (existsSync(absoluteTempFolder)) {
    logger.debug(`Removing temp folder: ${absoluteTempFolder}`);
    await rm(absoluteTempFolder, { force: true, recursive: true });
  }
}

export default runExecutor;
