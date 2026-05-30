import { defineConfig } from '../normalize/config';
import type { Logs } from '../types/logs';

export const logsConfig = defineConfig<string | Logs | undefined, Logs>({
  $coerce: {
    string: (path) => ({ path }),
  },
  file: true,
  level: 'info',
  path: process.cwd(),
});

export function getLogs(input: string | Logs | undefined): Logs {
  return logsConfig(input);
}
