import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

import { compareSpecs } from './utils';

describe('compareSpecs', () => {
  describe('JSON Specs', () => {
    it('should detect no changes between identical specs', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.json'),
        resolve(__dirname, './test-specs/base.json'),
      );
      expect(areEqual).toBe(true);
    });

    it('should detect path changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.json'),
        resolve(__dirname, './test-specs/path-changed.json'),
      );
      expect(areEqual).toBe(false);
    });

    it('should detect parameter changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.json'),
        resolve(__dirname, './test-specs/parameter-changed.json'),
      );
      expect(areEqual).toBe(false);
    });

    it('should detect endpoint changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.json'),
        resolve(__dirname, './test-specs/endpoint-changed.json'),
      );
      expect(areEqual).toBe(false);
    });

    it('should detect summary changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.json'),
        resolve(__dirname, './test-specs/summary-changed.json'),
      );
      expect(areEqual).toBe(false);
    });

    it('should ignore example changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.json'),
        resolve(__dirname, './test-specs/example-changed.json'),
      );
      expect(areEqual).toBe(true);
    });
  });

  describe('YAML Specs', () => {
    it('should detect no changes between identical specs', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.yaml'),
        resolve(__dirname, './test-specs/base.yaml'),
      );
      expect(areEqual).toBe(true);
    });

    it('should detect path changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.yaml'),
        resolve(__dirname, './test-specs/path-changed.yaml'),
      );
      expect(areEqual).toBe(false);
    });

    it('should detect parameter changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.yaml'),
        resolve(__dirname, './test-specs/parameter-changed.yaml'),
      );
      expect(areEqual).toBe(false);
    });

    it('should detect endpoint changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.yaml'),
        resolve(__dirname, './test-specs/endpoint-changed.yaml'),
      );
      expect(areEqual).toBe(false);
    });

    it('should detect summary changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.yaml'),
        resolve(__dirname, './test-specs/summary-changed.yaml'),
      );
      expect(areEqual).toBe(false);
    });

    it('should ignore example changes', async () => {
      const areEqual = await compareSpecs(
        resolve(__dirname, './test-specs/base.yaml'),
        resolve(__dirname, './test-specs/example-changed.yaml'),
      );
      expect(areEqual).toBe(true);
    });
  });
});
