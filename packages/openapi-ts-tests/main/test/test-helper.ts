import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@hey-api/openapi-ts';
import * as v from 'valibot';

import { getSpecsPath } from '../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '3.1.x';

const outputDir = path.join(__dirname, 'generated', version);

/**
 * Load and evaluate the generated schemas
 */
function loadGeneratedSchemas(generatedPath: string): any {
  if (!fs.existsSync(generatedPath)) {
    throw new Error(
      `Generated schema file not found: ${generatedPath}\n` +
        `Schema generation may have failed. Check the input schema file for errors.`,
    );
  }

  try {
    const generatedCode = fs.readFileSync(generatedPath, 'utf-8');

    // Extract all export statements and create a proper return object
    const exportMatches = generatedCode.match(/export const (\w+)/g);
    if (!exportMatches) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error('No exported schemas found in generated code');
    }

    // Create evaluation code that returns an object with all exports
    const schemaNames = exportMatches.map((match: string) => match.replace('export const ', ''));
    const evalCode =
      generatedCode
        .replace(/import \* as v from 'valibot';/, '')
        .replace(/export const/g, 'const')
        .replace(/v\./g, 'vModule.') + `\n\nreturn { ${schemaNames.join(', ')} };`;

    // Wrap in a function to capture the return value
    const schemaFunction = new Function('vModule', evalCode);
    return schemaFunction(v);
  } catch (error) {
    throw new Error(
      `Failed to load generated schemas from ${generatedPath}: ${error instanceof Error ? error.message : String(error)}\n` +
        `The generated file may contain syntax errors or be malformed.`,
    );
  }
}

// TODO: further clean up
export async function setupValibotTest(input: string, output: string): Promise<any> {
  const inputPath = path.join(getSpecsPath(), version, input);
  const outputPath = path.join(outputDir, output);

  fs.mkdirSync(outputPath, { recursive: true });

  await createClient({
    input: inputPath,
    logs: { level: 'silent' },
    output: outputPath,
    plugins: ['valibot'],
  });

  // Load and return the generated schemas
  const generatedPath = path.join(outputPath, 'valibot.gen.ts');
  return loadGeneratedSchemas(generatedPath);
}
