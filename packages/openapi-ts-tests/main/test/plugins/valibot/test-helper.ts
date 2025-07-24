/**
 * Test helper for Valibot plugin tests
 * Provides common functionality for schema generation and loading
 */

import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';
import * as v from 'valibot';

/**
 * Detect test name from the calling file
 */
function detectTestName(): string {
  const stack = new Error().stack;
  if (!stack) {
    throw new Error('Unable to detect test name: no stack trace available');
  }

  // Find the first stack frame that contains a .test.ts file
  const testFileMatch = stack.match(/([^\\/]+)\.test\.ts/);
  if (!testFileMatch || !testFileMatch[1]) {
    throw new Error(
      'Unable to detect test name: no .test.ts file found in stack trace',
    );
  }

  return testFileMatch[1];
}

/**
 * Detect base directory from the calling file
 */
function detectBaseDir(): string {
  const stack = new Error().stack;
  if (!stack) {
    throw new Error(
      'Unable to detect base directory: no stack trace available',
    );
  }

  // Try multiple regex patterns to match different stack trace formats
  const patterns = [
    /at .* \(([^)]+\.test\.ts):\d+:\d+\)/, // Original pattern
    /at ([^:]+\.test\.ts):\d+:\d+/, // Alternative pattern without parentheses
    /([^:\s]+\.test\.ts):\d+:\d+/, // Simple pattern
  ];

  for (const pattern of patterns) {
    const testFileMatch = stack.match(pattern);
    if (testFileMatch && testFileMatch[1]) {
      return path.dirname(testFileMatch[1]);
    }
  }

  throw new Error(
    'Unable to detect base directory: no .test.ts file found in stack trace',
  );
}

/**
 * Detect function name from the test file path
 * Extracts the directory name between 'test/' and the test file
 * e.g., from 'test/plugins/valibot/test/numberTypeToValibotSchema/formats.test.ts'
 * extracts 'numberTypeToValibotSchema'
 */
function detectFunctionName(): string {
  const stack = new Error().stack;
  if (!stack) {
    throw new Error('Unable to detect function name: no stack trace available');
  }

  // Try multiple regex patterns to match different stack trace formats
  const patterns = [
    /at .* \(([^)]+\.test\.ts):\d+:\d+\)/, // Original pattern
    /at ([^:]+\.test\.ts):\d+:\d+/, // Alternative pattern without parentheses
    /([^:\s]+\.test\.ts):\d+:\d+/, // Simple pattern
  ];

  for (const pattern of patterns) {
    const testFileMatch = stack.match(pattern);
    if (testFileMatch && testFileMatch[1]) {
      const testFilePath = testFileMatch[1];

      // Extract function name from path pattern: .../test/[FUNCTION_NAME]/[TEST_NAME].test.ts
      const pathParts = testFilePath.split(/[/\\]/);
      const testIndex = pathParts.lastIndexOf('test');

      if (testIndex !== -1 && testIndex < pathParts.length - 2) {
        const functionName = pathParts[testIndex + 1];
        if (functionName) {
          return functionName;
        }
      }

      throw new Error(
        `Unable to extract function name from test path: ${testFilePath}\n` +
          `Expected path pattern: .../test/[FUNCTION_NAME]/[TEST_NAME].test.ts`,
      );
    }
  }

  throw new Error(
    'Unable to detect function name: no .test.ts file found in stack trace',
  );
}

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
    const schemaNames = exportMatches.map((match: string) =>
      match.replace('export const ', ''),
    );
    const evalCode =
      generatedCode
        .replace(/import \* as v from 'valibot';/, '')
        .replace(/export const/g, 'const')
        .replace(/v\./g, 'vModule.') +
      `\n\nreturn { ${schemaNames.join(', ')} };`;

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

/**
 * Setup function for Valibot tests
 * Automatically detects test name and paths, generates schemas, and returns them
 */
export async function setupValibotTest(): Promise<any> {
  // Detect test name, function name, and base directory from calling file
  const testName = detectTestName();
  const functionName = detectFunctionName();
  const baseDir = detectBaseDir();

  // Construct paths dynamically based on detected function name
  const schemaPath = path.join(
    baseDir,
    '..',
    '..',
    'spec',
    functionName,
    `${testName}.json`,
  );
  const outputPath = path.join(
    baseDir,
    '..',
    '..',
    'generated',
    functionName,
    testName,
  );

  // Check if spec file exists
  if (!fs.existsSync(schemaPath)) {
    throw new Error(
      `Schema file not found: ${schemaPath}\n` +
        `Expected schema file for test '${testName}' in function '${functionName}' at the above location.\n` +
        `Please ensure the spec file exists and matches the test name.`,
    );
  }

  try {
    // Create output directory
    fs.mkdirSync(outputPath, { recursive: true });

    // Generate Valibot schemas
    await createClient({
      input: schemaPath,
      logs: { level: 'silent' },
      output: outputPath,
      plugins: ['valibot'],
    });

    // Load and return the generated schemas
    const generatedPath = path.join(outputPath, 'valibot.gen.ts');
    return loadGeneratedSchemas(generatedPath);
  } catch (error) {
    throw new Error(
      `Failed to generate schemas for test '${testName}' in function '${functionName}': ${error instanceof Error ? error.message : String(error)}\n` +
        `Schema path: ${schemaPath}\n` +
        `Output path: ${outputPath}`,
    );
  }
}
