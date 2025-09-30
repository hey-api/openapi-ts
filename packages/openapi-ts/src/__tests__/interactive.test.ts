import { describe, expect, it } from 'vitest';

import { initConfigs } from '../config/init';
import { mergeConfigs } from '../config/merge';

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

  it('should allow file config to set interactive when CLI does not provide it', () => {
    // This simulates what happens when:
    // 1. User has a config file with interactive: false
    // 2. CLI doesn't provide interactive (undefined)
    // 3. The bug was: bin script would set interactive = isInteractive (true in TTY)

    const fileConfig = {
      input: 'test.json',
      interactive: false,
      output: './test',
    };

    // CLI config without interactive (correct behavior after fix)
    const cliConfigWithoutInteractive = {
      input: 'test.json',
      output: './test',
    };

    // CLI config with interactive set to true (simulating the bug)
    const cliConfigWithInteractiveBug = {
      input: 'test.json',
      interactive: true,
      output: './test', // Bug: bin script was setting this even when user didn't provide it
    };

    // After fix: file config's interactive should be preserved
    const mergedCorrect = mergeConfigs(fileConfig, cliConfigWithoutInteractive);
    expect(mergedCorrect.interactive).toBe(false);

    // Before fix: CLI's auto-detected interactive would override file config
    const mergedWithBug = mergeConfigs(fileConfig, cliConfigWithInteractiveBug);
    expect(mergedWithBug.interactive).toBe(true); // This was the bug - it overrode the file config
  });
});
