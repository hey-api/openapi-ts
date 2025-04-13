import { describe, expect, it } from 'vitest';

describe('internal entry index', () => {
  it('getSpec should be exported', async () => {
    const { getSpec } = await import('../internal');
    expect(getSpec).toBeDefined();
  });

  it('initConfigs should be exported', async () => {
    const { initConfigs } = await import('../internal');
    expect(initConfigs).toBeDefined();
  });

  it('parseOpenApiSpec should be exported', async () => {
    const { parseOpenApiSpec } = await import('../internal');
    expect(parseOpenApiSpec).toBeDefined();
  });
});
