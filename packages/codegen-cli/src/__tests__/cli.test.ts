import { runCli } from '../index';
import type { CliContext, RunCliOptions } from '../types';

const mockCreateClient = vi.fn<RunCliOptions['createClient']>().mockResolvedValue([]);
const spyExit = vi.spyOn(process, 'exit').mockImplementation(() => ({}) as never);

function makeOptions(): RunCliOptions {
  return {
    createClient: mockCreateClient,
    meta: {
      description: 'Test generator',
      name: 'test-cli',
      version: '0.0.0',
    },
  };
}

async function runWithArgv(args: Array<string>): Promise<void> {
  const originalArgv = process.argv.slice();
  try {
    process.argv = [process.argv[0]!, process.argv[1]!, ...args];
    await runCli(makeOptions());
  } finally {
    process.argv = originalArgv;
  }
}

describe('cli', () => {
  beforeEach(() => {
    mockCreateClient.mockClear();
    spyExit.mockClear();
  });

  it('with no args passes empty config', async () => {
    await runWithArgv([]);
    expect(mockCreateClient).toHaveBeenCalledWith({});
  });

  describe('input / output', () => {
    it('single input and output', async () => {
      await runWithArgv(['--input', 'foo.json', '--output', 'bar']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        input: 'foo.json',
        output: 'bar',
      });
    });

    it('multiple inputs via comma-separated', async () => {
      await runWithArgv(['--input', 'a.yaml,b.yaml,c.yaml']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        input: ['a.yaml', 'b.yaml', 'c.yaml'],
      });
    });

    it('multiple outputs via comma-separated', async () => {
      await runWithArgv(['--output', 'dist/ts,dist/py']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        output: ['dist/ts', 'dist/py'],
      });
    });

    it('-i and -o shorthands', async () => {
      await runWithArgv(['-i', 'spec.yaml', '-o', 'out']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        input: 'spec.yaml',
        output: 'out',
      });
    });
  });

  describe('plugins', () => {
    it('--plugins with no value is ignored', async () => {
      await runWithArgv(['--plugins']);
      expect(mockCreateClient).toHaveBeenCalledWith({});
    });

    it('single plugin', async () => {
      await runWithArgv(['--plugins', 'zod']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        plugins: ['zod'],
      });
    });

    it('multiple plugins via comma-separated', async () => {
      await runWithArgv(['--plugins', 'zod,@hey-api/sdk,@hey-api/typescript']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        plugins: ['zod', '@hey-api/sdk', '@hey-api/typescript'],
      });
    });

    it('--client appended to plugins', async () => {
      await runWithArgv(['--client', '@hey-api/client-fetch']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        plugins: ['@hey-api/client-fetch'],
      });
    });

    it('--client appended after --plugins', async () => {
      await runWithArgv(['--plugins', 'zod', '--client', '@hey-api/client-fetch']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        plugins: ['zod', '@hey-api/client-fetch'],
      });
    });
  });

  describe('logs', () => {
    it('--debug sets level', async () => {
      await runWithArgv(['--debug']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        logs: { level: 'debug' },
      });
    });

    it('--silent sets level', async () => {
      await runWithArgv(['--silent']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        logs: { level: 'silent' },
      });
    });

    it('--no-log-file disables file output', async () => {
      await runWithArgv(['--no-log-file']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        logs: { file: false },
      });
    });

    it('--logs sets path', async () => {
      await runWithArgv(['--logs', './logs']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        logs: { path: './logs' },
      });
    });
  });

  describe('watch', () => {
    it('--watch with no value enables watch', async () => {
      await runWithArgv(['--watch']);
      expect(mockCreateClient).toHaveBeenCalledWith({ watch: true });
    });

    it('-w shorthand enables watch', async () => {
      await runWithArgv(['-w']);
      expect(mockCreateClient).toHaveBeenCalledWith({ watch: true });
    });

    it('--watch with numeric interval', async () => {
      await runWithArgv(['--watch', '5000']);
      expect(mockCreateClient).toHaveBeenCalledWith({ watch: 5000 });
    });

    it('--watch with non-numeric value falls back to true', async () => {
      await runWithArgv(['--watch', 'invalid']);
      expect(mockCreateClient).toHaveBeenCalledWith({ watch: true });
    });
  });

  describe('other flags', () => {
    it('--dry-run', async () => {
      await runWithArgv(['--dry-run']);
      expect(mockCreateClient).toHaveBeenCalledWith({ dryRun: true });
    });

    it('--file sets configFile', async () => {
      await runWithArgv(['--file', 'openapi-ts.config.ts']);
      expect(mockCreateClient).toHaveBeenCalledWith({
        configFile: 'openapi-ts.config.ts',
      });
    });
  });

  it('with all options', async () => {
    await runWithArgv([
      '--client',
      '@hey-api/client-fetch',
      '--dry-run',
      '--file',
      'my.config.ts',
      '--input',
      'a.yaml,b.yaml',
      '--logs',
      './logs',
      '--output',
      'dist/ts,dist/py',
      '--plugins',
      'zod',
      '--watch',
      '3000',
    ]);
    expect(mockCreateClient).toHaveBeenCalledWith({
      configFile: 'my.config.ts',
      dryRun: true,
      input: ['a.yaml', 'b.yaml'],
      logs: { path: './logs' },
      output: ['dist/ts', 'dist/py'],
      plugins: ['zod', '@hey-api/client-fetch'],
      watch: 3000,
    });
  });

  describe('process.exit behaviour', () => {
    it('exits with 0 when not in watch mode', async () => {
      await runWithArgv([]);
      expect(spyExit).toHaveBeenCalledWith(0);
    });

    it('does not exit when watch mode is active', async () => {
      const context: CliContext = {
        config: { input: [{ watch: { enabled: true } }] },
      };
      mockCreateClient.mockResolvedValueOnce([context]);
      await runWithArgv([]);
      expect(spyExit).not.toHaveBeenCalled();
    });

    it('exits with 1 on generator error', async () => {
      mockCreateClient.mockRejectedValueOnce(new Error('boom'));
      await runWithArgv([]);
      expect(spyExit).toHaveBeenCalledWith(1);
    });
  });
});
