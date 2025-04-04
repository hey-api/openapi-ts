import { logger } from '@nx/devkit';
import { execSync } from 'child_process';

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

/**
 * Generates the client code using the spec file
 */
export function generateClientCode({
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
    execSync(
      generateClientCommand({
        clientType,
        outputPath,
        plugins,
        specFile,
      }),
      { stdio: 'inherit' },
    );
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
