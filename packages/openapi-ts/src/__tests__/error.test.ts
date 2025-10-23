import { describe, expect, it, vi } from 'vitest';

import { shouldReportCrash } from '~/error';

describe('shouldReportCrash', () => {
  it('should return false when isInteractive is false', async () => {
    const result = await shouldReportCrash({
      error: new Error('test error'),
      isInteractive: false,
    });
    expect(result).toBe(false);
  });

  it('should return false when isInteractive is undefined', async () => {
    const result = await shouldReportCrash({
      error: new Error('test error'),
      isInteractive: undefined,
    });
    expect(result).toBe(false);
  });

  it('should not prompt when isInteractive is explicitly false', async () => {
    // Mock stdin and console.log to ensure we don't wait for user input
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const setEncodingSpy = vi
      .spyOn(process.stdin, 'setEncoding')
      .mockImplementation(() => process.stdin as any);
    const onceSpy = vi
      .spyOn(process.stdin, 'once')
      .mockImplementation(() => process.stdin);

    const result = await shouldReportCrash({
      error: new Error('test error'),
      isInteractive: false,
    });

    expect(result).toBe(false);
    expect(logSpy).not.toHaveBeenCalled();
    expect(setEncodingSpy).not.toHaveBeenCalled();
    expect(onceSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    setEncodingSpy.mockRestore();
    onceSpy.mockRestore();
  });

  it('should prompt when isInteractive is true', async () => {
    // Mock stdin and console.log for interactive session
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const setEncodingSpy = vi
      .spyOn(process.stdin, 'setEncoding')
      .mockImplementation(() => process.stdin as any);
    const onceSpy = vi
      .spyOn(process.stdin, 'once')
      .mockImplementation((_event, callback) => {
        // Simulate user typing 'n'
        setTimeout(() => {
          (callback as any)('n');
        }, 0);
        return process.stdin;
      });

    const result = await shouldReportCrash({
      error: new Error('test error'),
      isInteractive: true,
    });

    expect(result).toBe(false); // User said 'n'
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('📢 Open a GitHub issue with crash details?'),
    );

    logSpy.mockRestore();
    setEncodingSpy.mockRestore();
    onceSpy.mockRestore();
  });

  it('should handle user saying yes to crash report', async () => {
    // Mock stdin and console.log for interactive session
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const setEncodingSpy = vi
      .spyOn(process.stdin, 'setEncoding')
      .mockImplementation(() => process.stdin as any);
    const onceSpy = vi
      .spyOn(process.stdin, 'once')
      .mockImplementation((_event, callback) => {
        // Simulate user typing 'y'
        setTimeout(() => {
          (callback as any)('y');
        }, 0);
        return process.stdin;
      });

    const result = await shouldReportCrash({
      error: new Error('test error'),
      isInteractive: true,
    });

    expect(result).toBe(true); // User said 'y'

    logSpy.mockRestore();
    setEncodingSpy.mockRestore();
    onceSpy.mockRestore();
  });
});
