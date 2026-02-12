import fs from 'node:fs';
import path from 'node:path';

import colors from 'ansi-colors';

import { ensureDirSync } from './fs';
import { loadPackageJson } from './tsConfig';

type IJobError = {
  error: Error;
  jobIndex: number;
};

/**
 * Represents a single configuration error.
 *
 * Used for reporting issues with a specific config instance.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Aggregates multiple config errors with their job indices for reporting.
 */
export class ConfigValidationError extends Error {
  readonly errors: ReadonlyArray<IJobError>;

  constructor(errors: Array<IJobError>) {
    super(`Found ${errors.length} configuration ${errors.length === 1 ? 'error' : 'errors'}.`);
    this.name = 'ConfigValidationError';
    this.errors = errors;
  }
}

/**
 * Represents a runtime error originating from a specific job.
 *
 * Used for reporting job-level failures that are not config validation errors.
 */
export class JobError extends Error {
  readonly originalError: IJobError;

  constructor(message: string, error: IJobError) {
    super(message);
    this.name = 'JobError';
    this.originalError = error;
  }
}

export class HeyApiError extends Error {
  args: ReadonlyArray<unknown>;
  event: string;
  pluginName: string;

  constructor({
    args,
    error,
    event,
    name,
    pluginName,
  }: {
    args: unknown[];
    error: Error;
    event: string;
    name: string;
    pluginName: string;
  }) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    super(message);

    this.args = args;
    this.cause = error.cause;
    this.event = event;
    this.name = name || error.name;
    this.pluginName = pluginName;
    this.stack = error.stack;
  }
}

export function logCrashReport(error: unknown, logsDir: string): string | undefined {
  if (error instanceof ConfigError || error instanceof ConfigValidationError) {
    return;
  }

  if (error instanceof JobError) {
    error = error.originalError.error;
  }

  const logName = `openapi-ts-error-${Date.now()}.log`;
  const fullDir = path.resolve(process.cwd(), logsDir);
  ensureDirSync(fullDir);
  const logPath = path.resolve(fullDir, logName);

  let logContent = `[${new Date().toISOString()}] `;

  if (error instanceof HeyApiError) {
    logContent += `${error.name} during event "${error.event}"\n`;
    if (error.pluginName) {
      logContent += `Plugin: ${error.pluginName}\n`;
    }
    logContent += `Arguments: ${JSON.stringify(error.args, null, 2)}\n\n`;
  }

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logContent += `Error: ${message}\n`;
  if (stack) {
    logContent += `Stack:\n${stack}\n`;
  }

  fs.writeFileSync(logPath, logContent);

  return logPath;
}

export async function openGitHubIssueWithCrashReport(
  error: unknown,
  initialDir: string,
): Promise<void> {
  const packageJson = loadPackageJson(initialDir);
  if (!packageJson?.bugs.url) return;

  if (error instanceof JobError) {
    error = error.originalError.error;
  }

  let body = '';

  if (error instanceof HeyApiError) {
    if (error.pluginName) {
      body += `**Plugin**: \`${error.pluginName}\`\n`;
    }
    body += `**Event**: \`${error.event}\`\n`;
    body += `**Arguments**:\n\`\`\`ts\n${JSON.stringify(error.args, null, 2)}\n\`\`\`\n\n`;
  }

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  body += `**Error**: \`${message}\`\n`;
  if (stack) {
    body += `\n**Stack Trace**:\n\`\`\`\n${stack}\n\`\`\``;
  }

  const search = new URLSearchParams({
    body,
    labels: 'bug 🔥',
    title: 'Crash Report',
  });
  const url = `${packageJson.bugs.url}new?${search.toString()}`;
  const open = (await import('open')).default;
  await open(url);
}

export function printCrashReport({
  error,
  logPath,
}: {
  error: unknown;
  logPath: string | undefined;
}): void {
  if (error instanceof ConfigValidationError && error.errors.length) {
    const groupByJob = new Map<number, Array<Error>>();
    for (const { error: err, jobIndex } of error.errors) {
      if (!groupByJob.has(jobIndex)) {
        groupByJob.set(jobIndex, []);
      }
      groupByJob.get(jobIndex)!.push(err);
    }

    for (const [jobIndex, errors] of groupByJob.entries()) {
      const jobPrefix = colors.gray(`[Job ${jobIndex + 1}] `);
      const count = errors.length;
      const baseString = colors.red(
        `Found ${count} configuration ${count === 1 ? 'error' : 'errors'}:`,
      );
      console.error(`${jobPrefix}❗️ ${baseString}`);
      errors.forEach((err, index) => {
        const itemPrefixStr = `  [${index + 1}] `;
        const itemPrefix = colors.red(itemPrefixStr);
        console.error(`${jobPrefix}${itemPrefix}${colors.white(err.message)}`);
      });
    }
  } else {
    let jobPrefix = colors.gray('[root] ');
    if (error instanceof JobError) {
      jobPrefix = colors.gray(`[Job ${error.originalError.jobIndex + 1}] `);
      error = error.originalError.error;
    }

    const baseString = colors.red('Failed with the message:');
    console.error(`${jobPrefix}❌ ${baseString}`);
    const itemPrefixStr = `  `;
    const itemPrefix = colors.red(itemPrefixStr);
    console.error(
      `${jobPrefix}${itemPrefix}${typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  if (logPath) {
    const jobPrefix = colors.gray('[root] ');
    console.error(`${jobPrefix}${colors.cyan('📄 Crash log saved to:')} ${colors.gray(logPath)}`);
  }
}

export async function shouldReportCrash({
  error,
  isInteractive,
}: {
  error: unknown;
  isInteractive: boolean | undefined;
}): Promise<boolean> {
  if (!isInteractive || error instanceof ConfigError || error instanceof ConfigValidationError) {
    return false;
  }

  return new Promise((resolve) => {
    const jobPrefix = colors.gray('[root] ');
    console.log(
      `${jobPrefix}${colors.yellow('📢 Open a GitHub issue with crash details? (y/N):')}`,
    );
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data: string) => {
      resolve(data.trim().toLowerCase() === 'y');
    });
  });
}
