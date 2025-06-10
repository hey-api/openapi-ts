import fs from 'node:fs';
import path from 'node:path';

import colors from 'ansi-colors';

import { findPackageJson } from './generate/tsConfig';
import { ensureDirSync } from './generate/utils';

export const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

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

export const logCrashReport = (error: unknown, logsDir: string): string => {
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
};

export const openGitHubIssueWithCrashReport = async (error: unknown) => {
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

  const packageJson = findPackageJson();
  let bugsUrl: string | undefined;
  if (
    packageJson &&
    typeof packageJson === 'object' &&
    'bugs' in packageJson &&
    packageJson.bugs &&
    typeof packageJson.bugs === 'object' &&
    'url' in packageJson.bugs &&
    typeof packageJson.bugs.url === 'string'
  ) {
    bugsUrl = packageJson.bugs.url;
    if (bugsUrl && !bugsUrl.endsWith('/')) {
      bugsUrl += '/';
    }
  }

  if (bugsUrl) {
    const url = `${bugsUrl}new?${search.toString()}`;
    const open = (await import('open')).default;
    await open(url);
  }
};

export const printCrashReport = ({
  error,
  logPath,
}: {
  error: unknown;
  logPath: string | undefined;
}) => {
  const packageJson = findPackageJson();
  let name: string | undefined;
  if (
    packageJson &&
    typeof packageJson === 'object' &&
    'name' in packageJson &&
    typeof packageJson.name === 'string'
  ) {
    name = packageJson.name;
  }
  process.stderr.write(
    `\n🛑 ${colors.cyan(name || '')} ${colors.red('encountered an error.')}` +
      `\n\n${colors.red('❗️ Error:')} ${colors.white(typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error')}` +
      (logPath
        ? `\n\n${colors.cyan('📄 Crash log saved to:')} ${colors.gray(logPath)}`
        : ''),
  );
};

export const shouldReportCrash = async (): Promise<boolean> => {
  if (!isInteractive) {
    return false;
  }

  return new Promise((resolve) => {
    process.stdout.write(
      `${colors.yellow('\n\n📢 Open a GitHub issue with crash details?')} ${colors.yellow('(y/N):')}`,
    );
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data: string) => {
      resolve(data.trim().toLowerCase() === 'y');
    });
  });
};
