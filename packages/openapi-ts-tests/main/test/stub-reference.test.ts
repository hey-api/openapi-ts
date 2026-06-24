import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';

import { getFilePaths, getSpecsPath } from '../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, 'generated', 'stub-reference');

describe('stub reference regression', () => {
  beforeEach(() => {
    fs.rmSync(outputPath, { force: true, recursive: true });
  });

  it('does not crash when a schema is referenced as both a bare $ref and a nullable anyOf', async () => {
    const config: UserConfig = {
      input: path.join(getSpecsPath(), '3.1.x', 'stub-reference.json'),
      logs: {
        level: 'silent',
      },
      output: {
        path: outputPath,
      },
      parser: {
        hooks: {
          symbols: {
            getFilePath: (symbol) => {
              if (
                symbol.meta?.resource === 'definition' &&
                Array.isArray(symbol.meta.path) &&
                symbol.meta.path[1] === 'schemas'
              ) {
                return `models/${String(symbol.name)}`;
              }

              return undefined;
            },
          },
        },
      },
      plugins: ['@hey-api/typescript'],
    };

    await expect(createClient(config)).resolves.not.toThrow();

    const filePaths = getFilePaths(outputPath);

    expect(
      filePaths.some((filePath) => filePath.includes(path.join('models', 'AddressResponse'))),
    ).toBe(true);
    expect(
      filePaths.some((filePath) => filePath.includes(path.join('models', 'UserResponse'))),
    ).toBe(true);
  });
});
