import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { checkNodeVersion } from '../engine';

describe('engine config', () => {
  describe('checkNodeVersion', () => {
    it('should not throw error for Node 18+', () => {
      expect(() => checkNodeVersion()).not.toThrow();
    });
  });

  describe('Node 18 compatibility', () => {
    it('should have TypeScript target set to ES2021 for Node 18 compatibility', () => {
      const tsconfigPath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'tsconfig.base.json',
      );
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

      // ES2021 is required for Node 18 compatibility
      // ES2022 includes features like Object.hasOwn that are not available in Node 18
      expect(tsconfig.compilerOptions.target).toBe('ES2021');
    });

    it('should have tsup target set to node18 for Node 18 compatibility', () => {
      const tsupConfigPath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'tsup.config.ts',
      );
      const tsupConfig = fs.readFileSync(tsupConfigPath, 'utf8');

      // tsup/esbuild needs explicit node18 target to ensure compiled output works on Node 18
      expect(tsupConfig).toContain("target: 'node18'");
    });

    it('should have TypeScript target set to ES2021 in codegen-core for Node 18 compatibility', () => {
      const tsconfigPath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'codegen-core',
        'tsconfig.base.json',
      );
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

      // ES2021 is required for Node 18 compatibility
      expect(tsconfig.compilerOptions.target).toBe('ES2021');
    });

    it('should have tsup target set to node18 in codegen-core for Node 18 compatibility', () => {
      const tsupConfigPath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'codegen-core',
        'tsup.config.ts',
      );
      const tsupConfig = fs.readFileSync(tsupConfigPath, 'utf8');

      // tsup/esbuild needs explicit node18 target to ensure compiled output works on Node 18
      expect(tsupConfig).toContain("target: 'node18'");
    });
  });
});
