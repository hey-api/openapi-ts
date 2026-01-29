import type { Mock } from 'vitest';

import { runCli } from '../cli';
import { createClient } from '../index';

vi.mock('../index', () => {
  const result: Awaited<ReturnType<typeof createClient>> = [];
  return {
    createClient: vi.fn().mockResolvedValue(result),
  };
});
const spyExit = vi.spyOn(process, 'exit').mockImplementation(() => ({}) as never);

const spy = createClient as Mock;

describe('cli', () => {
  beforeEach(() => {
    spy.mockClear();
    spyExit.mockClear();
  });

  it('with default options', async () => {
    const originalArgv = process.argv.slice();
    try {
      process.argv = [String(process.argv[0]), String(process.argv[1])];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spy).toHaveBeenCalledWith({
      logs: {
        file: true,
      },
    });
  });

  it('with minimal options', async () => {
    const originalArgv = process.argv.slice();
    try {
      process.argv = [
        String(process.argv[0]),
        String(process.argv[1]),
        '--input',
        'foo.json',
        '--output',
        'bar',
      ];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spy).toHaveBeenCalledWith({
      input: ['foo.json'],
      logs: {
        file: true,
      },
      output: ['bar'],
    });
  });

  it('with no plugins', async () => {
    const originalArgv = process.argv.slice();
    try {
      process.argv = [String(process.argv[0]), String(process.argv[1]), '--plugins'];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spy).toHaveBeenCalledWith({
      logs: {
        file: true,
      },
    });
  });

  it('with plugins', async () => {
    const originalArgv = process.argv.slice();
    try {
      process.argv = [String(process.argv[0]), String(process.argv[1]), '--plugins', 'foo'];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spy).toHaveBeenCalledWith({
      logs: {
        file: true,
      },
      plugins: ['foo'],
    });
  });

  it('with client plugin', async () => {
    const originalArgv = process.argv.slice();
    try {
      process.argv = [String(process.argv[0]), String(process.argv[1]), '--client', 'foo'];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spy).toHaveBeenCalledWith({
      logs: {
        file: true,
      },
      plugins: ['foo'],
    });
  });

  describe('logs', () => {
    it('debug', async () => {
      const originalArgv = process.argv.slice();
      try {
        process.argv = [String(process.argv[0]), String(process.argv[1]), '--debug'];
        await runCli();
      } finally {
        process.argv = originalArgv;
      }
      expect(spy).toHaveBeenCalledWith({
        logs: {
          file: true,
          level: 'debug',
        },
      });
    });

    it('silent', async () => {
      const originalArgv = process.argv.slice();
      try {
        process.argv = [String(process.argv[0]), String(process.argv[1]), '--silent'];
        await runCli();
      } finally {
        process.argv = originalArgv;
      }
      expect(spy).toHaveBeenCalledWith({
        logs: {
          file: true,
          level: 'silent',
        },
      });
    });

    it('no log file', async () => {
      const originalArgv = process.argv.slice();
      try {
        process.argv = [String(process.argv[0]), String(process.argv[1]), '--no-log-file'];
        await runCli();
      } finally {
        process.argv = originalArgv;
      }
      expect(spy).toHaveBeenCalledWith({
        logs: {
          file: false,
        },
      });
    });
  });

  it('with all options', async () => {
    const originalArgv = process.argv.slice();
    try {
      process.argv = [
        String(process.argv[0]),
        String(process.argv[1]),
        '--client',
        'foo',
        '--dry-run',
        'true',
        '--experimental-parser',
        'true',
        '--file',
        'bar',
        '--input',
        'baz',
        '--logs',
        'qux',
        '--output',
        'quux',
        '--plugins',
        '--watch',
      ];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spy).toHaveBeenCalledWith({
      configFile: 'bar',
      dryRun: true,
      input: ['baz'],
      logs: {
        file: true,
        path: 'qux',
      },
      output: ['quux'],
      plugins: ['foo'],
      watch: true,
    });
  });

  it('exits when not in watch mode', async () => {
    const originalArgv = process.argv.slice();
    try {
      process.argv = [String(process.argv[0]), String(process.argv[1])];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spyExit).toHaveBeenCalledWith(0);
  });

  it('does not exit in watch mode', async () => {
    spy.mockResolvedValueOnce([
      {
        config: { input: [{ watch: { enabled: true } }] },
      },
    ]);
    const originalArgv = process.argv.slice();
    try {
      process.argv = [String(process.argv[0]), String(process.argv[1])];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spyExit).not.toHaveBeenCalled();
  });

  it('exits with error code on error', async () => {
    spy.mockRejectedValueOnce('Some error');
    const originalArgv = process.argv.slice();
    try {
      process.argv = [String(process.argv[0]), String(process.argv[1])];
      await runCli();
    } finally {
      process.argv = originalArgv;
    }
    expect(spyExit).toHaveBeenCalledWith(1);
  });
});
