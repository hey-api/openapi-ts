import { createClient } from '@hey-api/openapi-ts';
import { execSync } from 'child_process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bundleAndDereferenceSpecFile,
  generateClientCode,
  generateClientCommand,
  getPackageName,
  getVersionOfPackage,
} from './utils';

// Mock execSync to prevent actual command execution
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('@hey-api/openapi-ts', () => ({
  createClient: vi.fn(),
}));

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateClientCommand', () => {
    it('should generate command without plugins', () => {
      const command = generateClientCommand({
        clientType: '@hey-api/client-fetch',
        outputPath: './src/generated',
        plugins: [],
        specFile: './api/spec.yaml',
      });

      expect(command).toBe(
        'npx @hey-api/openapi-ts -i ./api/spec.yaml -o ./src/generated -c @hey-api/client-fetch',
      );
    });

    it('should generate command with plugins', () => {
      const command = generateClientCommand({
        clientType: '@hey-api/client-fetch',
        outputPath: './src/generated',
        plugins: ['@tanstack/react-query', 'zod'],
        specFile: './api/spec.yaml',
      });

      expect(command).toBe(
        'npx @hey-api/openapi-ts -i ./api/spec.yaml -o ./src/generated -c @hey-api/client-fetch -p @tanstack/react-query,zod',
      );
    });
  });

  describe('getVersionOfPackage', () => {
    it('should extract version from package name with version', () => {
      expect(getVersionOfPackage('@hey-api/client-fetch@0.9.0')).toBe('0.9.0');
      expect(getVersionOfPackage('axios@1.2.3')).toBe('1.2.3');
    });

    it('should return undefined for package name without version', () => {
      expect(getVersionOfPackage('@hey-api/client-fetch')).toBeUndefined();
      expect(getVersionOfPackage('axios')).toBeUndefined();
    });

    it('should handle scoped packages correctly', () => {
      expect(getVersionOfPackage('@scope/package@1.0.0')).toBe('1.0.0');
      expect(getVersionOfPackage('@scope/package')).toBeUndefined();
    });
  });

  describe('getPackageName', () => {
    it('should extract package name from package with version', () => {
      expect(getPackageName('@hey-api/client-fetch@0.9.0')).toBe(
        '@hey-api/client-fetch',
      );
      expect(getPackageName('axios@1.2.3')).toBe('axios');
    });

    it('should return same name for package without version', () => {
      expect(getPackageName('@hey-api/client-fetch')).toBe(
        '@hey-api/client-fetch',
      );
      expect(getPackageName('axios')).toBe('axios');
    });

    it('should handle scoped packages correctly', () => {
      expect(getPackageName('@scope/package@1.0.0')).toBe('@scope/package');
      expect(getPackageName('@scope/package')).toBe('@scope/package');
    });
  });

  describe('generateClientCode', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should execute command successfully', async () => {
      await generateClientCode({
        clientType: '@hey-api/client-fetch',
        outputPath: './src/generated',
        plugins: [],
        specFile: './api/spec.yaml',
      });

      expect(createClient).toHaveBeenCalledWith({
        input: './api/spec.yaml',
        output: './src/generated',
        plugins: ['@hey-api/client-fetch'],
      });
    });

    it('should throw error when command fails', async () => {
      vi.mocked(createClient).mockImplementationOnce(() => {
        throw new Error('Command failed');
      });

      await expect(
        generateClientCode({
          clientType: '@hey-api/client-fetch',
          outputPath: './src/generated',
          plugins: [],
          specFile: './api/spec.yaml',
        }),
      ).rejects.toThrow('Command failed');
    });
  });

  describe('bundleAndDereferenceSpecFile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should execute bundle command successfully', () => {
      bundleAndDereferenceSpecFile({
        outputPath: './dist/spec.yaml',
        specFile: './api/spec.yaml',
      });

      expect(execSync).toHaveBeenCalledWith(
        'npx redocly bundle ./api/spec.yaml --output ./dist/spec.yaml --ext yaml --dereferenced',
        { stdio: 'inherit' },
      );
    });

    it('should throw error when bundle command fails', () => {
      vi.mocked(execSync).mockImplementationOnce(() => {
        throw new Error('Bundle failed');
      });

      expect(() =>
        bundleAndDereferenceSpecFile({
          outputPath: './dist/spec.yaml',
          specFile: './api/spec.yaml',
        }),
      ).toThrow('Bundle failed');
    });
  });
});
