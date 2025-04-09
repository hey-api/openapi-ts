import { describe, expect, it } from 'vitest';

describe('main entry index', () => {
  it('getSpec should be exported', async () => {
    const { getSpec } = await import('../index');
    expect(getSpec).toBeDefined();
  });

  it('initConfigs should be exported', async () => {
    const { initConfigs } = await import('../index');
    expect(initConfigs).toBeDefined();
  });

  it('parseOpenApiSpec should be exported', async () => {
    const { parseOpenApiSpec } = await import('../index');
    expect(parseOpenApiSpec).toBeDefined();
  });

  describe('createClient', () => {
    it('should be exported', async () => {
      const { createClient } = await import('../index');
      expect(createClient).toBeDefined();
    });
  });
});
