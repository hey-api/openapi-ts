import type { PromiseExecutor } from '@nx/devkit';
import { logger } from '@nx/devkit';
import { existsSync } from 'fs';
import { cp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';

import {
  bundleAndDereferenceSpecFile,
  compareSpecs,
  generateClientCode,
} from '../../utils';
import { CONSTANTS } from '../../vars';
import type { UpdateApiExecutorSchema } from './schema';

async function setup({
  absoluteTempFolder,
  options,
  tempFolder,
}: {
  absoluteTempFolder: string;
  options: UpdateApiExecutorSchema;
  tempFolder: string;
}) {
  const tempApiFolder = join(tempFolder, CONSTANTS.SPEC_DIR_NAME);

  // Create temp folders if they don't exist
  const absoluteTempApiFolder = join(
    absoluteTempFolder,
    CONSTANTS.SPEC_DIR_NAME,
  );
  if (!existsSync(absoluteTempApiFolder)) {
    logger.debug(`Creating executor temp api folder: ${absoluteTempApiFolder}`);
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

  return {
    absoluteExistingSpecPath,
    absoluteTempSpecPath,
    apiDirectory,
    generatedTempDir,
    newSpecString,
    projectRoot,
    tempSpecPath,
  };
}

const runExecutor: PromiseExecutor<UpdateApiExecutorSchema> = async (
  options,
  // this is added to stop the CI from complaining about not using the context and to stop the linter from complaining
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context,
) => {
  const tempFolder = options.tempFolder ?? CONSTANTS.TMP_DIR_NAME;
  const absoluteTempFolder = join(process.cwd(), tempFolder);
  const force = options.force ?? false;

  try {
    const {
      absoluteExistingSpecPath,
      absoluteTempSpecPath,
      apiDirectory,
      generatedTempDir,
      newSpecString,
      projectRoot,
      tempSpecPath,
    } = await setup({
      absoluteTempFolder,
      options,
      tempFolder,
    });
    const areSpecsEqual = await compareSpecs(
      absoluteExistingSpecPath,
      absoluteTempSpecPath,
    );

    // If specs are equal, we don't need to generate new client code and we can return unless the force flag is true
    if (areSpecsEqual) {
      logger.info('No changes detected in the API spec.');
      if (!force) {
        await cleanup(absoluteTempFolder);
        return { success: true };
      } else {
        logger.info('Force flag is true. Generating new client code...');
      }
    } else {
      logger.info(
        'Changes detected in API spec. Generating new client code...',
      );
    }
    // If specs are not equal, we need to generate new client code
    // Generate new client code in temp directory
    // Create temp generated directory
    const absoluteGeneratedTempDir = join(process.cwd(), generatedTempDir);
    if (!existsSync(absoluteGeneratedTempDir)) {
      await mkdir(absoluteGeneratedTempDir);
    }

    // Generate new client code
    await generateClientCode({
      clientType: options.client,
      outputPath: generatedTempDir,
      plugins: options.plugins,
      specFile: tempSpecPath,
    });

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
      throw new Error(
        `No API directory found at ${apiDirectory} after checking once, exiting.`,
      );
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
