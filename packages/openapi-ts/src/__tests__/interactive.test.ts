import { afterEach, describe, expect, it } from 'vitest';

import { detectInteractiveSession, initConfigs } from '~/config/init';
import { mergeConfigs } from '~/config/merge';
import { Logger } from '~/utils/logger';

describe('interactive config', () => {
  it('should use detectInteractiveSession when not provided', async () => {
    const result = await initConfigs({
      logger: new Logger(),
      userConfigs: [
        {
          input: 'test.json',
          output: './test',
        },
      ],
    });

    // In test environment, TTY is typically not available, so it should be false
    expect(result.results[0]?.config.interactive).toBe(false);
  });

  it('should respect user config when set to true', async () => {
    const result = await initConfigs({
      logger: new Logger(),
      userConfigs: [
        {
          input: 'test.json',
          interactive: true,
          output: './test',
        },
      ],
    });

    expect(result.results[0]?.config.interactive).toBe(true);
  });

  it('should respect user config when set to false', async () => {
    const result = await initConfigs({
      logger: new Logger(),
      userConfigs: [
        {
          input: 'test.json',
          interactive: false,
          output: './test',
        },
      ],
    });

    expect(result.results[0]?.config.interactive).toBe(false);
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

describe('detectInteractiveSession', () => {
  const originalEnv = process.env;
  const originalStdin = process.stdin;
  const originalStdout = process.stdout;

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process, 'stdin', { value: originalStdin });
    Object.defineProperty(process, 'stdout', { value: originalStdout });
  });

  it('should return false when CI environment variable is set', () => {
    process.env = { ...originalEnv, CI: 'true' };
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: true,
    });

    expect(detectInteractiveSession()).toBe(false);
  });

  it('should return false when NO_INTERACTIVE environment variable is set', () => {
    process.env = { ...originalEnv, NO_INTERACTIVE: '1' };
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: true,
    });

    expect(detectInteractiveSession()).toBe(false);
  });

  it('should return false when NO_INTERACTION environment variable is set', () => {
    process.env = { ...originalEnv, NO_INTERACTION: '1' };
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: true,
    });

    expect(detectInteractiveSession()).toBe(false);
  });

  it('should return false when stdin is not TTY', () => {
    process.env = { ...originalEnv };
    delete process.env.CI;
    delete process.env.NO_INTERACTIVE;
    delete process.env.NO_INTERACTION;
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: false,
    });
    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: true,
    });

    expect(detectInteractiveSession()).toBe(false);
  });

  it('should return false when stdout is not TTY', () => {
    process.env = { ...originalEnv };
    delete process.env.CI;
    delete process.env.NO_INTERACTIVE;
    delete process.env.NO_INTERACTION;
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: false,
    });

    expect(detectInteractiveSession()).toBe(false);
  });

  it('should return true when TTY is available and no blocking env vars are set', () => {
    process.env = { ...originalEnv };
    delete process.env.CI;
    delete process.env.NO_INTERACTIVE;
    delete process.env.NO_INTERACTION;
    Object.defineProperty(process.stdin, 'isTTY', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, 'isTTY', {
      configurable: true,
      value: true,
    });

    expect(detectInteractiveSession()).toBe(true);
  });
});
