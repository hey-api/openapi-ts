import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import * as v from 'valibot';

import { getSpecsPath } from '../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getSnapshotsPath = (): string => path.join(__dirname, '..', '__snapshots__');

export const getTempSnapshotsPath = (): string => path.join(__dirname, '..', '.gen', 'snapshots');

export const createValibotConfig =
  ({ openApiVersion, outputDir }: { openApiVersion: string; outputDir: string }) =>
  (userConfig: UserConfig) => {
    const input = userConfig.input instanceof Array ? userConfig.input[0]! : userConfig.input;
    const inputPath = path.join(
      getSpecsPath(),
      openApiVersion,
      typeof input === 'string' ? input : (input.path as string),
    );
    const output = userConfig.output instanceof Array ? userConfig.output[0]! : userConfig.output;
    const outputPath = typeof output === 'string' ? output : (output?.path ?? '');
    return {
      plugins: ['valibot'],
      ...userConfig,
      input:
        typeof userConfig.input === 'string'
          ? inputPath
          : {
              ...userConfig.input,
              path: inputPath,
            },
      logs: { level: 'silent', path: './logs' },
      output: path.join(outputDir, outputPath),
    } as UserConfig;
  };

function loadGeneratedSchemas(generatedPath: string): any {
  if (!fs.existsSync(generatedPath)) {
    throw new Error(
      `Generated schema file not found: ${generatedPath}\n` +
        `Schema generation may have failed. Check the input schema file for errors.`,
    );
  }

  try {
    const generatedCode = fs.readFileSync(generatedPath, 'utf-8');

    const exportMatches = generatedCode.match(/export const (\w+)/g);
    if (!exportMatches) {
      throw new Error('No exported schemas found in generated code');
    }

    const schemaNames = exportMatches.map((match: string) => match.replace('export const ', ''));
    const evalCode =
      generatedCode
        .replace(/import \* as v from 'valibot';/, '')
        .replace(/export const/g, 'const')
        .replace(/v\./g, 'vModule.') + `\n\nreturn { ${schemaNames.join(', ')} };`;

    const schemaFunction = new Function('vModule', evalCode);
    return schemaFunction(v);
  } catch (error) {
    throw new Error(
      `Failed to load generated schemas from ${generatedPath}: ${error instanceof Error ? error.message : String(error)}\n` +
        `The generated file may contain syntax errors or be malformed.`,
    );
  }
}

export async function setupValibotTest(
  input: string,
  output: string,
  version = '3.1.x',
): Promise<any> {
  const inputPath = path.join(getSpecsPath(), version, input);
  const outputPath = path.join(__dirname, '.gen', version, output);

  fs.mkdirSync(outputPath, { recursive: true });

  await createClient({
    input: inputPath,
    logs: { level: 'silent' },
    output: outputPath,
    plugins: ['valibot'],
  });

  const generatedPath = path.join(outputPath, 'valibot.gen.ts');
  return loadGeneratedSchemas(generatedPath);
}
