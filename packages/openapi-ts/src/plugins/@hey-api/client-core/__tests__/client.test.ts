import path from 'node:path';

import { resolveRuntimeConfigPath } from '../../client-core/client';

describe('resolveRuntimeConfigPath', () => {
  it('preserves path mapping and module specifiers', () => {
    const outputPath = path.join(process.cwd(), 'src/client');

    expect(
      resolveRuntimeConfigPath({
        outputPath,
        runtimeConfigPath: '~/foo.ts',
      }),
    ).toBe('~/foo.ts');

    expect(
      resolveRuntimeConfigPath({
        outputPath,
        runtimeConfigPath: '@/foo.ts',
      }),
    ).toBe('@/foo.ts');

    expect(
      resolveRuntimeConfigPath({
        outputPath,
        runtimeConfigPath: '@scope/runtime-config',
      }),
    ).toBe('@scope/runtime-config');
  });

  it('resolves relative filesystem paths from cwd to output-relative import', () => {
    const outputPath = path.join(process.cwd(), 'src/client');

    expect(
      resolveRuntimeConfigPath({
        outputPath,
        runtimeConfigPath: './src/hey-api.ts',
      }),
    ).toBe('../hey-api.ts');
  });

  it('resolves absolute filesystem paths to output-relative import', () => {
    const cwd = process.cwd();
    const outputPath = path.join(cwd, 'src/client');

    expect(
      resolveRuntimeConfigPath({
        outputPath,
        runtimeConfigPath: path.join(cwd, 'src/runtime/hey-api.ts'),
      }),
    ).toBe('../runtime/hey-api.ts');
  });

  it('adds ./ prefix for same-directory files', () => {
    const cwd = process.cwd();
    const outputPath = path.join(cwd, 'src/client');

    expect(
      resolveRuntimeConfigPath({
        outputPath,
        runtimeConfigPath: path.join(cwd, 'src/client/hey-api.ts'),
      }),
    ).toBe('./hey-api.ts');
  });
});
