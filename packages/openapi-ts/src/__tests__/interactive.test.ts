import { describe, expect, it } from 'vitest';

import { initConfigs } from '../config/init';

describe('interactive config', () => {
  it('should default to false when not provided', async () => {
    const result = await initConfigs({
      input: 'test.json',
      output: './test',
    });

    expect(result.results[0].config.interactive).toBe(false);
  });

  it('should respect user config when set to true', async () => {
    const result = await initConfigs({
      input: 'test.json',
      interactive: true,
      output: './test',
    });

    expect(result.results[0].config.interactive).toBe(true);
  });

  it('should respect user config when set to false', async () => {
    const result = await initConfigs({
      input: 'test.json',
      interactive: false,
      output: './test',
    });

    expect(result.results[0].config.interactive).toBe(false);
  });
});
